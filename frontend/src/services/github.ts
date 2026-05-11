import type { RepoInfo } from '../types';

export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const m = url.match(/(?:github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\/|\.git|$)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

export async function fetchRepoInfo(url: string): Promise<RepoInfo> {
  const parsed = parseGithubUrl(url);
  if (!parsed) throw new Error('GitHub 仓库地址格式不正确');

  const res = await fetch('/api/fetch-repo-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '获取仓库信息失败');
  }

  return res.json();
}
