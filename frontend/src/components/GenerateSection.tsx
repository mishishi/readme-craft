import { useState, useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';

export default function GenerateSection() {
  const { state, dispatch } = useApp();
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.generating) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.generating]);

  const canGenerate = state.selectedTemplate && state.repoInfo;

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: 'SET_STEP', payload: 'template' });
  }, [dispatch]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTemplate || !state.repoInfo) return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    dispatch({ type: 'GENERATE_START' });
    setError(null);

    try {
      const markdown = await generateReadme({
        repoUrl: state.repoUrl,
        templateId: state.selectedTemplate,
        repoInfo: state.repoInfo,
      }, signal);

      const { sections } = parseSections(markdown);

      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: state.repoInfo.name,
          sections: sections.length > 0 ? sections : [
            { id: crypto.randomUUID(), heading: '简介', content: markdown },
          ],
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户取消，不做任何处理
      }
      const msg = err instanceof Error ? err.message : '生成失败';
      setError(msg);
      dispatch({ type: 'GENERATE_ERROR', payload: msg });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, dispatch]);

  return (
    <div className="mt-8 text-center">
      {state.generating ? (
        <div className="mx-auto max-w-sm rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-8 shadow-sm">
          {/* Pulse ring + spinner */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-200 opacity-30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
              <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>

          <p className="text-base font-medium text-indigo-800">正在生成 README...</p>
          <p className="mt-1.5 text-sm text-indigo-600/70 font-mono tabular-nums">
            已耗时 {elapsed} 秒
          </p>
          {elapsed >= 15 && (
            <p className="mt-2 text-xs text-amber-500">
              生成时间较长，请耐心等待...
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            首次生成稍慢，同一仓库再次生成会更快
          </p>
          <button
            onClick={handleCancel}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消生成
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={`btn-primary gap-3 px-8 py-3 text-base ${canGenerate && !state.generating ? 'animate-pulse shadow-lg shadow-indigo-200 hover:shadow-indigo-300' : ''}`}
          >
            <span>✨</span>
            AI 一键生成 README
          </button>

          {!state.selectedTemplate && (
            <p className="mt-2 text-sm text-gray-400">请先选择一个模板风格</p>
          )}
        </>
      )}

      {error && (
        <div className="mx-auto mt-3 flex max-w-md items-center gap-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          <span className="flex-1">{error}</span>
          <button
            onClick={handleGenerate}
            className="shrink-0 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
          >
            重试
          </button>
        </div>
      )}
    </div>
  );
}
