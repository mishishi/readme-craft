import type { RepoInfo } from '../types';
import { MOCK_README } from './mock';

interface GenerateRequest {
  repoUrl: string;
  templateId: string;
  repoInfo: RepoInfo;
}

interface GenerateResponse {
  markdown: string;
}

// 设为 true 则使用 mock 数据，false 则调后端
const USE_MOCK = false;

export async function preScanProject(owner: string, repo: string, branch: string): Promise<void> {
  fetch('/api/pre-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner, repo, defaultBranch: branch }),
  }).catch(() => { /* background scan, ignore errors */ });
}

export async function generateReadme(req: GenerateRequest, signal?: AbortSignal): Promise<string> {
  if (USE_MOCK) {
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 1500));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const mock = MOCK_README[req.templateId];
    if (!mock) throw new Error('未找到对应的 mock 模板数据');
    return mock;
  }

  const res = await fetch('/api/generate-readme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `生成失败 (${res.status})`);
  }

  const data: GenerateResponse = await res.json();
  return data.markdown;
}
