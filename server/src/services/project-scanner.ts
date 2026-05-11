interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;  // base64 encoded for files
  encoding?: string;
}

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

async function fetchGitHubContents(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<GitHubContent[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path ? encodeURIComponent(path) : ''}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  // If it's a single file, wrap in array
  if (!Array.isArray(data)) return [data];
  return data;
}

async function fetchGitHubFileText(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const items = await fetchGitHubContents(owner, repo, path, branch);
    const file = items[0];
    if (file?.type !== 'file' || !file.content) return null;
    // GitHub returns base64 with \n every 60 chars
    const cleaned = file.content.replace(/\n/g, '');
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
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data.tree || [];
}

/**
 * Scan a GitHub repo's project files and return a structured context summary
 * for AI prompt injection.
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

  // 1. Get full file tree (summarized)
  const tree = await fetchGitHubTree(owner, repo, branch);
  const allPaths = tree.map((f) => f.path);
  const fileCount = tree.filter((f) => f.type === 'blob').length;

  if (fileCount > 0) {
    // Build a compact tree-like overview (depth-limited to 3)
    const depthLimit = 3;
    const treeLines: string[] = [];

    for (const item of tree) {
      const depth = item.path.split('/').length;
      if (depth <= depthLimit && !item.path.startsWith('.') && !item.path.includes('node_modules') && !item.path.includes('.git') && !item.path.includes('dist') && !item.path.includes('build')) {
        const indent = '  '.repeat(depth - 1);
        const icon = item.type === 'tree' ? '📁' : '📄';
        const name = item.path.split('/').pop();
        treeLines.push(`${indent}${icon} ${name}`);
      }
    }

    contextParts.push(`## 项目结构\n总文件数: ${fileCount}\n\`\`\`\n${treeLines.slice(0, 120).join('\n')}\n\`\`\``);

    // 2. Detect project type from files
    const hasPackageJson = allPaths.includes('package.json');
    const hasPyproject = allPaths.includes('pyproject.toml');
    const hasCargo = allPaths.includes('Cargo.toml');
    const hasGoMod = allPaths.includes('go.mod');

    contextParts.push(`## 项目类型推断\n- 语言/框架: ${[
      hasPackageJson && 'Node.js/JavaScript/TypeScript',
      hasPyproject && 'Python',
      hasCargo && 'Rust',
      hasGoMod && 'Go',
    ].filter(Boolean).join(', ') || '其他'}`);
  }

  // 3. Parse package.json (the most valuable single file)
  const pkgJson = await fetchGitHubFileText(owner, repo, 'package.json', branch);
  if (pkgJson) {
    try {
      const pkg = JSON.parse(pkgJson);
      const sections: string[] = ['## package.json 分析'];

      if (pkg.name) sections.push(`- 包名: ${pkg.name}`);
      if (pkg.description) sections.push(`- 描述: ${pkg.description}`);
      if (pkg.version) sections.push(`- 版本: ${pkg.version}`);

      const deps = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
      const devDeps = pkg.devDependencies ? Object.keys(pkg.devDependencies) : [];
      const peerDeps = pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [];

      if (deps.length > 0) {
        sections.push(`- 生产依赖 (${deps.length}): ${deps.join(', ')}`);
      }
      if (devDeps.length > 0) {
        sections.push(`- 开发依赖 (${devDeps.length}): ${devDeps.join(', ')}`);
      }
      if (peerDeps.length > 0) {
        sections.push(`- 对等依赖 (${peerDeps.length}): ${peerDeps.join(', ')}`);
      }

      if (pkg.scripts) {
        sections.push('- 可用脚本:');
        for (const [name, cmd] of Object.entries(pkg.scripts)) {
          sections.push(`  - \`${name}\`: ${cmd}`);
        }
      }

      if (pkg.bin) {
        const bins = typeof pkg.bin === 'string' ? [pkg.bin] : Object.keys(pkg.bin);
        sections.push(`- CLI 入口: ${bins.join(', ')}`);
      }

      contextParts.push(sections.join('\n'));
    } catch {
      // Not valid JSON, skip
    }
  }

  // 4. Check for other manifest files
  for (const manifest of ['pyproject.toml', 'Cargo.toml', 'go.mod', 'composer.json', 'Gemfile']) {
    const content = await fetchGitHubFileText(owner, repo, manifest, branch);
    if (content) {
      contextParts.push(`## ${manifest} (前 800 字符)\n\`\`\`\n${content.slice(0, 800)}\n\`\`\``);
    }
  }

  // 5. Check for existing README
  const readmeFile = await fetchGitHubFileText(owner, repo, 'README.md', branch);
  if (readmeFile) {
    const truncated = readmeFile.length > 2000 ? readmeFile.slice(0, 2000) + '\n\n... (截断)' : readmeFile;
    contextParts.push(`## 现有 README 内容\n${truncated}`);
  } else {
    // Try README without extension
    const readmeRaw = await fetchGitHubFileText(owner, repo, 'README', branch);
    if (readmeRaw) {
      const truncated = readmeRaw.length > 2000 ? readmeRaw.slice(0, 2000) + '\n\n... (截断)' : readmeRaw;
      contextParts.push(`## 现有 README 内容\n${truncated}`);
    }
  }

  // 6. Look for key config files to understand the tech stack
  const configsToCheck = [
    'tsconfig.json', '.babelrc', '.eslintrc.js', '.eslintrc.json',
    'vite.config.ts', 'vite.config.js', 'next.config.js', 'nuxt.config.js',
    'tailwind.config.js', 'postcss.config.js', 'docker-compose.yml',
    'Makefile', 'Dockerfile',
  ];

  const configLines: string[] = ['## 配置文件发现'];
  for (const cfg of configsToCheck) {
    if (allPaths.includes(cfg)) {
      configLines.push(`- ${cfg}`);
      const content = await fetchGitHubFileText(owner, repo, cfg, branch);
      if (content && content.length < 1500) {
        configLines.push(`  \`\`\`\n  ${content.slice(0, 1000).replace(/\n/g, '\n  ')}\n  \`\`\``);
      }
    }
  }
  if (configLines.length > 1) {
    contextParts.push(configLines.join('\n'));
  }

  // 7. Detect entry points and source organization
  const sourcePatterns = ['src/', 'lib/', 'app/', 'source/', 'cmd/', 'internal/'];
  const foundSrcDirs: string[] = [];

  for (const pattern of sourcePatterns) {
    const hasSrc = allPaths.some((p) => p.startsWith(pattern));
    if (hasSrc) foundSrcDirs.push(pattern.replace('/', ''));
  }

  if (foundSrcDirs.length > 0) {
    const srcInfo: string[] = ['## 源码目录'];
    for (const dir of foundSrcDirs) {
      const files = allPaths.filter((p) => p.startsWith(dir + '/') && !p.includes('/'));
      srcInfo.push(`- ${dir}/: ${files.length} 个文件/目录`);
      // Show immediate children
      const subdirs = allPaths.filter((p) => {
        const rest = p.replace(dir + '/', '');
        return rest && !rest.includes('/');
      });
      if (subdirs.length > 0 && subdirs.length <= 15) {
        srcInfo.push(`  包含: ${subdirs.map((s) => s.replace(dir + '/', '')).join(', ')}`);
      }
    }
    contextParts.push(srcInfo.join('\n'));
  }

  // 8. Recognize main entry files
  const entryFiles = ['index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'cli.ts', 'cli.js'];
  const foundEntries = entryFiles.filter((f) => allPaths.includes(f) || allPaths.some((p) => p.endsWith('/' + f)));
  if (foundEntries.length > 0) {
    contextParts.push(`## 入口文件\n${foundEntries.map((f) => `- ${f}`).join('\n')}`);
  }

  const result = contextParts.join('\n\n');

  // Cache the result
  cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });

  return result;
}
