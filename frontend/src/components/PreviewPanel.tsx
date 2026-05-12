import { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useApp } from '../context/AppContext';
import { assembleMarkdown } from '../services/markdown';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    const codeEl = preRef.current?.querySelector('code');
    const text = codeEl?.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="group relative">
      <pre ref={preRef} className="!overflow-x-auto !rounded-lg !bg-gray-900 !p-4 !pr-10 !text-sm !text-gray-100">
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-gray-700/50 p-1.5 text-gray-400 opacity-0 transition-all hover:bg-gray-600 hover:text-gray-200 group-hover:opacity-100 max-sm:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        title="复制代码"
        aria-label="复制代码"
      >
        {copied ? (
          <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        )}
      </button>
    </div>
  );
}

interface PreviewPanelProps {
  feedbackCard?: React.ReactNode;
}

export default function PreviewPanel({ feedbackCard }: PreviewPanelProps) {
  const { state, dispatch } = useApp();
  const previewRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const markdown = useMemo(
    () => assembleMarkdown(state.title, state.preamble, state.sections),
    [state.title, state.preamble, state.sections]
  );

  const toc = useMemo(() => {
    return state.sections
      .filter((s) => s.heading && s.content.trim())
      .map((s) => ({ id: slugify(s.heading), heading: s.heading }));
  }, [state.sections]);

  // Debounced scroll preview to match active section (用索引精确匹配)
  useEffect(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      if (!state.activeSectionId || !previewRef.current) return;
      const idx = state.sections.findIndex((s) => s.id === state.activeSectionId);
      if (idx === -1) return;

      const headings = previewRef.current!.querySelectorAll('h2');
      const heading = headings[idx] as HTMLElement | undefined;

      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
        heading.classList.add('!text-indigo-600');
        setTimeout(() => heading.classList.remove('!text-indigo-600'), 1000);
      }
    }, 150);
    return () => { if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current); };
  }, [state.activeSectionId, state.sections]);

  // IntersectionObserver: show back-to-top when header scrolls out of view
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBackToTop(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = useCallback(() => {
    headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div ref={previewRef}>
      {/* 头部 */}
      <div ref={headerRef} className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">实时预览</span>
        {toc.length > 1 && (
          <button
            onClick={() => setShowToc((v) => !v)}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-gray-400 transition-colors hover:bg-white hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
                <button
                  onClick={() => {
                    const el = previewRef.current?.querySelector(`#${CSS.escape(item.id)}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="block w-full text-left rounded text-sm text-gray-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {item.heading}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 预览内容 */}
      {markdown ? (
        <div className="prose prose-slate max-w-none p-6 prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-lg prose-img:inline prose-img:my-0
          prose-code:before:content-none prose-code:after:content-none
          prose-code:!text-inherit prose-code:!bg-transparent prose-code:!font-normal
          prose-pre:!bg-gray-900 prose-pre:!text-gray-100 prose-pre:!border-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
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
              pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
              h2: ({ children, ...props }) => {
                let text = '';
                if (typeof children === 'string') text = children;
                else if (Array.isArray(children)) text = children.map((c: any) => typeof c === 'string' ? c : '').join('');
                const id = slugify(text);
                const matchingSection = state.sections.find((s) => s.heading === text);
                const handleHeadingClick = () => {
                  if (matchingSection) {
                    dispatch({ type: 'SET_ACTIVE_SECTION', payload: matchingSection.id });
                  }
                };
                return (
                  <h2 id={id} {...props} className="group flex items-center gap-2 cursor-pointer" onClick={handleHeadingClick}>
                    <span>{children}</span>
                    <a
                      href={`#${id}`}
                      onClick={(e) => e.stopPropagation()}
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

      {/* 反馈卡片 — 浮在预览内容底部 */}
      {feedbackCard}

      {/* 回到顶部 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-lg transition-all hover:bg-gray-50 hover:text-indigo-600 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          title="回到顶部"
          aria-label="回到顶部"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
