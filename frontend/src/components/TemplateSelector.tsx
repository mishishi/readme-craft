import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import RepoPreview from './RepoPreview';
import { CompactSkeleton } from './TemplateSkeleton';
import { trackEvent } from '../services/tracking';

/** 每个模板的 Markdown 风格预览 — 展示实际排版结构和视觉风格 */
export function TemplatePreview({ id }: { id: string; accent?: string }) {
  switch (id) {
    case 'minimal':
      return (
        <div className="w-full overflow-hidden rounded-md font-sans leading-relaxed">
          <div className="p-2 text-[10px] text-muted-700">
          <div className="mb-1 text-xs font-bold text-muted-900">Project Name</div>
          <p className="mb-1.5 text-[9px] leading-relaxed text-muted-500">
            Short description of what this project does and why it matters.
          </p>
          <div className="mb-1.5 text-[9px] text-muted-600">
            <span className="font-medium text-muted-700">Features</span>
          </div>
          <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-muted-600">
            <li>Fast and lightweight</li>
            <li>Easy to use API</li>
            <li>Cross-platform support</li>
          </ul>
          <div className="rounded bg-muted-100 p-1.5 font-mono text-[8px] text-muted-700">
            npm install project-name
          </div>
          <div className="mt-1.5 border-t border-muted-100 pt-1 text-[8px] text-muted-400">
            MIT © author
          </div>
        </div>
      </div>
      );

    case 'badges':
      return (
        <div className="w-full overflow-hidden rounded-md">
          <div className="p-2">
          <div className="mb-2 flex flex-wrap gap-[3px]">
            <span className="rounded-sm bg-[#f59e0b] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">version 1.0</span>
            <span className="rounded-sm bg-[#f43f5e] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">MIT</span>
            <span className="rounded-sm bg-[#ea580c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">TypeScript</span>
            <span className="rounded-sm bg-[#fb923c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">10k stars</span>
            <span className="rounded-sm bg-[#ef4444] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">passing</span>
            <span className="rounded-sm bg-[#f97316] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">90%</span>
            <span className="rounded-sm bg-[#eab308] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">ready</span>
          </div>
          <div className="mb-1.5">
            <div className="flex border-b border-muted-200 pb-1 text-[8px] font-semibold text-muted-600">
              <span className="w-1/3">特性</span>
              <span className="w-2/3">说明</span>
            </div>
            <div className="flex border-b border-muted-100 py-1 text-[8px] text-muted-500">
              <span className="w-1/3 font-medium text-muted-600">Fast</span>
              <span className="w-2/3">Sub-second rendering</span>
            </div>
            <div className="flex border-b border-muted-100 py-1 text-[8px] text-muted-500">
              <span className="w-1/3 font-medium text-muted-600">Simple</span>
              <span className="w-2/3">Zero config setup</span>
            </div>
            <div className="flex py-1 text-[8px] text-muted-500">
              <span className="w-1/3 font-medium text-muted-600">Hot</span>
              <span className="w-2/3">Live reload included</span>
            </div>
          </div>
          <div className="rounded bg-amber-50 p-1.5 text-[8px] text-amber-800">
            <span className="font-semibold">Stack:</span> React · TypeScript · Vite
          </div>
          </div>
        </div>
      );

    case 'enterprise':
      return (
        <div className="w-full overflow-hidden rounded-md">
          <div className="p-3 pt-2">
            <div className="mb-1.5 text-[10px] font-bold text-muted-900">Enterprise Dashboard</div>
            <div className="mb-2 overflow-hidden rounded border border-muted-200 text-[8px]">
              <div className="flex bg-primary-50 px-1.5 py-1 font-semibold text-primary-700">
                <span className="w-[34%]">Module</span>
                <span className="w-[33%]">Description</span>
                <span className="w-[33%]">Use Case</span>
              </div>
              <div className="flex border-t border-muted-100 px-1.5 py-1 text-muted-600">
                <span className="w-[34%] font-medium">Auth</span>
                <span className="w-[33%]">Auth system</span>
                <span className="w-[33%]">Login flow</span>
              </div>
              <div className="flex border-t border-muted-100 px-1.5 py-1 text-muted-600">
                <span className="w-[34%] font-medium">Cache</span>
                <span className="w-[33%]">Redis cache</span>
                <span className="w-[33%]">Performance</span>
              </div>
            </div>
            <div className="rounded bg-muted-900 p-1.5 font-mono text-[8px] text-green-400">
              npm install &amp;&amp; npm run build
            </div>
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="w-full overflow-hidden rounded-md">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-2">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[11px] font-bold text-muted-800">Package — 工具名称</span>
          </div>
          <div className="mb-1 rounded border-l-2 border-emerald-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
              Highlights
            </div>
            <p className="mt-[2px] text-[8px] text-muted-500 leading-relaxed">
              Clean API with modern toolchain integration.
            </p>
          </div>
          <div className="mb-1 rounded border-l-2 border-teal-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-teal-700">
              Features
            </div>
            <p className="mt-[2px] text-[8px] text-muted-500 leading-relaxed">
              Fully typed, well-tested, and actively maintained.
            </p>
          </div>
          <div className="text-[8px] text-muted-600">
            <span className="font-medium text-muted-700">Node.js</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-muted-500">npm</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-muted-500">CLI</span>
          </div>
          </div>
        </div>
      );

    case 'showcase':
      return (
        <div className="w-full overflow-hidden rounded-md">
          {/* Banner 条 */}
          <div className="flex h-10 items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 px-3">
            <span className="text-[9px] font-semibold tracking-wider text-white/80">
              PROJECT — Short Tagline
            </span>
          </div>
          {/* 内容 */}
          <div className="bg-white p-3">
            <p className="mb-1.5 text-[9px] leading-relaxed text-muted-600">
              This project started as a small idea and grew into something much bigger. Designed for modern workflows and developer experience.
            </p>
            {/* 路线图 */}
            <div className="mb-1.5 space-y-[2px] text-[8px]">
              <div className="text-muted-400">
                <span className="mr-1 inline-block h-3 w-3 rounded border border-muted-300 align-middle" />
                Roadmap item one
              </div>
              <div className="text-muted-400">
                <span className="mr-1 inline-block h-3 w-3 rounded border border-muted-300 align-middle" />
                Roadmap item two
              </div>
              <div className="text-emerald-600">
                <svg className="mr-0.5 inline-block h-3 w-3 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Shipped feature
              </div>
            </div>
            {/* 结束语 */}
            <div className="border-t border-muted-100 pt-1 text-[8px] italic text-muted-400">
              "Build something great."
            </div>
          </div>
        </div>
      );

    case 'zh-type':
      return (
        <div className="w-full overflow-hidden rounded-md font-sans leading-relaxed">
          <div className="p-2 text-[10px] text-amber-950">
            <div className="mb-1 text-xs font-bold text-amber-900 tracking-wide">项目名称</div>
            <blockquote className="mb-1.5 border-l-2 border-amber-300 pl-2 text-[9px] italic leading-relaxed text-amber-700">
              一句诗意的项目定位
            </blockquote>
            <div className="mb-1.5 border-t border-amber-200 pt-1.5 text-[9px] font-medium text-amber-800">
              特性
            </div>
            <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-amber-700">
              <li><strong>特性一</strong> — 简洁的功能描述</li>
              <li><strong>特性二</strong> — 简洁的功能描述</li>
              <li><strong>特性三</strong> — 简洁的功能描述</li>
            </ul>
            <div className="rounded bg-amber-100/80 p-1.5 font-mono text-[8px] text-amber-900">
              npm install 项目名称
            </div>
            <div className="mt-1.5 border-t border-amber-200 pt-1 text-[8px] text-amber-500">
              MIT © 作者
            </div>
          </div>
        </div>
      );

    case 'neo-minimal':
      return (
        <div className="w-full overflow-hidden rounded-md font-sans leading-relaxed">
          <div className="bg-slate-900 p-2 text-[10px] text-slate-300">
            <div className="mb-1 text-xs font-bold text-white tracking-tight">Project Name</div>
            <p className="mb-1.5 text-[9px] leading-relaxed text-slate-400 italic">
              One-line project description.
            </p>
            <div className="mb-1.5 flex flex-wrap gap-1">
              <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">Fast</span>
              <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">Typed</span>
              <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">Modern</span>
              <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">Reliable</span>
            </div>
            <div className="mb-1.5 rounded border border-slate-700 bg-slate-800 p-1.5 font-mono text-[8px] text-emerald-400">
              # Architecture flowchart placeholder
            </div>
            <div className="rounded border border-slate-700 bg-slate-800 p-1.5 font-mono text-[8px] text-slate-300">
              npm install &amp;&amp; npm start
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/** 预览中使用的星标图标 */
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function PremiumBadge() {
  return (
    <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-[2px] text-[8px] font-bold text-white shadow-sm">
      <StarIcon className="h-2.5 w-2.5" />
      PRO
    </span>
  );
}

const recommendations: Record<string, string> = {
  minimal: '基础项目 / 工具库',
  badges: '开源项目',
  enterprise: '商业 / 团队项目',
  cards: '前端 / 设计项目',
  showcase: '个人作品 / App',
  'zh-type': '中文优先 / 文档项目',
  'neo-minimal': '技术驱动 / 高端项目',
};

export default function TemplateSelector() {
  const { state, dispatch } = useApp();

  return (
    <>
    <div id="template-selector" className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(5,14rem)] lg:justify-center">
      {templates.map((t) => {
        const selected = state.selectedTemplate === t.id;
        const rec = recommendations[t.id];
        return (
          <button
            key={t.id}
            onClick={() => {
              dispatch({ type: 'SELECT_TEMPLATE', payload: t.id });
              if (!state.selectedTemplate) {
                dispatch({ type: 'SHOW_TOAST', payload: { message: `已选择「${t.name}」模板`, type: 'success' } });
              }
              trackEvent('template_selected', { templateId: t.id, templateName: t.name });
            }}
            className={`group relative flex flex-col p-0 text-left cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              selected ? 'animate-[scale-up_200ms_ease-out]' : ''
            }`}
          >
          <div className={`flex flex-1 flex-col rounded-card border-2 relative ${
            selected
              ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500/20'
              : 'border-muted-200 bg-white hover:border-primary-300 hover:shadow-lg hover:ring-1 hover:ring-primary-200'
          }`}>
            {/* Premium badge */}
            {t.premium && <PremiumBadge />}
            {/* 预览区域 */}
            <div className={`flex flex-1 flex-col rounded-t-[16px] bg-gradient-to-br ${t.preview.gradient} p-4 pb-3`}>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center text-primary-500">{t.preview.icon}</span>
                <span className={`text-[10px] font-semibold tracking-wider ${selected ? 'text-primary-600' : 'text-muted-500'}`}>
                  {t.name}
                </span>
              </div>
              <div className="mt-2 flex-1 overflow-hidden rounded-md">
                {state.repoLoading ? (
                  <CompactSkeleton />
                ) : state.repoInfo ? (
                  <RepoPreview repoInfo={state.repoInfo} templateId={t.id} />
                ) : (
                  <TemplatePreview id={t.id} accent={t.preview.accent} />
                )}
              </div>
            </div>

            {/* 信息区域 */}
            <div className="relative p-3 pt-2">
              <h3
                className={`text-sm font-semibold ${
                  selected ? 'text-primary-700' : 'text-muted-900'
                }`}
              >
                {t.name}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-500">
                {t.description}
              </p>
              {rec && (
                <span className="mt-1.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium text-primary-600">
                  推荐：{rec}
                </span>
              )}
              <span className="mt-1.5 block text-[9px] text-muted-300">
                AI 生成 · 仅供参考
              </span>
            </div>

            {selected && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white shadow-sm">
                ✓
              </div>
            )}
          </div>
          </button>
        );
      })}
    </div>

      {/* 严格模式开关 */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-3 rounded-card border border-muted-200 bg-white px-4 py-3 shadow-card">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-muted-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-sm font-medium text-muted-700">严谨模式</span>
        </div>
        <button
          role="switch"
          aria-checked={state.strictMode}
          onClick={() => dispatch({ type: 'SET_STRICT_MODE', payload: !state.strictMode })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ${
            state.strictMode ? 'bg-primary-600' : 'bg-muted-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              state.strictMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-xs text-muted-400">
          开启后 AI 将严格依据仓库信息生成，禁止编造和占位符内容
        </span>
      </div>
    </>
  );
}
