import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';

interface Props {
  disabled: boolean;
}

export default function RepoInput({ disabled }: Props) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [localUrl, setLocalUrl] = useState(state.repoUrl);

  const isValidUrl = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(localUrl.trim());

  const handleFetch = useCallback(async () => {
    if (!localUrl.trim()) return;

    dispatch({ type: 'SET_REPO_URL', payload: localUrl.trim() });
    dispatch({ type: 'FETCH_REPO_START' });

    try {
      const info = await fetchRepoInfo(localUrl.trim());
      dispatch({ type: 'FETCH_REPO_SUCCESS', payload: info });
      navigate('/templates');
    } catch (err) {
      dispatch({
        type: 'FETCH_REPO_ERROR',
        payload: err instanceof Error ? err.message : '获取仓库信息失败',
      });
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
          onClick={handleFetch}
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
