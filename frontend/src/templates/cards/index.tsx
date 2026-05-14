import type { TemplateDef, RepoInfo } from '../../types';

function CardsPreview() {
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
}

function CardsRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, owner, license } = repoInfo;
  return (
    <div className="w-full rounded-md bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
      <div className="mb-1 flex items-center gap-1">
        <span className="text-[10px] font-bold text-muted-800">{name}</span>
      </div>
      <div className="mb-1 rounded border-l-2 border-emerald-400 bg-white px-2 py-1.5 shadow-sm">
        <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
          Highlights
        </div>
        <p className="mt-[2px] text-[8px] text-muted-500 leading-relaxed">{description}</p>
      </div>
      <div className="mb-1 rounded border-l-2 border-teal-400 bg-white px-2 py-1.5 shadow-sm">
        <div className="flex items-center gap-1 text-[9px] font-medium text-teal-700">
          Features
        </div>
        <p className="mt-[2px] text-[8px] text-muted-500 leading-relaxed">
          {language || 'Cross-platform'} · Zero config · Fast setup
        </p>
      </div>
      <div className="text-[8px] text-muted-600">
        <span className="font-medium text-muted-700">{owner}</span>
        <span className="mx-1 text-emerald-400">→</span>
        <span className="text-muted-500">{name}</span>
        <span className="mx-1 text-emerald-400">→</span>
        <span className="text-muted-500">{license || 'Open Source'}</span>
      </div>
    </div>
  );
}

export const cards: TemplateDef = {
  id: 'cards',
  name: '卡片视界',
  description: '卡片式布局，左侧色条强调，清新渐变。适合前端/设计项目。',
  recommendation: '前端 / 设计项目',
  preview: {
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
    accent: 'bg-emerald-500',
  },
  Preview: CardsPreview,
  RepoPreview: CardsRepoPreview,
};
