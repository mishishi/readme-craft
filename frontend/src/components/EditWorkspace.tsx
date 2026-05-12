import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
import { trackEvent } from '../services/tracking';
import { uuid } from '../utils/uuid';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import ActionBar from './ActionBar';
import FeedbackCard from './FeedbackCard';
import ShortcutHelpPanel from './ShortcutHelpPanel';

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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showFeedbackFloating, setShowFeedbackFloating] = useState(false);

  // 首次进入引导：下载按钮脉冲 + 快捷键提示
  useEffect(() => {
    if (!fromGeneration) return;
    setShowPulse(true);
    const t1 = setTimeout(() => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: '按 ⌘S 快速下载 · 按 ⌘? 查看快捷键', type: 'info' },
      });
    }, 1000);
    const t2 = setTimeout(() => setShowPulse(false), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [fromGeneration, dispatch]);

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
        variationSeed: feedback ? undefined : Date.now(),
        strictMode: state.strictMode,
      }, abortRef.current.signal);

      const { preamble, sections } = parseSections(markdown);
      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: state.repoInfo.name,
          preamble,
          sections: sections.length > 0 ? sections : [
            { id: uuid(), heading: '简介', content: markdown },
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
      if (err instanceof DOMException && err.name === 'AbortError') {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: '已取消生成', type: 'info' },
        });
        return;
      }
      const errMessage = err instanceof Error ? err.message : '重新生成失败';
      const errCode = (err as any).code;
      let userMessage = errMessage;
      if (errCode === 'RATE_LIMIT') {
        userMessage = '请求太频繁，请稍后再试';
      } else if (errCode === 'AUTH_ERROR') {
        userMessage = 'AI 服务配置异常，请联系管理员';
      }

      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: userMessage, type: 'error' },
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

        <ActionBar pulseDownload={showPulse} />

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

      {/* 新手引导提示 — 从生成跳转过来时显示 */}
      {fromGeneration && !feedbackDismissed && (
        <div className="border-b border-indigo-100 bg-indigo-50/80 px-4 py-2.5">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-xs text-indigo-700">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <span>在左侧编辑内容，或在右侧预览区底部<strong>「提修改意见」</strong>让 AI 帮你优化</span>
            </p>
            <button
              onClick={() => setFeedbackDismissed(true)}
              className="shrink-0 rounded p-0.5 text-indigo-400 transition-colors hover:text-indigo-600"
              aria-label="关闭提示"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 编辑 + 预览内容区 */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className={tab === 'editor' ? '' : 'hidden sm:block'}>
          <EditorPanel diffSectionIds={diffSectionIds} />
        </div>
        <div className={tab === 'preview' ? '' : 'hidden sm:block'}>
          <PreviewPanel />
        </div>
      </div>

      {/* 反馈 FAB — 悬浮在编辑区右下角，仅生成后显示 */}
      {fromGeneration && (
        <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-2">
          {showFeedbackFloating && (
            <div className="w-[calc(100vw-2rem)] sm:w-80 rounded-xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5">
              <div className="relative">
                <button
                  onClick={() => setShowFeedbackFloating(false)}
                  className="absolute right-2 top-2 z-10 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="关闭反馈面板"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="max-h-[70vh] overflow-y-auto">
                  <FeedbackCard
                    active={true}
                    dismissed={false}
                    onDismiss={() => {
                      trackEvent('feedback', { rating: 'positive' });
                      setShowFeedbackFloating(false);
                      dispatch({ type: 'SHOW_TOAST', payload: { message: '感谢反馈！我们会持续改进 ✨', type: 'success' } });
                    }}
                    showInput={showFeedbackInput}
                    onShowInput={() => setShowFeedbackInput(true)}
                    onHideInput={() => { setShowFeedbackInput(false); setFeedbackText(''); }}
                    inputText={feedbackText}
                    onInputChange={setFeedbackText}
                    lastFeedbackText={lastFeedbackText}
                    onRegenerate={() => handleRegenerate()}
                    onSubmitFeedback={handleFeedbackSubmit}
                    loading={regenerating}
                  />
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowFeedbackFloating((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
            title="反馈与重新生成"
            aria-label="反馈与重新生成"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          </button>
        </div>
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
          <button
            onClick={() => setShowShortcuts(true)}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white text-xs font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            title="查看全部快捷键"
            aria-label="快捷键帮助"
          >
            ?
          </button>
        </span>
        {templateName && (
          <span className="flex items-center gap-1.5">
            <span className="text-gray-200">模板</span>
            <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600">{templateName}</span>
          </span>
        )}
      </div>

      <ShortcutHelpPanel open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
