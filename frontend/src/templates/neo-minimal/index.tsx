import type { TemplateDef, RepoInfo } from '../../types';

function NeoMinimalPreview() {
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
}

function NeoMinimalRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, license } = repoInfo;
  return (
    <div className="w-full overflow-hidden rounded-md font-sans leading-relaxed">
      <div className="bg-slate-900 p-2 text-[10px] text-slate-300">
        <div className="mb-1 text-xs font-bold text-white tracking-tight">{name}</div>
        <p className="mb-1.5 text-[9px] leading-relaxed text-slate-400 italic">
          {description?.slice(0, 50) || 'Project description placeholder.'}
        </p>
        <div className="mb-1.5 flex flex-wrap gap-1">
          <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">{language || 'TypeScript'}</span>
          <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">Modern</span>
          <span className="rounded-sm border border-slate-600 px-1 py-[1px] text-[7px] font-medium text-slate-300">{license || 'MIT'}</span>
        </div>
        <div className="mb-1.5 rounded border border-slate-700 bg-slate-800 p-1.5 font-mono text-[8px] text-emerald-400">
          # {name} architecture
        </div>
        <div className="rounded border border-slate-700 bg-slate-800 p-1.5 font-mono text-[8px] text-slate-300">
          {language ? `${language.toLowerCase()} install ${name}` : 'npm install'}
        </div>
      </div>
    </div>
  );
}

export const neoMinimal: TemplateDef = {
  id: 'neo-minimal',
  name: '新极简',
  description: '暗色优雅风格，代码块点缀，前沿视觉感受。适合技术驱动的高端项目。',
  premium: true,
  recommendation: '技术驱动 / 高端项目',
  preview: {
    gradient: 'from-slate-800 via-slate-700 to-slate-900',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    accent: 'bg-emerald-500',
  },
  Preview: NeoMinimalPreview,
  RepoPreview: NeoMinimalRepoPreview,
};
