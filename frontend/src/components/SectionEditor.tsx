import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';
import type { Section } from '../types';

interface Props {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  total: number;
  sectionIndex: number;
  onDragStart: (idx: number) => void;
  isChanged?: boolean;
}

const TOOLS = [
  { label: 'B', action: 'bold', title: '加粗 **文本**' },
  { label: 'I', action: 'italic', title: '斜体 *文本*' },
  { label: 'H', action: 'heading', title: '标题 ### ' },
  { label: '🔗', action: 'link', title: '链接 [文本](url)' },
  { label: '`', action: 'code', title: '行内代码 `code`' },
  { label: '📋', action: 'codeblock', title: '代码块 ```' },
  { label: '-', action: 'list', title: '列表 - 项目' },
  { label: '—', action: 'divider', title: '分割线 ---' },
  { label: '>', action: 'blockquote', title: '引用 > 内容' },
  { label: '🖼', action: 'image', title: '插入图片 ![alt](url)' },
];

export default function SectionEditor({ section, isFirst, isLast, total, sectionIndex, onDragStart, isChanged }: Props) {
  const { state, dispatch } = useApp();
  const isCollapsed = state.collapsedSections.includes(section.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingHeading, setEditingHeading] = useState(false);
  const [headingDraft, setHeadingDraft] = useState(section.heading);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headingInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (content: string) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id: section.id, content } });
  };

  const handleDelete = () => {
    if (section.content.trim()) {
      setShowDeleteConfirm(true);
    } else {
      dispatch({ type: 'DELETE_SECTION', payload: { id: section.id } });
    }
  };

  const closeDeleteModal = useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  const confirmDelete = () => {
    dispatch({ type: 'DELETE_SECTION', payload: { id: section.id } });
    setShowDeleteConfirm(false);
  };

  const handleHeadingStartEdit = () => {
    setHeadingDraft(section.heading);
    setEditingHeading(true);
    requestAnimationFrame(() => {
      headingInputRef.current?.focus();
      headingInputRef.current?.select();
    });
  };

  const handleHeadingSave = () => {
    setEditingHeading(false);
    const trimmed = headingDraft.trim();
    if (trimmed && trimmed !== section.heading) {
      dispatch({ type: 'UPDATE_SECTION_HEADING', payload: { id: section.id, heading: trimmed } });
    }
  };

  const handleHeadingKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleHeadingSave();
    }
    if (e.key === 'Escape') {
      setEditingHeading(false);
    }
  };

  const handleMoveUp = () => {
    dispatch({ type: 'MOVE_SECTION', payload: { id: section.id, direction: 'up' } });
  };

  const handleMoveDown = () => {
    dispatch({ type: 'MOVE_SECTION', payload: { id: section.id, direction: 'down' } });
  };

  const insertSyntax = useCallback(
    (action: string) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = section.content.substring(start, end);
      let before = section.content.substring(0, start);
      let after = section.content.substring(end);

      switch (action) {
        case 'bold':
          before += '**';
          after = (selected || '文本') + '**' + after;
          break;
        case 'italic':
          before += '*';
          after = (selected || '文本') + '*' + after;
          break;
        case 'heading':
          after = '### ' + (selected || '标题') + after;
          break;
        case 'link':
          before += '[';
          after = (selected || '文本') + '](url)' + after;
          break;
        case 'code':
          before += '`';
          after = (selected || 'code') + '`' + after;
          break;
        case 'codeblock':
          after = '\n```\n' + (selected || '代码') + '\n```\n' + after;
          break;
        case 'list':
          after = '- ' + (selected || '项目') + after;
          break;
        case 'divider':
          after = '\n---\n' + after;
          break;
        case 'blockquote':
          after = '> ' + (selected || '引用内容') + after;
          break;
        case 'image':
          after = '![' + (selected || '图片描述') + '](url)' + after;
          break;
      }

      dispatch({ type: 'UPDATE_SECTION', payload: { id: section.id, content: before + after } });

      // Refocus and set cursor position
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = before.length + (selected ? selected.length : 0);
      });
    },
    [section.id, section.content, dispatch]
  );

  const handleSectionFocus = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section.id });
  }, [section.id, dispatch]);

  // Auto-grow textarea height on content change
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.max(ta.scrollHeight, 120) + 'px';
    }
  }, [section.content]);

  // Markdown 快捷键：Ctrl/Cmd + B/I/K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const ta = textareaRef.current;
      if (!ta || document.activeElement !== ta) return;
      if (e.key === 'b') { e.preventDefault(); insertSyntax('bold'); }
      else if (e.key === 'i') { e.preventDefault(); insertSyntax('italic'); }
      else if (e.key === 'k') { e.preventDefault(); insertSyntax('link'); }
      else if (e.key === 'Q' && e.shiftKey) { e.preventDefault(); insertSyntax('blockquote'); }
      else if (e.key === 'I' && e.shiftKey) { e.preventDefault(); setShowImageInput(true); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [insertSyntax]);

  const toolGroup = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3];

  const insertImage = useCallback(() => {
    if (!imageUrl.trim()) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = section.content.substring(start, end);
    const alt = imageAlt.trim() || selected || '图片';
    const markdown = `![${alt}](${imageUrl.trim()})`;
    const before = section.content.substring(0, start);
    const after = section.content.substring(end);
    dispatch({ type: 'UPDATE_SECTION', payload: { id: section.id, content: before + markdown + after } });
    setShowImageInput(false);
    setImageUrl('');
    setImageAlt('');
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + markdown.length;
    });
  }, [section.id, section.content, imageUrl, imageAlt, dispatch]);

  return (
    <div
      className={`rounded-xl border transition-all hover:shadow-sm ${isChanged ? 'bg-yellow-50 ring-2 ring-yellow-300' : 'bg-white'} ${isCollapsed ? 'border-dashed border-gray-300' : 'border-gray-200'}`}
      onClick={handleSectionFocus}
    >
      {/* 章节标题栏 */}
      <div
        className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/section-id', section.id);
          e.dataTransfer.effectAllowed = 'move';
          (e.currentTarget as HTMLElement).classList.add('opacity-40');
          onDragStart(sectionIndex);
        }}
        onDragEnd={(e) => {
          (e.currentTarget as HTMLElement).classList.remove('opacity-40');
        }}
      >
        {/* Drag handle */}
        <div className="flex cursor-grab items-center gap-1 px-2 text-gray-400 active:cursor-grabbing" title="拖拽排序">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
          <span className="hidden select-none text-[10px] text-gray-300 sm:inline">
            ⋮⋮
          </span>
        </div>
        <div className="flex flex-1 items-center min-w-0">
          {/* Chevron toggle — 独立按钮，不再包裹标题 */}
          <button
            onClick={() => dispatch({ type: 'SET_COLLAPSED', payload: { id: section.id, collapsed: !isCollapsed } })}
            className="flex shrink-0 items-center px-2 py-2.5 text-gray-400 transition-colors hover:text-gray-600"
            title={isCollapsed ? '展开章节' : '折叠章节'}
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* 标题区域 — 纯 div，不触发折叠 */}
          <div
            className="flex flex-1 items-center gap-2 px-1 py-2.5 min-w-0"
            onClick={handleSectionFocus}
          >
            {editingHeading ? (
              <input
                ref={headingInputRef}
                value={headingDraft}
                onChange={(e) => setHeadingDraft(e.target.value)}
                onBlur={handleHeadingSave}
                onKeyDown={handleHeadingKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded border border-indigo-200 bg-white px-2 py-0.5 text-sm font-medium text-gray-700 outline-none ring-2 ring-indigo-200"
              />
            ) : (
              <div className="group flex flex-1 items-center gap-1 min-w-0">
                <span
                  className="flex-1 truncate text-sm font-medium text-gray-700"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    handleHeadingStartEdit();
                  }}
                >
                  {section.heading || '未命名章节'}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleHeadingStartEdit();
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleHeadingStartEdit(); } }}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer rounded p-0.5 text-gray-400 transition-all hover:bg-indigo-50 hover:text-indigo-500 sm:opacity-0 sm:group-hover:opacity-100"
                  title="编辑标题"
                  aria-label="编辑标题"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Move + Delete buttons */}
        <div className="flex items-center gap-0.5 pr-2">
          <button
            onClick={handleMoveUp}
            disabled={isFirst}
            title="上移"
            aria-label="上移章节"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={handleMoveDown}
            disabled={isLast}
            title="下移"
            aria-label="下移章节"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={total <= 1}
            title="删除章节"
            aria-label="删除章节"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 内容编辑区 */}
      {!isCollapsed && (
        <div>
          {/* Markdown toolbar */}
          <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50/30 px-3 py-1.5">
            {TOOLS.map((tool, ti) => (
              <span key={tool.action} className="flex items-center gap-1">
                {ti > 0 && toolGroup[ti] !== toolGroup[ti - 1] && (
                  <span className="mx-0.5 h-4 w-px bg-gray-200" />
                )}
                <button
                  onClick={() => {
                    if (tool.action === 'image') {
                      setShowImageInput(true);
                    } else {
                      insertSyntax(tool.action);
                    }
                  }}
                  title={tool.title}
                  className="rounded px-2 py-0.5 text-xs font-medium text-gray-500 transition-colors hover:bg-white hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {tool.label}
                </button>
              </span>
            ))}
            <span className="ml-auto text-[10px] text-gray-300">Markdown</span>
          </div>

          {/* 图片 URL 输入 */}
          {showImageInput && (
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="图片 URL（支持 GitHub raw 链接）"
                  className="flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') insertImage();
                    if (e.key === 'Escape') { setShowImageInput(false); setImageUrl(''); setImageAlt(''); }
                  }}
                />
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="替代文本（可选）"
                  className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-36"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') insertImage();
                    if (e.key === 'Escape') { setShowImageInput(false); setImageUrl(''); setImageAlt(''); }
                  }}
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={insertImage}
                    disabled={!imageUrl.trim()}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    插入
                  </button>
                  <button
                    onClick={() => { setShowImageInput(false); setImageUrl(''); setImageAlt(''); }}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    取消
                  </button>
                </div>
              </div>
              {imageUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="预览"
                    className="h-12 w-auto rounded border border-gray-200 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="text-[10px] text-gray-400">
                    {imageUrl.startsWith('http') ? '外部图片' : '将使用相对路径'}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="px-4 py-3">
            <textarea
              ref={textareaRef}
              value={section.content}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={handleSectionFocus}
              tabIndex={0}
              className="input-field !border-0 !p-0 !shadow-none !ring-0 font-mono text-sm leading-relaxed resize-none min-h-[120px]"
              placeholder="编辑此章节内容（支持 Markdown 语法）..."
            />
          </div>
        </div>
      )}

      <Modal
        open={showDeleteConfirm}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="确认删除"
        confirmText="确认删除"
        confirmClassName="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
      >
        <p className="text-sm text-gray-500">确定要删除「{section.heading || '未命名章节'}」吗？当前编辑内容将丢失。</p>
      </Modal>
    </div>
  );
}
