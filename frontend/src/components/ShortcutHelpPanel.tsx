import { useEffect, useRef } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['⌘Z', 'Ctrl+Z'], description: '撤销编辑' },
  { keys: ['⌘⇧Z', 'Ctrl+Shift+Z'], description: '重做编辑' },
  { keys: ['⌘Y', 'Ctrl+Y'], description: '重做编辑（备选）' },
  { keys: ['⌘S', 'Ctrl+S'], description: '下载 README 文件' },
  { keys: ['Esc'], description: '关闭提示通知' },
];

export default function ShortcutHelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isMac = navigator.platform.toLowerCase().includes('mac');

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Close on Esc (native for dialog) and backdrop click
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      if (e.target === el) onClose();
    };
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-0 h-full w-full bg-transparent p-0 backdrop:bg-black/40"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-card border border-muted-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-muted-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-muted-900">键盘快捷键</h2>
            <button
              onClick={onClose}
              className="rounded p-1 text-muted-400 transition-colors hover:bg-muted-100 hover:text-muted-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              aria-label="关闭"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Shortcuts list */}
          <div className="px-5 py-3">
            <ul className="space-y-2.5">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.keys[0]} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-500">{shortcut.description}</span>
                  <span className="flex shrink-0 gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={key}>
                        <kbd className="inline-block min-w-[1.5rem] rounded border border-muted-200 bg-muted-50 px-1.5 py-0.5 text-center text-[10px] font-medium leading-relaxed text-muted-600 shadow-sm">
                          {isMac ? key : key.replace('⌘', 'Ctrl+').replace('⇧', 'Shift+')}
                        </kbd>
                        {i === 0 && shortcut.keys.length > 1 && (
                          <span className="mx-1 text-[10px] text-muted-300">/</span>
                        )}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer hint */}
          <div className="border-t border-muted-100 px-5 py-2.5 text-center text-[10px] text-muted-400">
            <span>部分快捷键仅在编辑页面可用</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
