import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Override confirm button styles (e.g. bg-amber-600 for destructive actions). Default: primary brand. */
  confirmClassName?: string;
  icon?: ReactNode;
  hideIcon?: boolean;
  confirmDisabled?: boolean;
  /** Override inner container width (e.g. max-w-lg for wide content). Default: max-w-sm. */
  containerClassName?: string;
}

export default function Modal({
  open,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = '确认',
  cancelText = '取消',
  confirmClassName,
  icon,
  hideIcon = false,
  confirmDisabled = false,
  containerClassName = 'max-w-sm',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Store trigger element when opening, restore focus on close
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
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

    // Focus the confirm button (or last button if no confirm) on open
    requestAnimationFrame(() => {
      if (!modalRef.current) return;
      const buttons = modalRef.current.querySelectorAll<HTMLButtonElement>('button');
      if (onConfirm) {
        // Focus the last button (confirm) for safety-critical flows
        buttons[buttons.length - 1]?.focus();
      } else {
        buttons[buttons.length - 1]?.focus();
      }
    });

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onConfirm]);

  if (!open) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`mx-4 w-full rounded-dialog bg-white p-6 shadow-2xl ${containerClassName}`}>
        {!hideIcon && (
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            {icon || (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>
        )}
        <h3 className="mb-2 text-base font-semibold text-muted-900">{title}</h3>
        {children}
        <div className="flex justify-end gap-3" style={{ marginTop: children ? undefined : '1.5rem' }}>
          <button onClick={onClose} className="btn-secondary text-sm">{cancelText}</button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={confirmDisabled}
              className={
                confirmClassName ||
                'btn-primary'
              }
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
