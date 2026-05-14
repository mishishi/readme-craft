import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { assembleMarkdown } from '../services/markdown';
import { trackEvent } from '../services/tracking';

interface ActionBarProps {
  pulseDownload?: boolean;
}

export default function ActionBar({ pulseDownload }: ActionBarProps = {}) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [copying, setCopying] = useState(false);

  const getMarkdown = useCallback(
    () => assembleMarkdown(state.title, state.preamble, state.sections),
    [state.title, state.preamble, state.sections]
  );

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = useCallback(async () => {
    const text = getMarkdown();
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    // 确保 spinner 至少可见 300ms
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => {
      setCopying(false);
      trackEvent('readme_copied');
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: '已复制到剪贴板', type: 'success' },
      });
    }, 300);
  }, [getMarkdown, dispatch]);

  const handleDownload = useCallback(() => {
    const text = getMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title || 'README'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    trackEvent('readme_downloaded', { filename: `${state.title || 'README'}.md` });
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: 'README 已下载', type: 'success' },
    });
  }, [getMarkdown, state.repoInfo, dispatch]);

  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return (
    <div className="flex items-center gap-2">
      {/* 新建 — 重置所有状态回到首页 */}
      <button
        onClick={() => {
          dispatch({ type: 'RESET' });
          dispatch({ type: 'SHOW_TOAST', payload: { message: '已重置所有状态', type: 'success' } });
          navigate('/');
        }}
        className="btn-secondary px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0"
        title="重新开始 README"
        aria-label="重新开始 README"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75" />
        </svg>
      </button>
      <span className="h-5 w-px bg-muted-200" />
      {/* Undo */}
      <button
        onClick={() => dispatch({ type: 'UNDO' })}
        disabled={!canUndo}
        className="btn-secondary px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0"
        title="撤销（⌘Z）"
        aria-label="撤销（⌘Z）"
      >
        <svg className={`h-3.5 w-3.5 ${!canUndo ? 'opacity-30' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </button>
      {/* Redo */}
      <button
        onClick={() => dispatch({ type: 'REDO' })}
        disabled={!canRedo}
        className="btn-secondary px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0"
        title="重做（⌘⇧Z / ⌘Y）"
        aria-label="重做（⌘⇧Z / ⌘Y）"
      >
        <svg className={`h-3.5 w-3.5 ${!canRedo ? 'opacity-30' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
        </svg>
      </button>
      <span className="h-5 w-px bg-muted-200" />
      <button
        onClick={handleCopy}
        disabled={copying}
        className="btn-primary min-w-[7.5rem] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0"
        title="复制到剪贴板"
      >
        {copying ? (
          <svg className="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
        <span>复制</span>
      </button>
      <button
        onClick={handleDownload}
        data-shortcut="download"
        className={`btn-primary min-w-[7.5rem] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px] sm:min-h-0 ${pulseDownload ? 'animate-pulse ring-2 ring-primary-400' : ''}`}
        title="下载 README（Ctrl+S）"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        下载 .md
      </button>
    </div>
  );
}
