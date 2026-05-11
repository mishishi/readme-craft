import { useMemo, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '../context/AppContext';
import { assembleMarkdown } from '../services/markdown';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PreviewPanel() {
  const { state } = useApp();
  const previewRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showToc, setShowToc] = useState(false);

  const markdown = useMemo(
    () => assembleMarkdown(state.title, state.sections),
    [state.title, state.sections]
  );

  const toc = useMemo(() => {
    return state.sections
      .filter((s) => s.heading && s.content.trim())
      .map((s) => ({ id: slugify(s.heading), heading: s.heading }));
  }, [state.sections]);

  // Debounced scroll preview to match active section
  useEffect(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (!state.activeSectionId || !previewRef.current) return;
      const section = state.sections.find((s) => s.id === state.activeSectionId);
      if (!section) return;

      const headings = previewRef.current!.querySelectorAll('h2');
      const heading = Array.from(headings).find(
        (el) => el.textContent?.trim() === section.heading
      ) as HTMLElement | undefined;

      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heading.classList.add('!text-indigo-600');
        setTimeout(() => heading.classList.remove('!text-indigo-600'), 1000);
      }
    }, 150);
    return () => { if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current); };
  }, [state.activeSectionId, state.sections]);

  return (
    <div ref={previewRef}>
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">实时预览</span>
        {toc.length > 1 && (
          <button
            onClick={() => setShowToc((v) => !v)}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-400 transition-colors hover:bg-white hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="目录"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            目录
          </button>
        )}
      </div>

      {/* 目录 */}
      {showToc && toc.length > 0 && (
        <nav className="border-b border-gray-100 bg-gray-50/20 px-6 py-3">
          <ul className="space-y-1">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = previewRef.current?.querySelector(`#${CSS.escape(item.id)}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="block text-sm text-gray-500 transition-colors hover:text-indigo-600"
                >
                  {item.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 预览内容 */}
      {markdown ? (
        <div className="prose prose-slate max-w-none p-6 prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-lg
          prose-code:before:content-none prose-code:after:content-none
          prose-code:!text-inherit prose-code:!bg-transparent prose-code:!font-normal
          prose-pre:!bg-gray-900 prose-pre:!text-gray-100 prose-pre:!border-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="!rounded !bg-gray-100 !px-1.5 !py-0.5 !text-sm !text-gray-800">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={`${className ?? ''} !bg-transparent !text-gray-100`}>
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="!overflow-x-auto !rounded-lg !bg-gray-900 !p-4 !text-sm !text-gray-100">
                  {children}
                </pre>
              ),
              h2: ({ children, ...props }) => {
                let text = '';
                if (typeof children === 'string') text = children;
                else if (Array.isArray(children)) text = children.map((c: any) => typeof c === 'string' ? c : '').join('');
                const id = slugify(text);
                return (
                  <h2 id={id} {...props} className="group flex items-center gap-2">
                    <span>{children}</span>
                    <a
                      href={`#${id}`}
                      className="text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100 no-underline text-sm font-normal"
                      aria-label={`${text} 的链接`}
                    >
                      #
                    </a>
                  </h2>
                );
              },
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-sm text-gray-400">
          <svg className="mb-3 h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
          <span>暂无内容，请先生成 README</span>
        </div>
      )}
    </div>
  );
}
