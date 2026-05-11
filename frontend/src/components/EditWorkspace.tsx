import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
import { trackEvent } from '../services/tracking';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import ActionBar from './ActionBar';

interface EditWorkspaceProps {
  fromGeneration?: boolean;
  onBack?: () => void;
}

export default function EditWorkspace({ fromGeneration: propFrom, onBack }: EditWorkspaceProps = {}) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const [tab, setTab] = useState<'editor' | 'preview'>(
    (propFrom ?? (location.state as Record<string, unknown>)?.fromGeneration) ? 'preview' : 'editor'
  );
  const [regenerating, setRegenerating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackCycle, setFeedbackCycle] = useState(0);

  const sectionCount = state.sections.length;
  const templateName = templates.find((t) => t.id === state.selectedTemplate)?.name;
  const totalChars = state.sections.reduce((sum, s) => sum + s.content.length, 0) + state.title.length;
  const readTimeMinutes = Math.max(1, Math.round(totalChars / 500));

  const fromGeneration = Boolean(propFrom ?? (location.state as Record<string, unknown>)?.fromGeneration);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);

  // Auto-dismiss feedback after 10s (resets on each feedback cycle)
  useEffect(() => {
    if (!fromGeneration) return;
    const timer = setTimeout(() => setFeedbackDismissed(true), 10_000);
    return () => clearTimeout(timer);
  }, [fromGeneration, feedbackCycle]);

  const handleRegenerate = useCallback(async (feedback?: string) => {
    if (!state.selectedTemplate || !state.repoInfo || regenerating) return;

    abortRef.current = new AbortController();
    setRegenerating(true);

    try {
      const markdown = await generateReadme({
        repoUrl: state.repoUrl,
        templateId: state.selectedTemplate,
        repoInfo: state.repoInfo,
        feedback,
      }, abortRef.current.signal);

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
        payload: { message: feedback ? '已根据反馈更新 README' : 'README 已重新生成', type: 'success' },
      });
      // 重新显示反馈条
      setFeedbackDismissed(false);
      setFeedbackCycle(c => c + 1);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: err instanceof Error ? err.message : '重新生成失败', type: 'error' },
      });
    } finally {
      setRegenerating(false);
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, regenerating, dispatch]);

  const handleFeedbackSubmit = useCallback(async () => {
    if (!feedbackText.trim() || regenerating) return;
    await handleRegenerate(feedbackText.trim());
    setFeedbackText('');
    setShowFeedbackInput(false);
  }, [feedbackText, regenerating, handleRegenerate]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
      {/* 生成反馈 — 迭代闭环 */}
      {fromGeneration && !feedbackDismissed && (
        <div className="border-b border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-gray-600">
          {!showFeedbackInput ? (
            /* 初始反馈按钮 */
            <div className="flex items-center justify-center gap-4">
              <span>这个 README 符合你的预期吗？</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    trackEvent('feedback', { rating: 'positive' });
                    setFeedbackDismissed(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.71 10.346 4.77 9.73 5.904 9.73c.583 0 1.131.128 1.62.352" />
                  </svg>
                  符合预期
                </button>
                <button
                  onClick={() => {
                    trackEvent('feedback', { rating: 'negative' });
                    setShowFeedbackInput(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.29 15.154 19.23 15.77 18.096 15.77c-.583 0-1.131-.128-1.62-.352m0 0a8.937 8.937 0 01-1.428-.882m0 0l-3.182-3.182m3.182 3.182l3.182-3.182m0 0a9.234 9.234 0 01-1.834-1.962m1.834 1.962l-1.834-1.962m-7.748 3.787l3.107-3.107m0 0l3.107-3.107M3.75 3.75l18 18" />
                  </svg>
                  需要改进
                </button>
              </div>
              <button
                onClick={() => setFeedbackDismissed(true)}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="关闭"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            /* 反馈输入区 */
            <div className="mx-auto max-w-xl">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-indigo-700">
                  请描述你希望改进的内容：
                </label>
                <span className="text-[10px] text-indigo-400">
                  基于你的反馈重新生成
                </span>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="例如：增加更多 API 使用示例、调整技术栈描述的顺序、添加贡献指南…"
                className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleFeedbackSubmit();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono text-[9px]">⌘↵</kbd> 快速发送
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowFeedbackInput(false); setFeedbackText(''); }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={regenerating || !feedbackText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {regenerating ? (
                      <>
                        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        生成中...
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        提交反馈并重新生成
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <span className="hidden sm:inline text-base">✏️</span>
            编辑工作区
          </h2>
          <span className="hidden rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600 ring-1 ring-indigo-100 sm:inline">
            {sectionCount} 章节
          </span>
        </div>

        {/* 移动端 Tab 切换 */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 sm:hidden">
          <button
            onClick={() => setTab('editor')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              tab === 'editor'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              tab === 'preview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            预览
          </button>
        </div>

        <ActionBar />

        {/* 重新生成按钮 */}
        <button
          onClick={() => handleRegenerate()}
          disabled={regenerating}
          className="ml-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          title="重新生成 README 内容"
        >
          {regenerating ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          )}
          {regenerating ? '生成中...' : '重新生成'}
        </button>
      </div>

      {/* 编辑 + 预览内容区 */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className={tab === 'editor' ? '' : 'hidden sm:block'}>
          <EditorPanel />
        </div>
        <div className={tab === 'preview' ? '' : 'hidden sm:block'}>
          <PreviewPanel />
        </div>
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-1 rounded-full bg-gray-300" />
            {sectionCount} 章节
          </span>
          {totalChars > 0 && (
            <>
              <span className="text-gray-200">|</span>
              <span>{totalChars} 字符</span>
            </>
          )}
        </div>
        <span className="hidden items-center gap-2 sm:flex">
          <span className="text-gray-200">|</span>
          <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] leading-none text-gray-400">⌘Z</kbd>
          <span className="text-xs text-gray-400">撤销</span>
          <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] leading-none text-gray-400">⌘⇧Z</kbd>
          <span className="text-xs text-gray-400">重做</span>
        </span>
        {templateName && (
          <span className="flex items-center gap-1.5">
            <span className="text-gray-200">模板</span>
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600">{templateName}</span>
          </span>
        )}
      </div>
    </div>
  );
}
