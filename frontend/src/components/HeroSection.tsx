export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-primary-50/60">
      {/* 装饰发光圆点 */}
      <div className="glow-dot -left-36 -top-20 bg-primary-400" />
      <div className="glow-dot -bottom-32 -right-36 bg-primary-300" />

      <div className="relative mx-auto max-w-3xl px-4 pt-12 pb-8 text-center">
        {/* 标签 */}
        <div className="animate-fade-in-up">
          <span className="badge">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            AI 驱动的 README 生成器
          </span>
        </div>

        {/* 标题 */}
        <h1 className="mt-6 animate-fade-in-up-delay-1 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            AI 生成中文 README
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-in-up-delay-1 text-base leading-relaxed text-muted-500 sm:text-lg">
          输入仓库地址 · 选择模板 · 一分钟出稿
        </p>

        {/* 特性卡片 */}
        <div className="mt-10 grid animate-fade-in-up-delay-2 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              ),
              title: 'AI 智能生成',
              desc: '输入仓库地址，即刻生成',
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              ),
              title: '仓库智能分析',
              desc: '自动分析仓库结构与依赖',
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: '可视化编辑',
              desc: '所见即所得，实时预览',
            },
            {
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              ),
              title: '一键导出',
              desc: '复制或下载 Markdown',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group rounded-card border border-muted-200 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-muted-300 hover:shadow-card-hover"
            >
              <div className="mb-3 inline-flex rounded-button bg-primary-50 p-2 text-primary-600 ring-1 ring-primary-200/60 ring-inset transition-colors group-hover:bg-primary-100 group-hover:ring-primary-300">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-muted-900">{f.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
