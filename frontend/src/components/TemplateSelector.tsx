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
        <div className="w-full rounded-md bg-white p-3 font-sans text-[10px] leading-relaxed text-gray-700">
          {/* 标题 — 纯文字，无装饰 */}
          <div className="mb-1 text-xs font-bold text-gray-900">chalk</div>
          <p className="mb-1.5 text-[9px] leading-relaxed text-gray-500">
            Terminal string styling with expressive API, zero dependencies.
          </p>
          {/* 特性列表 — 纯 Markdown dash 风格 */}
          <div className="mb-1.5 text-[9px] text-gray-600">
            <span className="font-medium text-gray-700">Features</span>
          </div>
          <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-gray-600">
            <li>Lightweight and fast</li>
            <li>Chainable API</li>
            <li>256-color support</li>
          </ul>
          {/* 代码块 — 灰色背景模拟 */}
          <div className="rounded bg-gray-100 p-1.5 font-mono text-[8px] text-gray-700">
            npm install chalk
          </div>
          {/* 许可证 — 小字 */}
          <div className="mt-1.5 border-t border-gray-100 pt-1 text-[8px] text-gray-400">
            MIT © sindresorhus
          </div>
        </div>
      );

    case 'badges':
      return (
        <div className="w-full rounded-md bg-white p-3">
          {/* Badge 墙 — 多彩颜色 */}
          <div className="mb-2 flex flex-wrap gap-[3px]">
            <span className="rounded-sm bg-[#f59e0b] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">version 1.0</span>
            <span className="rounded-sm bg-[#f43f5e] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">MIT</span>
            <span className="rounded-sm bg-[#ea580c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">TypeScript</span>
            <span className="rounded-sm bg-[#fb923c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">10k stars</span>
            <span className="rounded-sm bg-[#ef4444] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">passing</span>
            <span className="rounded-sm bg-[#f97316] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">90%</span>
            <span className="rounded-sm bg-[#eab308] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">ready</span>
          </div>
          {/* 表格 — 特性矩阵 */}
          <div className="mb-1.5">
            <div className="flex border-b border-gray-200 pb-1 text-[8px] font-semibold text-gray-600">
              <span className="w-1/3">特性</span>
              <span className="w-2/3">说明</span>
            </div>
            <div className="flex border-b border-gray-100 py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-amber-600">⚡ Fast</span>
              <span className="w-2/3">Sub-second rendering</span>
            </div>
            <div className="flex border-b border-gray-100 py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-orange-600">🎯 Simple</span>
              <span className="w-2/3">Zero config setup</span>
            </div>
            <div className="flex py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-rose-600">🔥 Hot</span>
              <span className="w-2/3">Live reload included</span>
            </div>
          </div>
          {/* 技术栈 */}
          <div className="rounded bg-amber-50 p-1.5 text-[8px] text-amber-800">
            <span className="font-semibold">Stack:</span> React · TypeScript · Vite
          </div>
        </div>
      );

    case 'enterprise':
      return (
        <div className="w-full rounded-md bg-white">
          {/* 居中 badge 行 */}
          <div className="flex justify-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <span className="rounded-sm bg-[#6366f1] px-1.5 py-[2px] text-[7px] font-medium text-white">v2.0</span>
            <span className="rounded-sm bg-[#3b82f6] px-1.5 py-[2px] text-[7px] font-medium text-white">build</span>
            <span className="rounded-sm bg-[#1e40af] px-1.5 py-[2px] text-[7px] font-medium text-white">MIT</span>
          </div>
          {/* 内容区 */}
          <div className="p-3 pt-2">
            <div className="mb-1.5 text-[10px] font-bold text-gray-900">Enterprise Dashboard</div>
            {/* 3 列表格 */}
            <div className="mb-2 overflow-hidden rounded border border-gray-200 text-[8px]">
              <div className="flex bg-indigo-50 px-1.5 py-1 font-semibold text-indigo-700">
                <span className="w-[34%]">Module</span>
                <span className="w-[33%]">Description</span>
                <span className="w-[33%]">Use Case</span>
              </div>
              <div className="flex border-t border-gray-100 px-1.5 py-1 text-gray-600">
                <span className="w-[34%] font-medium">Auth</span>
                <span className="w-[33%]">Auth system</span>
                <span className="w-[33%]">Login flow</span>
              </div>
              <div className="flex border-t border-gray-100 px-1.5 py-1 text-gray-600">
                <span className="w-[34%] font-medium">Cache</span>
                <span className="w-[33%]">Redis cache</span>
                <span className="w-[33%]">Performance</span>
              </div>
            </div>
            {/* 代码块 */}
            <div className="rounded bg-gray-900 p-1.5 font-mono text-[8px] text-green-400">
              npm install &amp;&amp; npm run build
            </div>
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="w-full rounded-md bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
          {/* 标题 + emoji */}
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[11px]">✨</span>
            <span className="text-[10px] font-bold text-gray-800">Chalk — 颜色工具</span>
          </div>
          {/* 引用块模拟卡片 */}
          <div className="mb-1 rounded border-l-2 border-emerald-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
              <span>🌟</span> Highlights
            </div>
            <p className="mt-[2px] text-[8px] text-gray-500 leading-relaxed">
              Expressive API with chainable methods for terminal colors.
            </p>
          </div>
          <div className="mb-1 rounded border-l-2 border-teal-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-teal-700">
              <span>🎯</span> Features
            </div>
            <p className="mt-[2px] text-[8px] text-gray-500 leading-relaxed">
              Supports 256 colors, true color, and nested styles.
            </p>
          </div>
          {/* 箭头技术栈列表 */}
          <div className="text-[8px] text-gray-600">
            <span className="font-medium text-gray-700">Node.js</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-gray-500">npm</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-gray-500">CLI</span>
          </div>
        </div>
      );

    case 'showcase':
      return (
        <div className="w-full overflow-hidden rounded-md">
          {/* Banner 条 */}
          <div className="flex h-10 items-center justify-center bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-3">
            <span className="text-[9px] font-semibold tracking-wider text-white/80">
              CHALK — Terminal Colors
            </span>
          </div>
          {/* 内容 */}
          <div className="bg-white p-3">
            {/* 叙事段落 */}
            <p className="mb-1.5 text-[9px] leading-relaxed text-gray-600">
              Chalk started as a small experiment to bring expressive colors to Node.js terminals. What began as a weekend project grew into one of the most beloved npm packages.
            </p>
            {/* 路线图 */}
            <div className="mb-1.5 space-y-[2px] text-[8px]">
              <div className="text-gray-400">
                <span className="mr-1 text-gray-300">☐</span> V3 plugin system
              </div>
              <div className="text-gray-400">
                <span className="mr-1 text-gray-300">☐</span> WebAssembly port
              </div>
              <div className="text-emerald-600">
                <span className="mr-1">☑</span> ESM support
              </div>
            </div>
            {/* 结束语 */}
            <div className="border-t border-gray-100 pt-1 text-[8px] italic text-gray-400">
              "Color your terminal, color your code."
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

const recommendations: Record<string, string> = {
  minimal: '基础项目 / 工具库',
  badges: '开源项目',
  enterprise: '商业 / 团队项目',
  cards: '前端 / 设计项目',
  showcase: '个人作品 / App',
};

export default function TemplateSelector() {
  const { state, dispatch } = useApp();

  return (
    <>
    <div id="template-selector" className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {templates.map((t) => {
        const selected = state.selectedTemplate === t.id;
        const rec = recommendations[t.id];
        return (
          <button
            key={t.id}
            onClick={() => {
              dispatch({ type: 'SELECT_TEMPLATE', payload: t.id });
              dispatch({ type: 'SHOW_TOAST', payload: { message: `已选择「${t.name}」模板`, type: 'success' } });
              trackEvent('template_selected', { templateId: t.id, templateName: t.name });
            }}
            className={`group relative overflow-hidden rounded-xl border-2 p-0 text-left transition-all duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              selected
                ? 'border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500/20 animate-[scale-up_200ms_ease-out]'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* 预览区域 */}
            <div className={`bg-gradient-to-br ${t.preview.gradient} p-4 pb-3`}>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{t.preview.icon}</span>
                <span className={`text-[10px] font-semibold tracking-wider ${selected ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {t.name}
                </span>
              </div>
              <div className="mt-2">
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
                  selected ? 'text-indigo-700' : 'text-gray-900'
                }`}
              >
                {t.name}
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                {t.description}
              </p>
              {rec && (
                <span className="mt-1.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                  推荐：{rec}
                </span>
              )}
              <span className="mt-1.5 block text-[9px] text-gray-300">
                AI 生成 · 仅供参考
              </span>
            </div>

            {/* 选中指示器 */}
            {selected && (
              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white shadow-sm">
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>

      {/* 严格模式开关 */}
      <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">严谨模式</span>
        </div>
        <button
          role="switch"
          aria-checked={state.strictMode}
          onClick={() => dispatch({ type: 'SET_STRICT_MODE', payload: !state.strictMode })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${
            state.strictMode ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              state.strictMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-xs text-gray-400">
          开启后 AI 将严格依据仓库信息生成，禁止编造和占位符内容
        </span>
      </div>
    </>
  );
}
