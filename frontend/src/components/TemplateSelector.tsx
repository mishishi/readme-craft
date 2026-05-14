import { useApp } from '../context/AppContext';
import { templates } from '../templates';
import { CompactSkeleton } from './TemplateSkeleton';
import { trackEvent } from '../services/tracking';

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

export default function TemplateSelector() {
  const { state, dispatch } = useApp();

  return (
    <>
    <div id="template-selector" className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-[repeat(5,14rem)] lg:justify-center">
      {templates.map((t) => {
        const selected = state.selectedTemplate === t.id;
        const rec = t.recommendation;
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
          <div className={`flex flex-1 flex-col rounded-card border relative ${
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
                  <t.RepoPreview repoInfo={state.repoInfo} />
                ) : (
                  <t.Preview />
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
