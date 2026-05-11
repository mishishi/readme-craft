import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCancel(); return; }
      if (e.key !== 'Tab') return;
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => {
      const cancelBtn = modalRef.current?.querySelector<HTMLButtonElement>('button');
      cancelBtn?.focus();
    });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="确认返回"
    >
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="mb-2 text-base font-semibold text-gray-900">确认返回</h3>
        <p className="mb-6 text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-secondary text-sm">
            取消
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-700"
          >
            确认返回
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const logoTriggerRef = useRef<HTMLElement | null>(null);

  const hasContent = state.title || state.sections.length > 0;

  const handleLogoClick = () => {
    logoTriggerRef.current = document.activeElement as HTMLElement;
    if (hasContent) {
      setShowConfirm(true);
    } else {
      navigate('/');
    }
  };

  const closeConfirm = () => {
    setShowConfirm(false);
    requestAnimationFrame(() => logoTriggerRef.current?.focus());
  };

  const confirmBack = () => {
    dispatch({ type: 'CLEAR_CONTENT' });
    setShowConfirm(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 text-lg font-bold text-gray-900 transition-opacity hover:opacity-80"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs text-white shadow-sm">
              R
            </span>
            <span>
              ReadMe<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Craft</span>
            </span>
          </button>

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span>在线工具</span>
            </span>
            <a
              href="https://github.com/zhurenbao/readme-craft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {showConfirm && (
        <ConfirmModal
          message="当前编辑内容将丢失，确定要返回吗？"
          onConfirm={confirmBack}
          onCancel={closeConfirm}
        />
      )}
    </>
  );
}
