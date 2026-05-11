interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  topics: string[];
  owner: { login: string };
  license: { spdx_id: string } | null;
  html_url: string;
  default_branch: string;
}

interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  owner: string;
  license: string | null;
  htmlUrl: string;
  defaultBranch: string;
}

// 内存缓存，TTL 10 分钟
const cache = new Map<string, { data: RepoInfo; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCacheKey(owner: string, repo: string) {
  return `${owner}/${repo}`;
}

function getFromCache(key: string): RepoInfo | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export async function fetchRepoInfo(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  const cacheKey = getCacheKey(owner, repo);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers }
  );

  if (res.status === 404) throw new Error('仓库未找到，请检查 URL 是否正确');
  if (res.status === 403) {
    const msg = token
      ? 'GitHub API 访问受限，请检查 GITHUB_TOKEN 权限'
      : 'GitHub API 请求过于频繁，请在 server/.env 中配置 GITHUB_TOKEN 以提升限额';
    throw new Error(msg);
  }
  if (!res.ok) throw new Error('获取仓库信息失败，请稍后重试');

  const d: GitHubRepo = await res.json();

  const info: RepoInfo = {
    name: d.name,
    fullName: d.full_name,
    description: d.description || '',
    language: d.language || '',
    stars: d.stargazers_count,
    topics: d.topics || [],
    owner: d.owner.login,
    license: d.license?.spdx_id || null,
    htmlUrl: d.html_url,
    defaultBranch: d.default_branch,
  };

  cache.set(cacheKey, { data: info, expiresAt: Date.now() + CACHE_TTL });
  return info;
}
