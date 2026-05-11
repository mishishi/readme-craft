import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';

const SAMPLE_REPO = 'https://github.com/chalk/chalk';

interface Props {
  disabled: boolean;
}

export default function RepoInput({ disabled }: Props) {
  const { state, dispatch } = useApp();
  const [localUrl, setLocalUrl] = useState(state.repoUrl);

  const isValidUrl = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(localUrl.trim());

  const handleFetch = useCallback(async (url?: string) => {
    const target = (url ?? localUrl).trim();
    if (!target) return;

    setLocalUrl(target);
    dispatch({ type: 'SET_REPO_URL', payload: target });
    dispatch({ type: 'FETCH_REPO_START' });

    try {
      const info = await fetchRepoInfo(target);
      dispatch({ type: 'FETCH_REPO_SUCCESS', payload: info });
    } catch (err) {
      dispatch({
        type: 'FETCH_REPO_ERROR',
        payload: err instanceof Error ? err.message : '获取仓库信息失败',
      });
    }
  }, [localUrl, dispatch]);

  const handleSample = useCallback(() => {
    handleFetch(SAMPLE_REPO);
  }, [handleFetch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl) handleFetch();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入 GitHub 仓库地址，如 https://github.com/owner/repo"
            disabled={disabled}
            className={`input-field pr-10 ${state.repoError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {state.repoLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          )}
          {!state.repoLoading && localUrl.trim() && !isValidUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" title="URL 格式不正确">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">!</span>
            </div>
          )}
          {!state.repoLoading && localUrl.trim() && isValidUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" title="URL 格式正确">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-500">✓</span>
            </div>
          )}
        </div>
        <button
          onClick={() => handleFetch()}
          disabled={disabled || state.repoLoading || !localUrl.trim()}
          className="btn-primary"
        >
          获取仓库信息
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={handleSample}
          disabled={disabled || state.repoLoading}
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/60 px-3 py-1 text-xs font-medium text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-100 hover:text-indigo-700 disabled:opacity-50"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          试示例仓库
        </button>

        {state.repoError && (
          <p className="text-sm text-red-500">{state.repoError}</p>
        )}
      </div>
    </div>
  );
}
