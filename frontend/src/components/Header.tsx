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
