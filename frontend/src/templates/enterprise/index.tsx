import type { TemplateDef, RepoInfo } from '../../types';

function EnterprisePreview() {
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
}

function EnterpriseRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language, license } = repoInfo;
  return (
    <div className="w-full rounded-md bg-white">
      <div className="flex justify-center gap-1 border-b border-muted-200 bg-muted-50 px-3 py-2">
        <span className="rounded-sm bg-[#6366f1] px-1.5 py-[2px] text-[7px] font-medium text-white">v2.0</span>
        <span className="rounded-sm bg-[#3b82f6] px-1.5 py-[2px] text-[7px] font-medium text-white">build</span>
        <span className="rounded-sm bg-[#1e40af] px-1.5 py-[2px] text-[7px] font-medium text-white">{license || 'MIT'}</span>
      </div>
      <div className="p-3 pt-2">
        <div className="mb-1.5 text-[10px] font-bold text-muted-900">{name}</div>
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
          <div className="flex border-t border-muted-100 px-1.5 py-1 text-muted-600">
            <span className="w-[34%] font-medium">{language || 'API'}</span>
            <span className="w-[33%]">REST endpoint</span>
            <span className="w-[33%]">Integration</span>
          </div>
        </div>
        <div className="rounded bg-muted-900 p-1.5 font-mono text-[8px] text-green-400">
          npm install &amp;&amp; npm run build
        </div>
      </div>
    </div>
  );
}

export const enterprise: TemplateDef = {
  id: 'enterprise',
  name: '企业蓝图',
  description: '正式、结构化的表格布局，突出模块划分。适合商业/团队项目。',
  recommendation: '商业 / 团队项目',
  preview: {
    gradient: 'from-indigo-50 via-blue-50 to-sky-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    accent: 'bg-primary-600',
  },
  Preview: EnterprisePreview,
  RepoPreview: EnterpriseRepoPreview,
};
