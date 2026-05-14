import type { TemplateDef, RepoInfo } from '../../types';

function ZhTypePreview() {
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
}

function ZhTypeRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, owner, license } = repoInfo;
  return (
    <div className="w-full overflow-hidden rounded-md font-sans leading-relaxed">
      <div className="p-2 text-[10px] text-amber-950">
        <div className="mb-1 text-xs font-bold text-amber-900 tracking-wide">{name}</div>
        <blockquote className="mb-1.5 border-l-2 border-amber-300 pl-2 text-[9px] italic leading-relaxed text-amber-700">
          {description?.slice(0, 40) || '项目定位描述'}
        </blockquote>
        <div className="mb-1.5 border-t border-amber-200 pt-1.5 text-[9px] font-medium text-amber-800">
          特性
        </div>
        <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-amber-700">
          <li><strong>模块化设计</strong> — 解耦清晰，易于扩展</li>
          <li><strong>类型安全</strong> — 完善的 TypeScript 类型推导</li>
          <li><strong>开发体验</strong> — 开箱即用，零配置启动</li>
        </ul>
        <div className="rounded bg-amber-100/80 p-1.5 font-mono text-[8px] text-amber-900">
          {language ? `${language.toLowerCase()} install ${name}` : 'npm install'}
        </div>
        <div className="mt-1.5 border-t border-amber-200 pt-1 text-[8px] text-amber-500">
          {license || 'MIT'} © {owner}
        </div>
      </div>
    </div>
  );
}

export const zhType: TemplateDef = {
  id: 'zh-type',
  name: '汉字风韵',
  description: '中文字体优化，温润琥珀色调，书法美学排版。适合中文优先的开源项目。',
  premium: true,
  recommendation: '中文优先 / 文档项目',
  preview: {
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    accent: 'bg-amber-500',
  },
  Preview: ZhTypePreview,
  RepoPreview: ZhTypeRepoPreview,
};
