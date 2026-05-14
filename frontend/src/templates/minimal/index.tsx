import type { TemplateDef, RepoInfo } from '../../types';

function MinimalPreview() {
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
}

function MinimalRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, owner, license } = repoInfo;
  return (
    <div className="w-full rounded-md bg-white p-3 font-sans text-[10px] leading-relaxed text-muted-700">
      <div className="mb-1 text-xs font-bold text-muted-900">{name}</div>
      <p className="mb-1.5 text-[9px] leading-relaxed text-muted-500">{description}</p>
      <div className="mb-1.5 text-[9px]">
        <span className="font-medium text-muted-700">Features</span>
      </div>
      <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-muted-600">
        <li>Lightweight and fast</li>
        <li>Easy integration</li>
        <li>Developer friendly</li>
      </ul>
      <div className="rounded bg-muted-100 p-1.5 font-mono text-[8px] text-muted-700">
        {language ? `${language.toLowerCase()} install ${name}` : 'npm install'}
      </div>
      <div className="mt-1.5 border-t border-muted-100 pt-1 text-[8px] text-muted-400">
        {license || 'MIT'} © {owner}
      </div>
    </div>
  );
}

export const minimal: TemplateDef = {
  id: 'minimal',
  name: '极简清风',
  description: '干净、留白、排版至上。适合通用项目或工具库。',
  recommendation: '基础项目 / 工具库',
  preview: {
    gradient: 'from-slate-50 to-blue-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: 'bg-blue-500',
  },
  Preview: MinimalPreview,
  RepoPreview: MinimalRepoPreview,
};
