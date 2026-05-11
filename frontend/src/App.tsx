import { useEffect, useCallback, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import RepoInput from './components/RepoInput';
import RepoInfoCard from './components/RepoInfoCard';
import TemplateSelector from './components/TemplateSelector';
import GenerateSection from './components/GenerateSection';
import EditWorkspace from './components/EditWorkspace';

function StepIndicator() {
  const { state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    { path: '/' as const, label: '输入仓库', icon: 'search' },
    { path: '/templates' as const, label: '选择模板', icon: 'template' },
    { path: '/editor' as const, label: '编辑 & 预览', icon: 'edit' },
  ];

  const currentIdx = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;

        return (
          <div key={step.path} className="flex items-center">
            <button
              onClick={() => { if (isDone) navigate(step.path); }}
              disabled={!isDone}
              className={`flex items-center gap-1.5 rounded text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                isActive
                  ? 'text-indigo-600'
                  : isDone
                    ? 'cursor-pointer text-green-600 hover:text-green-700'
                    : 'text-gray-400'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                    : isDone
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isDone ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.icon === 'search' ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  ) : step.icon === 'template' ? (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  )
                )}
              </span>
              <span className="inline">{step.label}</span>
            </button>

            {i < steps.length - 1 && (
              <div className={`mx-3 h-px w-12 sm:w-20 ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toast({ id, message, type, onClose }: { id: string; message: string; type: 'success' | 'error'; onClose: (id: string) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose, paused]);

  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const icon = type === 'success' ? (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );

  return (
    <div
      className={`${bg} flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm text-white shadow-lg`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {icon}
      <span>{message}</span>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        aria-label="关闭提示"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ToastContainer() {
  const { state, dispatch } = useApp();
  const onClose = useCallback((id: string) => dispatch({ type: 'DISMISS_TOAST', payload: id }), [dispatch]);

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(2rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {state.toasts.map((t) => (
        <div key={t.id} className="animate-slide-up">
          <Toast id={t.id} message={t.message} type={t.type} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

/** 路由守卫：/templates 需要已获取仓库信息 */
function RequireRepo({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.repoInfo) return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** 路由守卫：/editor 需要已有内容 */
function RequireContent({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (state.sections.length === 0 && !state.title) return <Navigate to="/templates" replace />;
  return <>{children}</>;
}

function InputPage() {
  return (
    <section>
      <HeroSection />
      <div className="mx-auto mt-10 max-w-2xl">
        <RepoInput disabled={false} />
        <RepoInfoCard />
      </div>
    </section>
  );
}

function TemplatePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const backTriggerRef = useRef<HTMLElement | null>(null);

  const handleBack = () => {
    backTriggerRef.current = document.activeElement as HTMLElement;
    if (state.sections.length > 0) {
      setShowBackConfirm(true);
    } else {
      dispatch({ type: 'CLEAR_CONTENT' });
      navigate('/');
    }
  };

  const closeBackConfirm = useCallback(() => {
    setShowBackConfirm(false);
    requestAnimationFrame(() => backTriggerRef.current?.focus());
  }, []);

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowBackConfirm(false);
    navigate('/');
  };

  return (
    <section className="mb-8">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">GitHub 仓库</h2>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            返回修改仓库
          </button>
        </div>
      </div>
      <RepoInput disabled={true} />
      <RepoInfoCard />
      <TemplateSelector />
      <GenerateSection />

      {showBackConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">确认返回</h3>
            <p className="mb-6 text-sm text-gray-500">当前编辑内容将丢失，确定要返回吗？</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeBackConfirm} className="btn-secondary text-sm">取消</button>
              <button onClick={confirmBack} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">确认返回</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EditorPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const backTriggerRef = useRef<HTMLElement | null>(null);

  const handleBack = () => {
    backTriggerRef.current = document.activeElement as HTMLElement;
    const hasContent = state.sections.some(s => s.content.trim());
    if (hasContent) {
      setShowBackConfirm(true);
    } else {
      dispatch({ type: 'CLEAR_CONTENT' });
      navigate('/templates');
    }
  };

  const closeBackConfirm = useCallback(() => {
    setShowBackConfirm(false);
    requestAnimationFrame(() => backTriggerRef.current?.focus());
  }, []);

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowBackConfirm(false);
    navigate('/templates');
  };

  return (
    <section>
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">编辑 & 预览</h2>
          <button
            onClick={handleBack}
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

      {showBackConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900">确认返回</h3>
            <p className="mb-6 text-sm text-gray-500">返回将丢失当前编辑内容，确定继续？</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeBackConfirm} className="btn-secondary text-sm">取消</button>
              <button onClick={confirmBack} className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">确认返回</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AppRoutes() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  // 全局快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.toasts.length > 0) {
        dispatch({ type: 'DISMISS_TOAST', payload: state.toasts[state.toasts.length - 1].id });
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && location.pathname === '/editor') {
        e.preventDefault();
        const downloadBtn = document.querySelector('[data-shortcut="download"]') as HTMLButtonElement;
        downloadBtn?.click();
      }
      // Undo/Redo: 仅在非输入框时触发全局操作
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputFocused = tag === 'input' || tag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !isInputFocused) {
        e.preventDefault();
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y' && !isInputFocused) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.toasts, location.pathname, dispatch]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6">
        {location.pathname !== '/' && <StepIndicator />}

        <Routes>
          <Route path="/" element={<InputPage />} />
          <Route
            path="/templates"
            element={
              <RequireRepo>
                <TemplatePage />
              </RequireRepo>
            }
          />
          <Route
            path="/editor"
            element={
              <RequireContent>
                <EditorPage />
              </RequireContent>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
