export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* 装饰发光圆点 */}
      <div className="glow-dot -left-36 -top-20 bg-indigo-400" />
      <div className="glow-dot -bottom-32 -right-36 bg-purple-400" />

      <div className="relative mx-auto max-w-3xl px-4 pt-16 pb-10 text-center">
        {/* 标签 */}
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            AI 驱动的 README 生成器
          </span>
        </div>

        {/* 标题 */}
        <h1 className="mt-6 animate-fade-in-up-delay-1 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            README 智造工坊
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl animate-fade-in-up-delay-1 text-base leading-relaxed text-gray-500 sm:text-lg">
          输入仓库地址，选择心仪模板，AI 即刻生成优雅专业的中文 README。
          <br />
          告别枯燥编写，拥抱高效创作。
        </p>

        {/* 特性标签 */}
        <div className="mt-8 flex animate-fade-in-up-delay-2 flex-wrap items-center justify-center gap-3">
          {[
            { label: '⚡ 秒级生成', tooltip: 'AI 快速生成' },
            { label: '🎨 5 款精美模板', tooltip: '多种视觉风格' },
            { label: '📝 可视化编辑', tooltip: '所见即所得' },
            { label: '📋 一键导出', tooltip: '复制 / 下载 MD' },
          ].map((f) => (
            <span
              key={f.label}
              className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md"
              title={f.tooltip}
            >
              {f.label}
            </span>
          ))}
        </div>

        {/* 装饰性代码卡片 */}
        <div className="mt-10 animate-fade-in-up-delay-2 flex justify-center">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-xl shadow-indigo-500/5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-gray-400">README.md</span>
            </div>
            <div className="space-y-2 p-4 text-left text-sm leading-relaxed">
              <div className="typing-animate font-mono">
                <span className="text-gray-400"># </span>
                <span className="font-semibold text-gray-800">awesome-tool</span>
              </div>
              <div className="animate-fade-in-up font-mono text-gray-500" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
                <span className="text-indigo-500">{'> '}</span>
                <span>一个简洁高效的命令行工具</span>
              </div>
              <div className="animate-fade-in-up font-mono text-gray-400" style={{ animationDelay: '1.6s', animationFillMode: 'both' }}>
                <span className="text-indigo-400">##</span>{' '}
                <span className="text-gray-600">📦 安装</span>
              </div>
              <div className="animate-fade-in-up flex gap-2" style={{ animationDelay: '2s', animationFillMode: 'both' }}>
                <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                  npm install awesome-tool
                </span>
              </div>
              <div className="animate-fade-in-up font-mono text-gray-400" style={{ animationDelay: '2.4s', animationFillMode: 'both' }}>
                <span className="text-indigo-400">##</span>{' '}
                <span className="text-gray-600">🚀 使用</span>
              </div>
            </div>
          </div>
        </div>

        {/* 步骤引导 */}
        <div className="mt-14 animate-fade-in-up grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          {[
            { num: '01', title: '输入仓库地址', desc: '粘贴 GitHub 仓库链接，自动获取项目信息', color: 'text-indigo-500', bar: 'bg-indigo-500' },
            { num: '02', title: '选择模板风格', desc: '5 款精心设计的模板，总有一款适合你', color: 'text-purple-500', bar: 'bg-purple-500' },
            { num: '03', title: 'AI 生成并编辑', desc: 'AI 生成内容，可视化编辑，一键复制导出', color: 'text-pink-500', bar: 'bg-pink-500' },
          ].map((step, i) => (
            <div key={step.num} className="group relative rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5">
              <div className={`mb-3 text-2xl font-black ${step.color}`}>{step.num}</div>
              <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.desc}</p>
              {/* 连接线 (桌面端) */}
              {i < 2 && (
                <div className="absolute -right-3 top-1/3 hidden h-0.5 w-6 sm:block">
                  <div className={`h-full ${step.bar} rounded-full opacity-30`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
