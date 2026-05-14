import type { TemplateDef, RepoInfo } from '../../types';

function BadgesPreview() {
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
}

function BadgesRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, license } = repoInfo;
  return (
    <div className="w-full rounded-md bg-white p-3">
      <div className="mb-2 flex flex-wrap gap-[3px]">
        <span className="rounded-sm bg-[#f59e0b] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">version 1.0</span>
        <span className="rounded-sm bg-[#f43f5e] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">{license || 'MIT'}</span>
        <span className="rounded-sm bg-[#ea580c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">{language || 'JavaScript'}</span>
        <span className="rounded-sm bg-[#fb923c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">★ stars</span>
        <span className="rounded-sm bg-[#ef4444] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">passing</span>
        <span className="rounded-sm bg-[#f97316] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">92%</span>
        <span className="rounded-sm bg-[#eab308] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">ready</span>
      </div>
      <div className="mb-1.5">
        <div className="flex border-b border-muted-200 pb-1 text-[8px] font-semibold text-muted-600">
          <span className="w-1/3">特性</span>
          <span className="w-2/3">说明</span>
        </div>
        <div className="flex border-b border-muted-100 py-1 text-[8px] text-muted-500">
          <span className="w-1/3 font-medium text-amber-600">
            <svg className="mr-0.5 inline-block h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Fast
          </span>
          <span className="w-2/3">Sub-second response</span>
        </div>
        <div className="flex border-b border-muted-100 py-1 text-[8px] text-muted-500">
          <span className="w-1/3 font-medium text-orange-600">Simple</span>
          <span className="w-2/3">Zero config setup</span>
        </div>
        <div className="flex py-1 text-[8px] text-muted-500">
          <span className="w-1/3 font-medium text-rose-600">Hot</span>
          <span className="w-2/3">Live reload included</span>
        </div>
      </div>
      <div className="rounded bg-amber-50 p-1.5 text-[8px] text-amber-800">
        <span className="font-semibold">Stack:</span> {language || 'TypeScript'} · Node.js · Vite
      </div>
    </div>
  );
}

export const badges: TemplateDef = {
  id: 'badges',
  name: 'Badge 大满贯',
  description: '五颜六色的 badge 墙 + 功能卡片式布局。适合吸引眼球的开源项目。',
  recommendation: '开源项目',
  preview: {
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'bg-amber-500',
  },
  Preview: BadgesPreview,
  RepoPreview: BadgesRepoPreview,
};
