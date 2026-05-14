import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getEntries } from '../services/history';
import ConfirmBackModal from './ConfirmBackModal';
import HistoryPanel from './HistoryPanel';

export default function Header() {
  const { state, dispatch } = useApp();
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Refresh badge when generation auto-saves
  const prevGeneratingRef = useRef(state.generating);
  useEffect(() => {
    if (prevGeneratingRef.current && !state.generating) {
      setHistoryCount(getEntries().length);
    }
    prevGeneratingRef.current = state.generating;
  }, [state.generating]);

  const hasContent = state.title || state.sections.length > 0;

  const handleLogoClick = () => {
    if (hasContent) {
      setShowConfirm(true);
    } else {
      navigate('/');
    }
  };

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowConfirm(false);
    navigate('/');
  };

  // Click outside to close user menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const openHistory = useCallback(() => {
    setHistoryCount(getEntries().length);
    setHistoryOpen(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-header border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <button
            onClick={handleLogoClick}
            title="重新开始"
            className="flex items-center gap-2.5 text-lg font-bold text-neutral-900 transition-opacity hover:opacity-80"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-button bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-elevated">
              R
            </span>
            <span className="font-heading">
              ReadMe<span className="text-brand-600">Craft</span>
            </span>
          </button>

          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <button
              onClick={openHistory}
              className="btn-ghost relative flex items-center gap-1.5 hover:bg-brand-50 hover:text-brand-600 min-h-[44px] sm:min-h-0"
              title="历史记录"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium">历史</span>
              {historyCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white">
                  {historyCount}
                </span>
              )}
            </button>
            {/* User / Login */}
            {loading ? (
              <div className="flex h-7 w-7 items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
              </div>
            ) : user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-button p-1 transition-colors hover:bg-brand-50 min-h-[44px] sm:min-h-0"
                  aria-label="用户菜单"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.login}
                    className="h-7 w-7 rounded-full ring-2 ring-neutral-100"
                  />
                  <span className="hidden text-xs font-medium text-neutral-700 sm:inline">
                    {user.login}
                  </span>
                  <svg className={`hidden h-3 w-3 text-neutral-400 transition-transform duration-normal sm:block ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-dropdown mt-1.5 w-44 overflow-hidden rounded-card border border-neutral-200 bg-white shadow-elevated-lg">
                    <div className="border-b border-neutral-100 px-3 py-2">
                      <p className="truncate text-xs font-medium text-neutral-900">{user.name || user.login}</p>
                      {user.email && <p className="truncate text-[11px] text-neutral-400">{user.email}</p>}
                    </div>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-neutral-600 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="inline-flex items-center gap-1.5 rounded-button border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition-all duration-normal hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.97] min-h-[44px] sm:min-h-0"
                aria-label="GitHub 登录"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="hidden sm:inline">登录</span>
              </button>
            )}

            <button
              onClick={() => {
                dispatch({ type: 'RESET' });
                dispatch({ type: 'SHOW_TOAST', payload: { message: '已重置所有状态', type: 'success' } });
                navigate('/');
              }}
              className="inline-flex items-center gap-1.5 rounded-button bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-emboss transition-all duration-normal hover:bg-brand-700 hover:shadow-elevated active:scale-[0.97] min-h-[44px] sm:min-h-0 sm:py-2"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="hidden sm:inline">重新开始</span>
            </button>
          </div>
        </div>
      </header>

      <ConfirmBackModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmBack}
      />

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
