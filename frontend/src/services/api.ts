import type { RepoInfo } from '../types';
import { MOCK_README } from './mock';

interface GenerateRequest {
  repoUrl: string;
  templateId: string;
  repoInfo: RepoInfo;
  feedback?: string;
  variationSeed?: number;
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
    const status = res.status;
    let message = body.error || '';
    if (!message) {
      if (status === 429) message = '请求太频繁，请稍后再试';
      else if (status === 502 || status === 503) message = 'AI 服务暂时不可用，请稍后重试';
      else if (status >= 500) message = '服务器繁忙，请稍后重试';
      else message = `生成失败 (${status})`;
    }
    const error = new Error(message);
    (error as any).code = body.code;
    (error as any).retryAfter = body.retryAfter;
    (error as any).status = status;
    throw error;
  }

  const data: GenerateResponse = await res.json();
  return data.markdown;
}
