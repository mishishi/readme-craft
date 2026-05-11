import { useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';
import { preScanProject } from '../services/api';
import { templates } from '../templates';
import { TemplatePreview } from './TemplateSelector';
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

export default function ShowcaseSection() {
  const { state, dispatch } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingRepo, setLoadingRepo] = useState<string | null>(null);

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
      trackEvent('demo_repo_fetched', { fullName: info.fullName });

      // Pre-scan in background
      const [owner, repo] = info.fullName.split('/');
      if (owner && repo) {
        preScanProject(owner, repo, info.defaultBranch);
      }

      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: `已加载 ${item.name} 信息，选择模板后点击「生成 README」`, type: 'success' },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取仓库信息失败';
      dispatch({ type: 'FETCH_REPO_ERROR', payload: msg });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: msg, type: 'error' },
      });
    } finally {
      setLoadingRepo(null);
    }

    setTimeout(() => {
      document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [dispatch, loadingRepo]);

  return (
    <section className="mx-auto mt-10 max-w-5xl px-4">
      {/* 标题 */}
      <div className="mb-3 text-center">
        <h2 className="text-base font-semibold text-gray-900">
          看看热门项目用不同模板的效果
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          点击卡片快速填入仓库 + 选择模板，一键生成
        </p>
      </div>

      {/* 横向滚动卡片 */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {SHOWCASE_ITEMS.map((item) => {
          const template = templates.find((t) => t.id === item.template);
          if (!template) return null;

          return (
            <button
              key={`${item.repo}-${item.template}`}
              onClick={() => handleSelect(item)}
              className="w-56 shrink-0 snap-start rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {/* 预览区 — 轻量梯度背景 */}
              <div className={`rounded-t-xl bg-gradient-to-br ${template.preview.gradient} p-3`}>
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-base">{template.preview.icon}</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500">
                    {template.name}
                  </span>
                </div>
                <TemplatePreview id={item.template} />
              </div>

              {/* 信息区 */}
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                    {item.template}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 transition-colors hover:text-indigo-700">
                  选择此组合
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
