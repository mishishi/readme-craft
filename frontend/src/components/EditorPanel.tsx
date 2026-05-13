import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SectionEditor from './SectionEditor';

interface DragOverState {
  index: number;
  position: 'before' | 'after';
}

interface EditorPanelProps {
  diffSectionIds?: Set<string>;
}

export default function EditorPanel({ diffSectionIds }: EditorPanelProps) {
  const { state, dispatch } = useApp();
  const sectionCount = state.sections.length;
  const [dragOver, setDragOver] = useState<DragOverState | null>(null);

  const handleDragStart = useCallback((idx: number) => {
    setDragOver(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? 'before' : 'after';
    setDragOver({ index: idx, position });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? 'before' : 'after';
    const toIndex = position === 'after' ? idx + 1 : idx;
    setDragOver(null);
    const id = e.dataTransfer.getData('text/section-id');
    if (id) {
      dispatch({ type: 'MOVE_SECTION_TO', payload: { id, toIndex } });
    }
  }, [dispatch]);

  // Scroll to section when activeSectionId changes (e.g. from preview click)
  useEffect(() => {
    if (!state.activeSectionId) return;
    const el = document.querySelector(`[data-section-id="${state.activeSectionId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-primary-400', 'ring-offset-2', 'rounded-button', 'transition-all', 'duration-1000');
      setTimeout(() => el.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2'), 2000);
    }
  }, [state.activeSectionId]);

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-muted-100 bg-muted-50/50 px-4 py-2">
        <span className="text-xs font-medium text-muted-500">表单编辑</span>
        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="flex items-center gap-1 rounded-md border border-muted-200 bg-white px-2.5 py-1 text-xs font-medium text-muted-600 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加章节
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* 标题 */}
        <div>
          <label htmlFor="project-title" className="mb-1.5 block text-xs font-medium text-muted-500 uppercase tracking-wider">
            项目标题
          </label>
          <input
            id="project-title"
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
            className={`input-field text-lg font-bold ${!state.title && sectionCount === 0 ? 'border-primary-200 bg-primary-50/30 ring-1 ring-primary-200/50' : ''}`}
            placeholder="README 标题..."
          />
        </div>

        {/* 章节列表 */}
        <div id="sections-area" className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="sections-area" className="block text-xs font-medium text-muted-500 uppercase tracking-wider">
              章节内容
            </label>
            {sectionCount > 0 && (
              <span className="text-xs text-muted-400">{sectionCount} 个章节</span>
            )}
          </div>

          {sectionCount === 0 ? (
            <div className="rounded-card border border-dashed border-muted-200 bg-muted-50/50 px-4 py-12 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-muted-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="mb-1 text-sm text-muted-400">暂无章节内容</p>
              <p className="mb-4 text-xs text-muted-300">从 AI 生成的内容开始编辑，或手动添加章节</p>
              <button
                onClick={() => dispatch({ type: 'ADD_SECTION' })}
                className="inline-flex items-center gap-1.5 rounded-button border border-primary-200 bg-white px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                添加章节
              </button>
            </div>
          ) : (
            state.sections.map((section, idx) => (
              <div
                key={section.id}
                data-section-id={section.id}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {dragOver?.index === idx && dragOver.position === 'before' && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-0.5 flex-1 rounded-full bg-primary-300" />
                    <span className="text-[10px] font-medium text-primary-500">放置到此</span>
                    <div className="h-0.5 flex-1 rounded-full bg-primary-300" />
                  </div>
                )}
                <div className={`${dragOver?.index === idx ? 'ring-2 ring-primary-300 ring-offset-1 rounded-button' : ''}`}>
                  <SectionEditor
                    section={section}
                    isFirst={idx === 0}
                    isLast={idx === sectionCount - 1}
                    total={sectionCount}
                    sectionIndex={idx}
                    onDragStart={handleDragStart}
                    isChanged={diffSectionIds?.has(section.id)}
                  />
                </div>
                {dragOver?.index === idx && dragOver.position === 'after' && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-0.5 flex-1 rounded-full bg-primary-300" />
                    <span className="text-[10px] font-medium text-primary-500">放置到此</span>
                    <div className="h-0.5 flex-1 rounded-full bg-primary-300" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
