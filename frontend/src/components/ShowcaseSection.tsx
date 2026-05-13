import { useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';
import { templates } from '../templates';
import { TemplatePreview } from './TemplateSelector';
import { CompactSkeleton } from './TemplateSkeleton';
import { trackEvent } from '../services/tracking';

interface ShowcaseItem {
  repo: string;
  name: string;
  template: string;
  description: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  { name: 'chalk',   repo: 'chalk/chalk',        template: 'badges',    description: '终端字符串样式工具' },
  { name: 'lodash',  repo: 'lodash/lodash',       template: 'minimal',   description: 'JavaScript 实用工具库' },
  { name: 'express', repo: 'expressjs/express',   template: 'enterprise', description: 'Node.js Web 框架' },
  { name: 'axios',   repo: 'axios/axios',         template: 'cards',     description: '基于 Promise 的 HTTP 客户端' },
  { name: 'dayjs',   repo: 'iamkun/dayjs',        template: 'showcase',  description: '轻量级日期处理库' },
];

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export default function ShowcaseSection() {
  const { dispatch } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingRepo, setLoadingRepo] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const handleSelect = useCallback(async (item: ShowcaseItem) => {
    if (loadingRepo) return;
    setLoadingRepo(item.repo);

    const url = `https://github.com/${item.repo}`;
    dispatch({ type: 'SET_REPO_URL', payload: url });
    dispatch({ type: 'SELECT_TEMPLATE', payload: item.template });

    try {
      dispatch({ type: 'FETCH_REPO_START' });
      const info = await fetchRepoInfo(url);
      dispatch({ type: 'FETCH_REPO_SUCCESS', payload: info });
      trackEvent('showcase_repo_fetched', { fullName: info.fullName });

      // 折叠展示区并滚动到生成区域
      setCollapsed(true);
      setTimeout(() => {
        document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      if (isAbortError(err)) return;
      const msg = err instanceof Error ? err.message : '获取仓库信息失败';
      dispatch({ type: 'FETCH_REPO_ERROR', payload: msg });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: msg, type: 'error' },
      });
      trackEvent('showcase_failed', { error: msg });
    } finally {
      setLoadingRepo(null);
    }
  }, [dispatch, loadingRepo]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLButtonElement>('button');
    if (cards.length === 0) return;
    const currentIdx = Array.from(cards).indexOf(document.activeElement as HTMLButtonElement);
    const nextIdx = e.key === 'ArrowRight'
      ? Math.min(currentIdx + 1, cards.length - 1)
      : Math.max(currentIdx - 1, 0);
    cards[nextIdx]?.focus();
    cards[nextIdx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  if (collapsed) {
    return (
      <section className="mx-auto mt-10 max-w-5xl px-4">
        <div className="text-center">
          <button
            onClick={() => setCollapsed(false)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-400 transition-colors hover:text-muted-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6.75-6.75M12 19.5l6.75-6.75" />
            </svg>
            查看其他示例
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-10 max-w-5xl px-4">
      {/* 标题 */}
      <div className="mb-3 text-center">
        <h2 className="text-base font-semibold text-muted-900">
          快速体验
        </h2>
        <p className="mt-1 text-xs text-muted-400">
          选择一个热门项目，一键填入信息并生成 README
        </p>
      </div>

      {/* 横向滚动卡片 */}
      <div
        ref={scrollRef}
        role="list"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {SHOWCASE_ITEMS.map((item) => {
          const template = templates.find((t) => t.id === item.template);
          if (!template) return null;
          const isLoading = loadingRepo === item.repo;

          return (
            <button
              key={`${item.repo}-${item.template}`}
              role="listitem"
              tabIndex={-1}
              onClick={() => handleSelect(item)}
              disabled={isLoading}
              className="w-56 shrink-0 snap-start rounded-card border border-muted-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-wait disabled:opacity-70"
            >
              {/* 预览区 — 轻量梯度背景 */}
              <div className={`rounded-t-card bg-gradient-to-br ${template.preview.gradient} p-3`}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="flex items-center text-primary-500">{template.preview.icon}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-500">
                    {template.name}
                  </span>
                </div>
                {isLoading ? <CompactSkeleton /> : <TemplatePreview id={item.template} />}
              </div>

              {/* 信息区 */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-muted-900">{item.name}</span>
                  {isLoading ? (
                    <span className="rounded bg-primary-100 px-1.5 py-0.5 text-[9px] font-medium text-primary-600">
                      获取中…
                    </span>
                  ) : (
                    <span className="rounded bg-muted-100 px-1.5 py-0.5 text-[9px] font-medium text-muted-500">
                      {item.template}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-400">{item.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary-600">
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      加载中…
                    </span>
                  ) : (
                    <>
                      填入此组合
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                      </svg>
                    </>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
