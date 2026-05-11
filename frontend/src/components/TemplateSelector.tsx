import { useApp } from '../context/AppContext';
import { templates } from '../templates';

/** 每个模板的视觉预览小样 — 展示实际排版风格 */
export function TemplatePreview({ id }: { id: string; accent?: string }) {
  switch (id) {
    case 'minimal':
      return (
        <div className="w-full rounded-md bg-white p-3">
          {/* Title */}
          <div className="mb-2 h-3 w-3/5 rounded bg-gray-800" />
          {/* Description */}
          <div className="mb-1.5 h-1.5 w-full rounded bg-gray-200" />
          <div className="mb-2 h-1.5 w-4/5 rounded bg-gray-200" />
          {/* Section heading */}
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-[7px]">📖</span>
            <div className="h-2 w-12 rounded bg-gray-700" />
          </div>
          {/* Feature items */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[6px]">✅</span>
              <div className="h-1.5 flex-1 rounded bg-blue-100" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[6px]">✅</span>
              <div className="h-1.5 flex-1 rounded bg-blue-50" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[6px]">✅</span>
              <div className="h-1.5 flex-1 rounded bg-blue-50" />
            </div>
          </div>
          {/* Code block hint */}
          <div className="mt-1.5 rounded bg-gray-100 p-1">
            <div className="h-1 w-10 rounded bg-gray-300" />
          </div>
        </div>
      );

    case 'badges':
      return (
        <div className="w-full rounded-md bg-white p-3">
          {/* Badge row */}
          <div className="mb-2 flex flex-wrap gap-0.5">
            <span className="rounded-sm bg-blue-500 px-1 py-[1px] text-[5px] font-medium text-white">v1.0.0</span>
            <span className="rounded-sm bg-green-500 px-1 py-[1px] text-[5px] font-medium text-white">build</span>
            <span className="rounded-sm bg-orange-500 px-1 py-[1px] text-[5px] font-medium text-white">MIT</span>
            <span className="rounded-sm bg-purple-500 px-1 py-[1px] text-[5px] font-medium text-white">95%</span>
            <span className="rounded-sm bg-cyan-500 px-1 py-[1px] text-[5px] font-medium text-white">react</span>
            <span className="rounded-sm bg-red-500 px-1 py-[1px] text-[5px] font-medium text-white">18x</span>
          </div>
          {/* Title */}
          <div className="mb-1.5 h-2.5 w-3/4 rounded bg-gray-800" />
          {/* Feature cards grid */}
          <div className="grid grid-cols-2 gap-1">
            <div className="rounded border border-gray-100 bg-gray-50 p-1.5">
              <div className="mb-0.5 h-1 w-6 rounded bg-amber-300" />
              <div className="h-1 rounded bg-gray-200" />
            </div>
            <div className="rounded border border-gray-100 bg-gray-50 p-1.5">
              <div className="mb-0.5 h-1 w-6 rounded bg-amber-300" />
              <div className="h-1 rounded bg-gray-200" />
            </div>
            <div className="rounded border border-gray-100 bg-gray-50 p-1.5">
              <div className="mb-0.5 h-1 w-6 rounded bg-amber-300" />
              <div className="h-1 rounded bg-gray-200" />
            </div>
            <div className="rounded border border-gray-100 bg-gray-50 p-1.5">
              <div className="mb-0.5 h-1 w-6 rounded bg-amber-300" />
              <div className="h-1 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      );

    case 'enterprise':
      return (
        <div className="w-full rounded-md bg-white">
          {/* Gradient header bar */}
          <div className="flex h-8 items-center justify-center rounded-t-md bg-gradient-to-r from-indigo-600 to-blue-600">
            <div className="h-2 w-24 rounded-full bg-white/30" />
          </div>
          {/* Content */}
          <div className="p-3 pt-2">
            <div className="mb-1.5 h-2.5 w-1/2 rounded bg-gray-800" />
            <div className="h-1 w-full rounded bg-gray-200" />
            <div className="mb-2 h-1 w-4/5 rounded bg-gray-200" />
            {/* Table */}
            <div className="space-y-0.5">
              <div className="flex gap-2">
                <div className="h-1.5 w-8 rounded bg-indigo-200" />
                <div className="h-1.5 flex-1 rounded bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-8 rounded bg-indigo-200" />
                <div className="h-1.5 flex-1 rounded bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <div className="h-1.5 w-8 rounded bg-indigo-200" />
                <div className="h-1.5 flex-1 rounded bg-gray-100" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'cards':
      return (
        <div className="w-full rounded-md bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
          {/* Title */}
          <div className="mb-1.5 h-2.5 w-2/3 rounded bg-gray-800" />
          {/* Card grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-emerald-200 bg-white p-2 shadow-sm">
              <div className="mb-0.5 h-1.5 w-6 rounded bg-emerald-400" />
              <div className="h-1 rounded bg-emerald-100" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-emerald-50" />
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white p-2 shadow-sm">
              <div className="mb-0.5 h-1.5 w-5 rounded bg-teal-400" />
              <div className="h-1 rounded bg-emerald-100" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-emerald-50" />
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white p-2 shadow-sm">
              <div className="mb-0.5 h-1.5 w-7 rounded bg-emerald-400" />
              <div className="h-1 rounded bg-emerald-100" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-emerald-50" />
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white p-2 shadow-sm">
              <div className="mb-0.5 h-1.5 w-4 rounded bg-teal-400" />
              <div className="h-1 rounded bg-emerald-100" />
              <div className="mt-0.5 h-1 w-3/4 rounded bg-emerald-50" />
            </div>
          </div>
        </div>
      );

    case 'showcase':
      return (
        <div className="w-full rounded-md">
          {/* Banner */}
          <div className="flex h-12 items-center justify-center rounded-t-md bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500">
            <div className="flex gap-2">
              <span className="h-1.5 w-4 rounded-full bg-white/40" />
              <span className="h-1.5 w-8 rounded-full bg-white/40" />
              <span className="h-1.5 w-4 rounded-full bg-white/40" />
            </div>
          </div>
          {/* Content */}
          <div className="bg-white p-3 pt-2">
            <div className="mb-1.5 h-3 w-3/5 rounded bg-gray-800" />
            <div className="mb-1 h-1 w-full rounded bg-gray-200" />
            <div className="mb-2 h-1 w-3/4 rounded bg-gray-200" />
            {/* Feature badges */}
            <div className="flex flex-wrap gap-1">
              <span className="rounded-full bg-violet-100 px-1.5 py-[1px] text-[6px] text-violet-700">Vue 3</span>
              <span className="rounded-full bg-purple-100 px-1.5 py-[1px] text-[6px] text-purple-700">TypeScript</span>
              <span className="rounded-full bg-pink-100 px-1.5 py-[1px] text-[6px] text-pink-700">Tailwind</span>
            </div>
            {/* Screenshot placeholder */}
            <div className="mt-1.5 rounded border border-dashed border-gray-200 bg-gray-50 p-2 text-center">
              <div className="mx-auto h-4 w-16 rounded bg-gradient-to-r from-violet-200 to-purple-200" />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

const recommendations: Record<string, string> = {
  minimal: '基础项目',
  badges: '开源项目',
  enterprise: '商业项目',
  cards: '前端项目',
  showcase: '作品展示',
};

export default function TemplateSelector() {
  const { state, dispatch } = useApp();

  return (
    <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {templates.map((t) => {
        const selected = state.selectedTemplate === t.id;
        const rec = recommendations[t.id];
        return (
          <button
            key={t.id}
            onClick={() => dispatch({ type: 'SELECT_TEMPLATE', payload: t.id })}
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
                <TemplatePreview id={t.id} accent={t.preview.accent} />
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
  );
}
