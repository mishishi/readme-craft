import type { TemplateDef, RepoInfo } from '../../types';

function ShowcasePreview() {
  return (
    <div className="w-full overflow-hidden rounded-md">
      <div className="flex h-10 items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 px-3">
        <span className="text-[9px] font-semibold tracking-wider text-white/80">
          PROJECT — Short Tagline
        </span>
      </div>
      <div className="bg-white p-3">
        <p className="mb-1.5 text-[9px] leading-relaxed text-muted-600">
          This project started as a small idea and grew into something much bigger. Designed for modern workflows and developer experience.
        </p>
        <div className="mb-1.5 space-y-[2px] text-[8px]">
          <div className="text-muted-400">
            <span className="mr-1 inline-block h-3 w-3 rounded border border-muted-300 align-middle" />
            Roadmap item one
          </div>
          <div className="text-muted-400">
            <span className="mr-1 inline-block h-3 w-3 rounded border border-muted-300 align-middle" />
            Roadmap item two
          </div>
          <div className="text-emerald-600">
            <svg className="mr-0.5 inline-block h-3 w-3 align-middle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Shipped feature
          </div>
        </div>
        <div className="border-t border-muted-100 pt-1 text-[8px] italic text-muted-400">
          &ldquo;Build something great.&rdquo;
        </div>
      </div>
    </div>
  );
}

function ShowcaseRepoPreview({ repoInfo }: { repoInfo: RepoInfo }) {
  const { name, description, language } = repoInfo;
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
          &ldquo;{description?.slice(0, 40) || 'Build something amazing.'}&rdquo;
        </div>
      </div>
    </div>
  );
}

export const showcase: TemplateDef = {
  id: 'showcase',
  name: '项目展厅',
  description: '高质量展示风格，大 Banner + 截图。适合个人作品/App。',
  recommendation: '个人作品 / App',
  preview: {
    gradient: 'from-primary-100 to-primary-50',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    accent: 'bg-primary-600',
  },
  Preview: ShowcasePreview,
  RepoPreview: ShowcaseRepoPreview,
};
