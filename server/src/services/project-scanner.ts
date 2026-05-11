interface GitHubTreeItem {
  path: string;
  type: 'blob' | 'tree';
}

const cache = new Map<string, { data: string; expiresAt: number }>();
const CACHE_TTL = 10 * 60 * 1000;

function getCacheKey(owner: string, repo: string) {
  return `scan:${owner}/${repo}`;
}

function getFromCache(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchGitHubContent(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path ? encodeURIComponent(path) : ''}?ref=${encodeURIComponent(branch)}`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) || !data.content) return null;
    const cleaned = data.content.replace(/\n/g, '');
    return Buffer.from(cleaned, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

async function fetchGitHubTree(
  owner: string,
  repo: string,
  branch: string
): Promise<GitHubTreeItem[]> {
  try {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tree || [];
  } catch {
    return [];
  }
}

/** 要扫描的关键文件（对 README 生成最有价值） */
const KEY_FILES = [
  'package.json',
  'README.md',
  'README',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'Dockerfile',
  'Makefile',
  'tsconfig.json',
];

/**
 * Scan a GitHub repo's project files and return a structured context summary
 * for AI prompt injection. Uses caching and parallel fetching.
 */
export async function scanProject(
  owner: string,
  repo: string,
  branch: string
): Promise<string> {
  const cacheKey = getCacheKey(owner, repo);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const contextParts: string[] = [];
  contextParts.push('# 项目源码分析（用于 README 生成参考）');

  // 1. Get full file tree (needed first — subsequent fetches depend on path knowledge)
  const tree = await fetchGitHubTree(owner, repo, branch);
  const allPaths = new Set(tree.map((f) => f.path));
  const fileCount = tree.filter((f) => f.type === 'blob').length;

  if (fileCount > 0) {
    // Compact tree overview (depth 3)
    const treeLines: string[] = [];
    for (const item of tree) {
      const depth = item.path.split('/').length;
      if (depth <= 3 && !item.path.startsWith('.') && !item.path.includes('node_modules') && !item.path.includes('.git') && !item.path.includes('dist') && !item.path.includes('build')) {
        const indent = '  '.repeat(depth - 1);
        const icon = item.type === 'tree' ? '📁' : '📄';
        const name = item.path.split('/').pop();
        treeLines.push(`${indent}${icon} ${name}`);
      }
    }
    contextParts.push(`## 项目结构\n总文件数: ${fileCount}\n\`\`\`\n${treeLines.slice(0, 120).join('\n')}\n\`\`\``);
  }

  // 2. Detect project type from key files (sync, from tree)
  const projectType = [
    allPaths.has('package.json') && 'Node.js / JavaScript / TypeScript',
    allPaths.has('pyproject.toml') && 'Python',
    allPaths.has('Cargo.toml') && 'Rust',
    allPaths.has('go.mod') && 'Go',
  ].filter(Boolean).join(', ') || '其他';

  contextParts.push(`## 项目类型\n${projectType}`);

  // 3. Detect source directories (sync, from tree)
  const sourceDirs = ['src/', 'lib/', 'app/', 'cmd/'];
  const foundSrc = sourceDirs.filter((d) => allPaths.has(d) || [...allPaths].some((p) => p.startsWith(d)));
  if (foundSrc.length > 0) {
    contextParts.push(`## 源码目录\n${foundSrc.map((d) => `- ${d}`).join('\n')}`);
  }

  // 4. Fetch key files in parallel
  const fileResults = await Promise.all(
    KEY_FILES.map((path) =>
      allPaths.has(path) || (path === 'README' && [...allPaths].some((p) => p === 'README' || p.startsWith('README.')))
        ? fetchGitHubContent(owner, repo, path, branch).then((content) => ({ path, content }))
        : Promise.resolve({ path, content: null })
    )
  );

  // 5. Process fetched files
  for (const { path, content } of fileResults) {
    if (!content) continue;

    if (path === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        const lines: string[] = ['## package.json 分析'];
        if (pkg.name) lines.push(`- 包名: ${pkg.name}`);
        if (pkg.description) lines.push(`- 描述: ${pkg.description}`);
        if (pkg.version) lines.push(`- 版本: ${pkg.version}`);

        const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
        const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
        if (deps.length > 0) lines.push(`- 生产依赖 (${deps.length}): ${deps.join(', ')}`);
        if (devDeps.length > 0) lines.push(`- 开发依赖 (${devDeps.length}): ${devDeps.join(', ')}`);

        if (pkg.scripts) {
          lines.push('- 可用脚本:');
          for (const [name, cmd] of Object.entries(pkg.scripts)) {
            lines.push(`  - \`${name}\`: ${cmd}`);
          }
        }
        contextParts.push(lines.join('\n'));
      } catch {
        // skip invalid JSON
      }
    } else if (path === 'README.md' || path === 'README') {
      const truncated = content.length > 2000 ? content.slice(0, 2000) + '\n\n... (截断)' : content;
      contextParts.push(`## 现有 README\n${truncated}`);
    } else {
      // Config / manifest files
      contextParts.push(`## ${path}\n\`\`\`\n${content.slice(0, 800)}\n\`\`\``);
    }
  }

  const result = contextParts.join('\n\n');

  // Cache result
  cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });

  return result;
}
