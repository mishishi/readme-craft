import { useEffect, useState, useCallback } from 'react';
import { useUI } from '../context/UIContext';

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

export default function ToastContainer() {
  const { state, dispatch } = useUI();
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
