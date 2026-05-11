import { useCallback, useState } from 'react';
import { useApp } from '../context/AppContext';
import { assembleMarkdown } from '../services/markdown';

export default function ActionBar() {
  const { state, dispatch } = useApp();
  const [copying, setCopying] = useState(false);

  const getMarkdown = useCallback(
    () => assembleMarkdown(state.title, state.sections),
    [state.title, state.sections]
  );

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
    setCopying(false);
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: '已复制到剪贴板', type: 'success' },
    });
    setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 4000);
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
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: 'README 已下载', type: 'success' },
    });
    setTimeout(() => dispatch({ type: 'DISMISS_TOAST' }), 4000);
  }, [getMarkdown, state.repoInfo, dispatch]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        disabled={copying}
        className="btn-secondary text-sm min-w-[4.5rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="复制到剪贴板"
      >
        {copying ? (
          <svg className="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          '📋'
        )}{' '}
        复制
      </button>
      <button
        onClick={handleDownload}
        data-shortcut="download"
        className="btn-primary text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="下载 README（Ctrl+S）"
      >
        ⬇️ 下载 .md
      </button>
    </div>
  );
}
