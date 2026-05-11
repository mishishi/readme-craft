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
  const [diffSectionIds, setDiffSectionIds] = useState<Set<string>>(new Set());
  const [lastFeedbackText, setLastFeedbackText] = useState('');
  const prevSectionsRef = useRef<{ content: string }[]>([]);
  const postRegenSectionsRef = useRef<{ content: string }[]>([]);

  const sectionCount = state.sections.length;
  const templateName = templates.find((t) => t.id === state.selectedTemplate)?.name;
  const totalChars = state.sections.reduce((sum, s) => sum + s.content.length, 0) + state.title.length;
  const readTimeMinutes = Math.max(1, Math.round(totalChars / 500));

  const fromGeneration = Boolean(propFrom ?? (location.state as Record<string, unknown>)?.fromGeneration);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);

  const handleRegenerate = useCallback(async (feedback?: string) => {
    if (!state.selectedTemplate || !state.repoInfo || regenerating) return;

    prevSectionsRef.current = state.sections.map(s => ({ content: s.content }));
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
    setLastFeedbackText(feedbackText.trim());
    await handleRegenerate(feedbackText.trim());
    setFeedbackText('');
    setShowFeedbackInput(false);
  }, [feedbackText, regenerating, handleRegenerate]);

  // Diff highlighting: compare sections after regeneration completes
  useEffect(() => {
    if (feedbackCycle === 0 || prevSectionsRef.current.length === 0) {
      setDiffSectionIds(new Set());
      return;
    }
    const changed = new Set<string>();
    state.sections.forEach((s, i) => {
      if (i < prevSectionsRef.current.length && s.content !== prevSectionsRef.current[i].content) {
        changed.add(s.id);
      }
    });
    setDiffSectionIds(changed);
    // Save post-regeneration content for user-edit detection
    postRegenSectionsRef.current = state.sections.map(s => ({ content: s.content }));
  }, [feedbackCycle]);

  // Clear diff markers when user edits a section (content differs from post-regeneration state)
  useEffect(() => {
    if (diffSectionIds.size === 0 || postRegenSectionsRef.current.length === 0) return;

    state.sections.forEach(s => {
      const idx = state.sections.findIndex(p => p.id === s.id);
      const prevContent = postRegenSectionsRef.current[idx]?.content;
      if (prevContent !== undefined && prevContent !== s.content && diffSectionIds.has(s.id)) {
        setDiffSectionIds(prev => {
          const next = new Set(prev);
          next.delete(s.id);
          return next;
        });
      }
    });
  }, [state.sections, diffSectionIds]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-100">
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
          <EditorPanel diffSectionIds={diffSectionIds} />
        </div>
        <div className={tab === 'preview' ? '' : 'hidden sm:block'}>
          <PreviewPanel />
        </div>
      </div>

      {/* 生成反馈 — 迭代闭环（固定在内容区底部） */}
      {fromGeneration && !feedbackDismissed && (
        <div className="border-t border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-gray-600">
          {!showFeedbackInput ? (
            /* 三选项：满意 / 重新生成 / 提意见 */
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                这个 README 符合你的预期吗？
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    trackEvent('feedback', { rating: 'positive' });
                    setFeedbackDismissed(true);
                    dispatch({ type: 'SHOW_TOAST', payload: { message: '感谢反馈！我们会持续改进 ✨', type: 'success' } });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm transition-all hover:border-green-300 hover:bg-green-50 hover:shadow"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.71 10.346 4.77 9.73 5.904 9.73c.583 0 1.131.128 1.62.352" />
                  </svg>
                  很满意
                </button>
                <button
                  onClick={() => handleRegenerate()}
                  disabled={regenerating}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  {regenerating ? '生成中...' : '重新生成'}
                </button>
                <button
                  onClick={() => setShowFeedbackInput(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  提修改意见
                </button>
              </div>
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
              {/* 显示上一次的反馈内容，帮助建立上下文 */}
              {lastFeedbackText && (
                <div className="mb-2 rounded-md border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-600">
                  上次反馈：{lastFeedbackText}
                </div>
              )}
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
                  <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono text-[9px]">⌘↵</kbd> / <kbd className="rounded border border-gray-200 bg-white px-1 py-0.5 font-mono text-[9px]">Ctrl+Enter</kbd> 快速发送
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

      {/* 浮动反馈按钮 — 反馈栏 dismiss 后固定在右下角 */}
      {fromGeneration && feedbackDismissed && (
        <button
          onClick={() => { setFeedbackDismissed(false); setShowFeedbackInput(true); }}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          反馈
        </button>
      )}

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
