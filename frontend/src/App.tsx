import { useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Header from './components/Header';
import { trackEvent } from './services/tracking';
import ToastContainer from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';

const HomePage = lazy(() => import('./pages/HomePage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));

function PageSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        <span className="text-sm text-muted-400">加载中…</span>
      </div>
    </div>
  );
}

/** 路由守卫：/editor 需要已有内容 */
function RequireContent({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (state.sections.length === 0 && !state.title) return <Navigate to="/" replace />;
  return <>{children}</>;
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
  const isEditor = location.pathname === '/editor';

  const fallback = <PageSkeleton />;

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      {!isAdmin && <Header />}

      <main id="main-content" className={`relative mx-auto w-full flex-1 bg-white px-4 pb-12 pt-6 ${isAdmin ? 'max-w-6xl' : 'max-w-7xl'}`}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Suspense fallback={fallback}><HomePage /></Suspense>} />
            <Route
              path="/editor"
              element={
                <RequireContent>
                  <Suspense fallback={fallback}><EditorPage /></Suspense>
                </RequireContent>
              }
            />
            <Route path="/admin" element={<Suspense fallback={fallback}><AdminLayout /></Suspense>}>
              <Route index element={<Navigate to="/admin/analytics" replace />} />
              <Route path="analytics" element={<Suspense fallback={fallback}><AdminAnalytics /></Suspense>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!isAdmin && !isEditor && (
        <footer className="border-t border-muted-200 bg-white py-4 text-center text-sm text-muted-400">
          <div className="flex items-center justify-center gap-3">
            <span>ReadMeCraft — 中文 README 生成器</span>
            <span className="text-muted-200">|</span>
            <a
              href="https://github.com/mishishi/readme-craft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-500 transition-colors hover:text-muted-600"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <span className="text-muted-200">|</span>
            <span>v1.0.0</span>
          </div>
        </footer>
      )}

      <ToastContainer />
    </div>
  );
}

const AdminAnalytics = lazy(() => import('./components/AnalyticsDashboard'));

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
