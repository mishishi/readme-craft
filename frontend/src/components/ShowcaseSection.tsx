import { useRef, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { fetchRepoInfo } from '../services/github';
import { preScanProject, generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
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
  const [generatingRepo, setGeneratingRepo] = useState<string | null>(null);

  const handleSelect = useCallback(async (item: ShowcaseItem) => {
    if (loadingRepo || generatingRepo) return;
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

      // Auto-trigger generation after fetch
      setLoadingRepo(null);
      setGeneratingRepo(item.repo);
      dispatch({ type: 'GENERATE_START' });
      trackEvent('generation_started', { templateId: item.template, repo: info.fullName });

      const markdown = await generateReadme({
        repoUrl: url,
        templateId: item.template,
        repoInfo: info,
      });

      const { preamble, sections } = parseSections(markdown);
      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: info.name,
          preamble,
          sections: sections.length > 0 ? sections : [
            { id: crypto.randomUUID(), heading: '简介', content: markdown },
          ],
        },
      });

      // Show result card & scroll
      dispatch({ type: 'SHOW_RESULT_CARD' });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: `已为 ${item.name} 生成 README`, type: 'success' },
      });
      trackEvent('generation_succeeded', {
        templateId: item.template,
        repo: info.fullName,
        sectionCount: sections.length,
      });

      setTimeout(() => {
        document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      // Don't treat abort as error
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : '获取仓库信息失败';
      dispatch({ type: 'FETCH_REPO_ERROR', payload: msg });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: msg, type: 'error' },
      });
      trackEvent('showcase_failed', { error: msg });
    } finally {
      setLoadingRepo(null);
      setGeneratingRepo(null);
    }
  }, [dispatch, loadingRepo, generatingRepo]);

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
          const isLoading = loadingRepo === item.repo || generatingRepo === item.repo;

          return (
            <button
              key={`${item.repo}-${item.template}`}
              onClick={() => handleSelect(item)}
              disabled={isLoading}
              className="w-56 shrink-0 snap-start rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-wait disabled:opacity-70"
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
                  {isLoading ? (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-medium text-indigo-600">
                      {loadingRepo === item.repo ? '获取中…' : '生成中…'}
                    </span>
                  ) : (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">
                      {item.template}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{item.description}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600">
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
                      选择此组合
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
