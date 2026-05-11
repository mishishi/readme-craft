import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import SectionEditor from './SectionEditor';

interface DragOverState {
  index: number;
  position: 'before' | 'after';
}

export default function EditorPanel() {
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

  return (
    <div>
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">表单编辑</span>
        <button
          onClick={() => dispatch({ type: 'ADD_SECTION' })}
          className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
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
          <label className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wider">
            项目标题
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })}
            className="input-field text-lg font-bold"
            placeholder="README 标题..."
          />
        </div>

        {/* 章节列表 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              章节内容
            </label>
            {sectionCount > 0 && (
              <span className="text-xs text-gray-400">{sectionCount} 个章节</span>
            )}
          </div>

          {sectionCount === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-sm text-gray-400">暂无章节内容，请先生成 README</p>
            </div>
          ) : (
            state.sections.map((section, idx) => (
              <div
                key={section.id}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
              >
                {dragOver?.index === idx && dragOver.position === 'before' && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-0.5 flex-1 rounded-full bg-indigo-300" />
                    <span className="text-[10px] font-medium text-indigo-500">放置到此</span>
                    <div className="h-0.5 flex-1 rounded-full bg-indigo-300" />
                  </div>
                )}
                <SectionEditor
                  section={section}
                  isFirst={idx === 0}
                  isLast={idx === sectionCount - 1}
                  total={sectionCount}
                  sectionIndex={idx}
                  onDragStart={handleDragStart}
                />
                {dragOver?.index === idx && dragOver.position === 'after' && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="h-0.5 flex-1 rounded-full bg-indigo-300" />
                    <span className="text-[10px] font-medium text-indigo-500">放置到此</span>
                    <div className="h-0.5 flex-1 rounded-full bg-indigo-300" />
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
