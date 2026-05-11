import { useEffect } from 'react';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import RepoInput from './components/RepoInput';
import RepoInfoCard from './components/RepoInfoCard';
import TemplateSelector from './components/TemplateSelector';
import GenerateSection from './components/GenerateSection';
import EditWorkspace from './components/EditWorkspace';

function StepIndicator() {
  const { state, dispatch } = useApp();

  const steps = [
    { key: 'input' as const, label: '输入仓库', icon: '🔗' },
    { key: 'template' as const, label: '选择模板', icon: '🎨' },
    { key: 'edit' as const, label: '编辑 & 预览', icon: '✏️' },
  ];

  const currentIdx = steps.findIndex((s) => s.key === state.step);

  return (
    <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step dot + label */}
            <button
              onClick={() => {
                if (isDone) dispatch({ type: 'SET_STEP', payload: step.key });
              }}
              disabled={!isDone}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'text-indigo-600'
                  : isDone
                    ? 'cursor-pointer text-green-600 hover:text-green-700'
                    : 'text-gray-300'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                    : isDone
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-50 text-gray-300'
                }`}
              >
                {isDone ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.icon
                )}
              </span>
              <span className="inline">{step.label}</span>
            </button>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={`mx-3 h-px w-12 sm:w-20 ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toast() {
  const { state, dispatch } = useApp();
  if (!state.toast) return null;

  const bg = state.toast.type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = state.toast.type === 'success' ? (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );

  return (
    <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className={`${bg} flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg`}>
        {icon}
        <span>{state.toast.message}</span>
        <button
          onClick={() => dispatch({ type: 'DISMISS_TOAST' })}
          className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
          aria-label="关闭提示"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { state, dispatch } = useApp();

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: 关闭 toast
      if (e.key === 'Escape' && state.toast) {
        dispatch({ type: 'DISMISS_TOAST' });
      }
      // Ctrl/Cmd + S: 下载 README (在编辑步骤)
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && state.step === 'edit') {
        e.preventDefault();
        const downloadBtn = document.querySelector('[data-shortcut="download"]') as HTMLButtonElement;
        downloadBtn?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.step, state.toast, dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6">
        {/* Step progress indicator */}
        {state.step !== 'input' && <StepIndicator />}

        {/* Step 1: 输入仓库地址 */}
        {state.step === 'input' ? (
          <section>
            <HeroSection />
            <div className="mx-auto mt-10 max-w-2xl">
              <RepoInput disabled={false} />
              <RepoInfoCard />
            </div>
          </section>
        ) : (
          <section className="mb-8">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900">GitHub 仓库</h2>
              <p className="mt-1 text-sm text-gray-500">
                输入仓库链接，选择模板，一键生成中文 README
              </p>
            </div>
            <RepoInput disabled={true} />
            <RepoInfoCard />
          </section>
        )}

        {/* Step 2: 选择模板 */}
        {state.step === 'template' && (
          <section className="mb-8">
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">选择模板风格</h2>
                <button
                  onClick={() => dispatch({ type: 'BACK_TO_INPUT' })}
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  返回修改仓库
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">选一个你喜欢的 README 风格</p>
            </div>
            <TemplateSelector />
            {(state.step === 'template' || state.generating) && <GenerateSection />}
          </section>
        )}

        {/* Step 3: 编辑 + 预览 */}
        {state.step === 'edit' && (
          <section>
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">编辑 & 预览</h2>
                <button
                  onClick={() => {
                    const hasContent = state.sections.some(s => s.content.trim());
                    if (hasContent && !window.confirm('返回将丢失当前编辑内容，确定继续？')) return;
                    dispatch({ type: 'BACK_TO_TEMPLATE' });
                  }}
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  返回选择模板
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                调整标题和章节内容，右侧实时预览效果
              </p>
            </div>
            <EditWorkspace />
          </section>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-400">
        <div className="flex items-center justify-center gap-3">
          <span>ReadMeCraft — 中文 README 生成器</span>
          <span className="text-gray-200">|</span>
          <a
            href="https://github.com/zhurenbao/readme-craft"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 transition-colors hover:text-gray-600"
          >
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
          <span className="text-gray-200">|</span>
          <span>v1.0.0</span>
        </div>
      </footer>

      <Toast />
    </div>
  );
}
