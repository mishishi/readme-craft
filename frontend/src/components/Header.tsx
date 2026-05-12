import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getEntries } from '../services/history';
import ConfirmBackModal from './ConfirmBackModal';
import HistoryPanel from './HistoryPanel';

export default function Header() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

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

  const clearAllData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('readme-craft-'));
    keys.forEach(k => localStorage.removeItem(k));
    const sKeys = Object.keys(sessionStorage).filter(k => k.startsWith('readme-craft-'));
    sKeys.forEach(k => sessionStorage.removeItem(k));
    dispatch({ type: 'RESET' });
    setShowClearConfirm(false);
    window.location.reload();
  };

  const openHistory = useCallback(() => {
    setHistoryCount(getEntries().length);
    setHistoryOpen(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <button
            onClick={handleLogoClick}
            title="返回首页"
            className="flex items-center gap-2.5 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs text-white shadow-sm">
              R
            </span>
            <span>
              ReadMe<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Craft</span>
            </span>
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <button
              onClick={openHistory}
              className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
              title="历史记录"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium">历史</span>
              {historyCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-semibold text-white">
                  {historyCount}
                </span>
              )}
            </button>
            <span className="h-4 w-px bg-gray-200" />
            <a
              href="https://github.com/mishishi/readme-craft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="hidden sm:inline text-xs font-medium">GitHub</span>
            </a>
            <span className="h-4 w-px bg-gray-200" />
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
              title="清空本地数据"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <ConfirmBackModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmBack}
      />

      {/* 清空数据确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowClearConfirm(false)}>
          <div
            className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">清空本地数据</h3>
                <p className="text-xs text-gray-500">此操作不可撤销</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              将清除所有本地存储的编辑状态和访问记录，页面将重新加载。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={clearAllData}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}

      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );
}
