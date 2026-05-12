import { useEffect, useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import RepoInput from './components/RepoInput';
import RepoInfoCard from './components/RepoInfoCard';
import TemplateSelector from './components/TemplateSelector';
import GenerateSection from './components/GenerateSection';
import ShowcaseSection from './components/ShowcaseSection';
import ConfirmBackModal from './components/ConfirmBackModal';
import EditWorkspace from './components/EditWorkspace';
import GitHubTokenWarning from './components/GitHubTokenWarning';
import StepIndicator from './components/StepIndicator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AdminLayout from './components/AdminLayout';
import { trackEvent } from './services/tracking';

function Toast({ id, message, type, onClose }: { id: string; message: string; type: 'success' | 'error' | 'info' | 'warning'; onClose: (id: string) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onClose(id), type === 'info' ? 3000 : 6000);
    return () => clearTimeout(timer);
  }, [id, onClose, paused, type]);

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500';
  const icon = type === 'success' ? (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ) : type === 'info' ? (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  ) : type === 'warning' ? (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
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
    <div className="fixed right-4 top-[calc(4rem+env(safe-area-inset-top,0px))] z-50 flex w-72 flex-col gap-2">
      {state.toasts.map((t) => (
        <div key={t.id} className="animate-slide-in-right">
          <Toast id={t.id} message={t.message} type={t.type} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

/** 路由守卫：/editor 需要已有内容 */
function RequireContent({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (state.sections.length === 0 && !state.title) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function HomePage() {
  const { state } = useApp();
  return (
    <section>
      <HeroSection />
      <ShowcaseSection />
      <div className="mx-auto mt-6 max-w-2xl">
        <RepoInput disabled={false} />
          <GitHubTokenWarning />
          <RepoInfoCard />
      </div>

      {/* 选模板：仅当仓库信息加载后展示，减少首屏认知负荷 */}
      <div className={state.repoInfo ? 'animate-fade-in-up' : 'hidden'}>
        <TemplateSelector />
      </div>

      <StepIndicator />

      <GenerateSection />
    </section>
  );
}

function EditorPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleBack = () => {
    const hasContent = state.sections.some(s => s.content.trim());
    if (hasContent) {
      setShowBackConfirm(true);
    } else {
      dispatch({ type: 'CLEAR_CONTENT' });
      navigate('/');
    }
  };

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowBackConfirm(false);
    navigate('/');
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
            返回首页
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          调整标题和章节内容，右侧实时预览效果
        </p>
      </div>
      <EditWorkspace />

      <ConfirmBackModal
        open={showBackConfirm}
        onClose={() => setShowBackConfirm(false)}
        onConfirm={confirmBack}
      />
    </section>
  );
}

function AppRoutes() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  // Page view tracking
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

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

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Header />}

      <main className={`mx-auto w-full flex-1 px-4 pb-12 pt-6 ${isAdmin ? 'max-w-6xl' : 'max-w-7xl'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/editor"
            element={
              <RequireContent>
                <EditorPage />
              </RequireContent>
            }
          />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/analytics" replace />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdmin && (
        <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-400">
          <div className="flex items-center justify-center gap-3">
            <span>ReadMeCraft — 中文 README 生成器</span>
            <span className="text-gray-200">|</span>
            <a
              href="https://github.com/mishishi/readme-craft"
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
      )}

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
