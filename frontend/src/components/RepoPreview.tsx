import type { RepoInfo } from '../types';

/** 确认弹窗中的动态预览 — 使用用户实际仓库信息，按模板风格展示 */
export default function RepoPreview({ repoInfo, templateId }: { repoInfo: RepoInfo; templateId: string }) {
  const { name, description, language, owner, license } = repoInfo;
  switch (templateId) {
    case 'minimal':
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
    case 'badges':
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
    case 'enterprise':
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
    case 'cards':
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
    case 'showcase':
      return (
        <div className="w-full overflow-hidden rounded-md">
          <div className="flex h-10 items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 px-3">
            <span className="text-[9px] font-semibold tracking-wider text-white/80">
              {name.toUpperCase()}
            </span>
          </div>
          <div className="bg-white p-3">
            <p className="mb-1.5 text-[9px] leading-relaxed text-muted-600">{description}</p>
            <div className="mb-1.5 space-y-[2px] text-[8px]">
              <div className="text-emerald-600">
                <span className="mr-1">☑</span> {language || 'Core'} support
              </div>
              <div className="text-muted-400">
                <span className="mr-1 text-muted-300">☐</span> V3 plugin system
              </div>
              <div className="text-muted-400">
                <span className="mr-1 text-muted-300">☐</span> WebAssembly port
              </div>
            </div>
            <div className="border-t border-muted-100 pt-1 text-[8px] italic text-muted-400">
              "{description?.slice(0, 40) || 'Build something amazing.'}"
            </div>
          </div>
        </div>
      );
    case 'zh-type':
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
    case 'neo-minimal':
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
    default:
      return (
        <div className="w-full rounded-md bg-white p-3 text-[10px] text-muted-700">
          <div className="font-bold text-muted-900">{name}</div>
          <p className="text-muted-500">{description}</p>
        </div>
      );
  }
}
