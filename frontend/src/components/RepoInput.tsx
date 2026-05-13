import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';
import { preScanProject } from '../services/api';
import { trackEvent } from '../services/tracking';

interface Props {
  disabled: boolean;
}

export default function RepoInput({ disabled }: Props) {
  const { state, dispatch } = useApp();
  const [localUrl, setLocalUrl] = useState(state.repoUrl);
  const preScanAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => preScanAbortRef.current?.abort();
  }, []);

  const isValidUrl = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(localUrl.trim());

  const handleFetch = useCallback(async (url?: string) => {
    const target = (url ?? localUrl).trim();
    if (!target) return;

    setLocalUrl(target);
    dispatch({ type: 'SET_REPO_URL', payload: target });
    dispatch({ type: 'FETCH_REPO_START' });
    trackEvent('repo_url_entered', { url: target });

    try {
      const info = await fetchRepoInfo(target);
      dispatch({ type: 'FETCH_REPO_SUCCESS', payload: info });
      trackEvent('repo_fetched', { fullName: info.fullName, language: info.language });
      // Background pre-scan for faster generation
      const parsed = info.fullName.split('/');
      if (parsed.length === 2) {
        preScanAbortRef.current?.abort();
        preScanAbortRef.current = new AbortController();
        preScanProject(parsed[0], parsed[1], info.defaultBranch, preScanAbortRef.current.signal);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取仓库信息失败';
      dispatch({
        type: 'FETCH_REPO_ERROR',
        payload: msg,
      });
      trackEvent('repo_fetch_failed', { url: target, error: msg });
    }
  }, [localUrl, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl) handleFetch();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="url"
            autoComplete="url"
            value={localUrl}
            onChange={(e) => setLocalUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入 GitHub 仓库地址，如 https://github.com/owner/repo"
            disabled={disabled}
            aria-label="GitHub 仓库地址"
            className={`input-field pr-10 ${state.repoError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {state.repoLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            </div>
          )}
          {!state.repoLoading && localUrl.trim() && !isValidUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" title="URL 格式不正确" aria-hidden="true">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">!</span>
            </div>
          )}
          {!state.repoLoading && localUrl.trim() && isValidUrl && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" title="URL 格式正确" aria-hidden="true">
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

        {state.repoError && (
          <p className="mt-2 text-sm text-red-500">{state.repoError}</p>
        )}
    </div>
  );
}
