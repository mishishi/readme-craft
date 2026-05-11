import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getEntries, deleteEntry, clearAll, type HistoryEntry } from '../services/history';
import Modal from './Modal';

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(ts).toLocaleDateString('zh-CN');
}

function HistoryEntryRow({
  entry,
  onRestore,
  onDelete,
}: {
  entry: HistoryEntry;
  onRestore: (e: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3.5 transition-all hover:border-gray-200 hover:shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 text-sm font-bold text-indigo-600">
        {entry.repoFullName.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-gray-900">
            {entry.repoFullName}
          </span>
          {entry.templateName && (
            <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
              {entry.templateName}
            </span>
          )}
        </div>
        {entry.title && (
          <p className="mt-0.5 truncate text-xs text-gray-400">{entry.title}</p>
        )}
        <p className="mt-1 text-[10px] text-gray-300">{formatTime(entry.createdAt)}</p>
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
        <button
          onClick={() => onRestore(entry)}
          className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
          title="恢复"
        >
          恢复
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
          title="删除"
        >
          删除
        </button>
      </div>
    </div>
  );
}

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // entry id, or 'all' for clear all
  const [visible, setVisible] = useState(false);

  // Load entries
  const refresh = () => setEntries(getEntries());

  useEffect(() => {
    if (open) {
      refresh();
      // Delay the visibility animation
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleRestore = (entry: HistoryEntry) => {
    dispatch({
      type: 'RESTORE_FROM_HISTORY',
      payload: { title: entry.title, preamble: entry.preamble, sections: entry.sections },
    });
    onClose();
    navigate('/editor');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget === 'all') {
      clearAll();
    } else {
      deleteEntry(deleteTarget);
    }
    setDeleteTarget(null);
    refresh();
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="历史记录"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">历史记录</h2>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <button
                onClick={() => setDeleteTarget('all')}
                className="rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="关闭"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg className="mb-4 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">暂无历史记录</p>
              <p className="mt-1 text-xs text-gray-300">生成 README 后将自动保存</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <HistoryEntryRow
                  key={entry.id}
                  entry={entry}
                  onRestore={handleRestore}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget === 'all' ? '清空所有记录' : '删除记录'}
        confirmText={deleteTarget === 'all' ? '清空' : '删除'}
        confirmClassName="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
      >
        <p className="mb-6 text-sm text-gray-500">
          {deleteTarget === 'all' ? '确定删除所有历史记录吗？此操作不可撤销。' : '确定删除这条历史记录吗？'}
        </p>
      </Modal>
    </>
  );
}
