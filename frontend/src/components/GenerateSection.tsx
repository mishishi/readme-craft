import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
import { templates } from '../templates';
import { TemplatePreview } from './TemplateSelector';
import Modal from './Modal';
import { trackEvent } from '../services/tracking';

const STATUS_MESSAGES = [
  '正在分析仓库结构...',
  '正在提取项目信息...',
  '正在生成 README 内容...',
  '正在优化章节排版...',
];

export default function GenerateSection() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.generating) {
      setElapsed(0);
      setStatusIdx(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      statusTimerRef.current = setInterval(() => {
        setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    };
  }, [state.generating]);

  const canGenerate = state.selectedTemplate && state.repoInfo;

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    navigate('/');
  }, [dispatch, navigate]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTemplate || !state.repoInfo) return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    dispatch({ type: 'GENERATE_START' });
    setError(null);
    trackEvent('generation_started', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName });

    try {
      const markdown = await generateReadme({
        repoUrl: state.repoUrl,
        templateId: state.selectedTemplate,
        repoInfo: state.repoInfo,
      }, signal);

      const { preamble, sections } = parseSections(markdown);

      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: state.repoInfo.name,
          preamble,
          sections: sections.length > 0 ? sections : [
            { id: crypto.randomUUID(), heading: '简介', content: markdown },
          ],
        },
      });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'README 生成成功，已跳转到编辑页面', type: 'success' },
      });
      trackEvent('generation_succeeded', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName, sectionCount: sections.length });
      navigate('/editor', { state: { fromGeneration: true } });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户取消，不做任何处理
      }
      const msg = err instanceof Error ? err.message : '生成失败';
      setError(msg);
      dispatch({ type: 'GENERATE_ERROR', payload: msg });
      trackEvent('generation_failed', { templateId: state.selectedTemplate, repo: state.repoInfo?.fullName, error: msg });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, dispatch, navigate]);

  return (
    <div id="generate-section" className="mt-8 text-center">
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

          {/* 生成状态 — 每 3 秒循环切换文案 */}
          <p className="mb-4 text-sm font-medium text-indigo-700 transition-opacity">
            <span key={statusIdx} className="animate-fade-in-up inline-block">{STATUS_MESSAGES[statusIdx]}</span>
          </p>

          {/* 不确定进度条 */}
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
            <div className="h-full w-full origin-left animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>

          <p className="text-xs text-gray-400">
            已等待 {elapsed} 秒
            {elapsed >= 15 && <span className="text-amber-500"> · 生成时间较长，请耐心等待...</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
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

      {showConfirm && state.selectedTemplate && (() => {
        const template = templates.find((t) => t.id === state.selectedTemplate);
        return (
          <Modal
            open={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => { setShowConfirm(false); handleGenerate(); }}
            title="确认生成 README"
            confirmText="确认生成"
            hideIcon
            containerClassName="max-w-lg"
          >
            <p className="mb-4 text-sm text-gray-500">
              将使用「{template?.name || '未知'}」模板生成 README，确认开始？
            </p>

            {template && (
              <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <div className={`bg-gradient-to-br ${template.preview.gradient} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{template.preview.icon}</span>
                    <span className="text-sm font-semibold text-gray-600">{template.name}</span>
                  </div>
                  <div className="max-w-[260px]">
                    <TemplatePreview id={template.id} />
                  </div>
                </div>
                <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                  {template.description}
                </div>
              </div>
            )}
          </Modal>
        );
      })()}

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
              onClick={() => navigate('/')}
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
