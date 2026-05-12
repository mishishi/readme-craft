import { useState, useEffect } from 'react';
import { getHealth } from '../services/config';

export default function GitHubTokenWarning() {
  const [noToken, setNoToken] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getHealth().then((info) => {
      if (!info.githubTokenConfigured) setNoToken(true);
    });
  }, []);

  if (!noToken || dismissed) return null;

  return (
    <div className="mx-auto mt-3 max-w-2xl">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span className="flex-1">
          未配置 GITHUB_TOKEN，GitHub API 可能因限频失败。请在 <code className="rounded bg-amber-100 px-1">server/.env</code> 中添加。
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-0.5 text-amber-500 transition-colors hover:text-amber-700"
          aria-label="关闭"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
