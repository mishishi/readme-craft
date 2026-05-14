import { fetch as undiciFetch, ProxyAgent } from 'undici';

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const proxyDispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

/**
 * Proxy-aware fetch. 如果设置了 HTTPS_PROXY / HTTP_PROXY 环境变量，
 * 自动使用对应的代理，适用于本地开发环境中 ClashX 等代理工具。
 */
export async function proxiedFetch(url: string, options?: RequestInit): Promise<Response> {
  if (proxyDispatcher) {
    // ProxyAgent 仅 undici 支持；undici 类型与全局 fetch 不完全兼容，用 as 断言
    return undiciFetch(url, { ...(options as any), dispatcher: proxyDispatcher }) as Promise<Response>;
  }
  return fetch(url, options);
}
