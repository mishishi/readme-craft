import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
import { templates } from '../templates';
import { TemplatePreview } from './TemplateSelector';

function ConfirmModal({
  templateId,
  onConfirm,
  onCancel,
}: {
  templateId: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const template = templates.find((t) => t.id === templateId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => {
      const buttons = modalRef.current?.querySelectorAll<HTMLButtonElement>('button');
      if (buttons && buttons.length > 0) {
        buttons[buttons.length - 1]?.focus(); // 聚焦"确认生成"
      }
    });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="确认生成 README"
    >
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-gray-900">确认生成 README</h3>
        <p className="mb-4 text-sm text-gray-500">
          将使用「{template?.name || '未知'}」模板生成 README，确认开始？
        </p>

        {/* 放大的预览 */}
        {template && (
          <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className={`bg-gradient-to-br ${template.preview.gradient} p-6 pb-4`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{template.preview.icon}</span>
                <span className="text-sm font-semibold text-gray-600">{template.name}</span>
              </div>
              <div className="scale-[1.8] origin-top-left opacity-80">
                <div className="w-[200px]">
                  <TemplatePreview id={template.id} />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
              {template.description}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm">取消</button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            确认生成
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GenerateSection() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);
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
    navigate('/templates');
  }, [dispatch, navigate]);

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
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'README 生成成功，已跳转到编辑页面', type: 'success' },
      });
      navigate('/editor', { state: { fromGeneration: true } });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户取消，不做任何处理
      }
      const msg = err instanceof Error ? err.message : '生成失败';
      setError(msg);
      dispatch({ type: 'GENERATE_ERROR', payload: msg });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, dispatch, navigate]);

  return (
    <div className="mt-8 text-center">
      {state.generating ? (
        <div className="mx-auto max-w-sm rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-8 shadow-sm">
          {/* Spinner */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-200 opacity-30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
              <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>

          {/* Progress steps */}
          <div className="space-y-3 text-left">
            {[
              { label: '分析仓库信息', min: 0 },
              { label: '生成 README 内容', min: 3 },
              { label: '格式化排版', min: 8 },
            ].map((step, i) => {
              const thresholds = [1, 4, 8];
              const prevDone = elapsed >= thresholds[i];
              const curActive = elapsed >= thresholds[i] && (i === 2 || elapsed < thresholds[i + 1]);

              return (
                <div key={step.label} className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                    curActive
                      ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                      : prevDone
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-300'
                  }`}>
                    {prevDone && !curActive ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    curActive ? 'font-medium text-indigo-700' : prevDone ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {curActive && (
                    <span className="ml-auto flex gap-0.5">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '0ms' }} />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '150ms' }} />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-400" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {elapsed >= 15 && (
            <p className="mt-4 text-xs text-amber-500">
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
            onClick={() => setShowConfirm(true)}
            disabled={!canGenerate}
            className={`btn-primary gap-3 px-8 py-3 text-base ${canGenerate && !state.generating ? 'shadow-lg shadow-indigo-200 hover:shadow-indigo-300' : ''} ${canGenerate && !state.generating && showPulse ? 'animate-pulse' : ''}`}
          >
            <span>✨</span>
            AI 一键生成 README
          </button>

          {!state.selectedTemplate && (
            <p className="mt-2 text-sm text-gray-400">请先选择一个模板风格</p>
          )}
        </>
      )}

      {showConfirm && state.selectedTemplate && (
        <ConfirmModal
          templateId={state.selectedTemplate}
          onConfirm={() => {
            setShowConfirm(false);
            handleGenerate();
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {error && (
        <div className="mx-auto mt-3 max-w-md">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <span className="flex-1">{error}</span>
            <button
              onClick={handleGenerate}
              className="shrink-0 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              重试
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
            <button
              onClick={() => navigate('/templates')}
              className="transition-colors hover:text-indigo-500"
            >
              切换其他模板
            </button>
            {state.sections.length > 0 && (
              <button
                onClick={() => navigate('/editor')}
                className="transition-colors hover:text-indigo-500"
              >
                返回编辑
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
