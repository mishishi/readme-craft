import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateReadme, preScanProject } from '../services/api';
import { fetchRepoInfo } from '../services/github';
import { assembleMarkdown, parseSections } from '../services/markdown';
import { uuid } from '../utils/uuid';
import { trackEvent } from '../services/tracking';
import { templates } from '../templates';
import TemplateSelector from './TemplateSelector';
import { scoreReadme, getScoreColor, getScoreLabel } from '../services/readme-scorer';
import type { ReadmeScore } from '../services/readme-scorer';

const PHASES = [
  { threshold: 0,  message: '正在连接 AI 服务...',        progress: 10 },
  { threshold: 2,  message: '正在分析仓库结构...',         progress: 30 },
  { threshold: 5,  message: 'AI 正在生成 README 内容...',   progress: 55 },
  { threshold: 8,  message: '正在优化章节排版...',         progress: 75 },
  { threshold: 10, message: '正在进行质量检查...',         progress: 90 },
];

const STEPS = [
  { label: '仓库', icon: '1' },
  { label: '模板', icon: '2' },
  { label: '生成', icon: '3' },
  { label: '编辑', icon: '4' },
];

export default function ReadmeFunnel() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [localUrl, setLocalUrl] = useState(state.repoUrl);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [copying, setCopying] = useState(false);
  const [readmeScore, setReadmeScore] = useState<ReadmeScore | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const preScanAbortRef = useRef<AbortController | null>(null);

  useEffect(() => { setLocalUrl(state.repoUrl); }, [state.repoUrl]);
  useEffect(() => { return () => preScanAbortRef.current?.abort(); }, []);

  useEffect(() => {
    if (state.generating) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.generating]);

  useEffect(() => {
    if (showResult && state.sections.length > 0) {
      setReadmeScore(scoreReadme(state.title, state.sections));
    }
  }, [showResult, state.title, state.sections]);

  const getMarkdown = useCallback(
    () => assembleMarkdown(state.title, state.preamble, state.sections),
    [state.title, state.preamble, state.sections]
  );

  const isValidUrl = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(localUrl.trim());

  let currentStep = 0;
  if (state.repoInfo) currentStep = 1;
  if (state.repoInfo && state.selectedTemplate) currentStep = 2;
  if (state.sections.length > 0 || state.title) currentStep = 3;

  const handleFetch = useCallback(async (url?: string) => {
    const target = (url ?? localUrl).trim();
    if (!target) return;
    setLocalUrl(target);
    dispatch({ type: 'SET_REPO_URL', payload: target });
    dispatch({ type: 'FETCH_REPO_START' });
    setError(null);
    trackEvent('repo_url_entered', { url: target });
    try {
      const info = await fetchRepoInfo(target);
      dispatch({ type: 'FETCH_REPO_SUCCESS', payload: info });
      trackEvent('repo_fetched', { fullName: info.fullName, language: info.language });
      const parsed = info.fullName.split('/');
      if (parsed.length === 2) {
        preScanAbortRef.current?.abort();
        preScanAbortRef.current = new AbortController();
        preScanProject(parsed[0], parsed[1], info.defaultBranch, preScanAbortRef.current.signal);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '获取仓库信息失败';
      dispatch({ type: 'FETCH_REPO_ERROR', payload: msg });
      setError(msg);
      trackEvent('repo_fetch_failed', { url: target, error: msg });
    }
  }, [localUrl, dispatch]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTemplate || !state.repoInfo) return;
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    dispatch({ type: 'GENERATE_START' });
    setError(null);
    setShowResult(false);
    trackEvent('generation_started', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName });
    try {
      const markdown = await generateReadme({
        repoUrl: state.repoUrl,
        templateId: state.selectedTemplate,
        repoInfo: state.repoInfo,
        strictMode: state.strictMode,
      }, signal);
      const { preamble, sections } = parseSections(markdown);
      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: state.repoInfo.name,
          preamble,
          sections: sections.length > 0 ? sections : [{ id: uuid(), heading: '简介', content: markdown }],
        },
      });
      dispatch({ type: 'SHOW_TOAST', payload: { message: 'README 生成成功', type: 'success' } });
      trackEvent('generation_succeeded', {
        templateId: state.selectedTemplate,
        repo: state.repoInfo.fullName,
        sectionCount: sections.length,
      });
      setShowResult(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : '生成失败';
      const errCode = (err as any).code;
      let userMessage = msg;
      if (errCode === 'RATE_LIMIT') userMessage = '请求太频繁，请稍后再试';
      else if (errCode === 'AUTH_ERROR') userMessage = 'AI 服务配置异常，请联系管理员';
      setError(userMessage);
      dispatch({ type: 'GENERATE_ERROR', payload: userMessage });
      trackEvent('generation_failed', {
        templateId: state.selectedTemplate,
        repo: state.repoInfo?.fullName,
        error: userMessage,
      });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, state.strictMode, dispatch]);

  const handleCancel = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    dispatch({ type: 'GENERATE_ERROR', payload: '已取消生成' });
    dispatch({ type: 'SHOW_TOAST', payload: { message: '已取消生成', type: 'info' } });
  }, [dispatch]);

  const handleCopy = useCallback(async () => {
    const text = getMarkdown();
    setCopying(true);
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setTimeout(() => setCopying(false), 300);
    dispatch({ type: 'SHOW_TOAST', payload: { message: '已复制到剪贴板', type: 'success' } });
  }, [getMarkdown, dispatch]);

  const handleDownload = useCallback(() => {
    const text = getMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${state.title || 'README'}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({ type: 'SHOW_TOAST', payload: { message: 'README 已下载', type: 'success' } });
  }, [getMarkdown, state.title, dispatch]);

  const template = state.selectedTemplate ? templates.find(t => t.id === state.selectedTemplate) : null;
  const phase = (() => { let p = PHASES[0]; for (const ph of PHASES) { if (elapsed >= ph.threshold) p = ph; } return p; })();

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-5">

        {/* MAIN COLUMN: URL + Repo Info + Generating / Result */}
        <div className="space-y-5">
          {/* URL Input Card */}
          <div className="rounded-card border border-neutral-200/80 bg-white p-5 shadow-emboss transition-shadow duration-normal hover:shadow-elevated">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-800">仓库地址</h2>
                <p className="text-[11px] text-neutral-400">粘贴公开 GitHub 仓库链接</p>
              </div>
            </div>
            <div className="relative mt-4">
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="url"
                    autoComplete="url"
                    value={localUrl}
                    onChange={e => setLocalUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && isValidUrl && handleFetch()}
                    placeholder="https://github.com/owner/repo"
                    disabled={state.generating}
                    className="input-field pr-9 text-sm"
                    aria-label="GitHub 仓库地址"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {state.repoLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    ) : localUrl.trim() ? (
                      isValidUrl
                        ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-500">&#x2713;</span>
                        : <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-500">!</span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={() => handleFetch()}
                  disabled={state.repoLoading || !localUrl.trim() || state.generating}
                  className="btn-primary"
                >
                  {state.repoLoading ? '获取中...' : '获取'}
                </button>
              </div>
              {error && !state.repoInfo && (
                <p className="mt-2 text-xs text-red-500">{error}</p>
              )}
            </div>
          </div>

          {/* Repo Info Card */}
          {state.repoInfo && (
            <div className="rounded-card border border-neutral-200/80 bg-white p-5 shadow-emboss transition-shadow duration-normal hover:shadow-elevated">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-emboss">
                  {state.repoInfo.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800 truncate">{state.repoInfo.fullName}</span>
                    {state.repoInfo.license && (
                      <span className="shrink-0 rounded-tag bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">{state.repoInfo.license}</span>
                    )}
                  </div>
                  {state.repoInfo.description && (
                    <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{state.repoInfo.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-400">
                    {state.repoInfo.language && (
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-brand-400" />
                        {state.repoInfo.language}
                      </span>
                    )}
                    {state.repoInfo.stars != null && state.repoInfo.stars > 0 && <span>&#9733; {state.repoInfo.stars.toLocaleString()}</span>}
                    {state.repoInfo.forks != null && state.repoInfo.forks > 0 && <span>&#x2442; {state.repoInfo.forks.toLocaleString()}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && state.repoInfo && (
            <div className="rounded-card border border-red-200/80 bg-red-50 p-4 shadow-emboss">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </span>
                <span className="flex-1 text-sm text-red-600">{error}</span>
                <button
                  onClick={handleGenerate}
                  className="shrink-0 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                >
                  重试
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Template Selector (below bento grid) */}
      {state.repoInfo && (
        <div className="mt-10">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-800">选择排版模板</h2>
              <p className="text-[11px] text-neutral-400">决定 README 的章节结构和风格基调</p>
            </div>
          </div>
          <TemplateSelector />

          {/* Step Progress */}
          <div className="mt-8 mb-6 flex items-center justify-center gap-0">
            {STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.label} className="flex items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-500 ${
                    isCompleted
                      ? 'bg-brand-500 text-white'
                      : isCurrent
                      ? 'border-2 border-brand-500 bg-brand-50 text-brand-600'
                      : 'border border-neutral-200 bg-white text-neutral-300'
                  }`}>
                    {isCompleted ? (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : step.icon}
                  </div>
                  <span className={`ml-1.5 text-[10px] font-medium ${
                    isCurrent ? 'text-brand-600' : isCompleted ? 'text-neutral-500' : 'text-neutral-300'
                  }`}>{step.label}</span>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-3 h-px w-12 ${i < currentStep ? 'bg-brand-400' : 'bg-neutral-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* 生成按钮：选好模板后手动触发 */}
          {state.selectedTemplate && !state.generating && !showResult && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleGenerate}
                className="btn-primary gap-2 px-8 py-3 text-base shadow-emboss transition-all duration-normal hover:shadow-elevated active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                AI 生成 README
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generating / Result — 在严谨模式下方 */}
      {(state.generating || showResult) && (
        <div className="mx-auto mt-8 max-w-3xl">
          {state.generating && (
            <div className="rounded-card border border-neutral-200/80 bg-white p-6 shadow-emboss text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                <div className="absolute h-16 w-16 animate-ping rounded-full bg-brand-200 opacity-30" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
                  <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              </div>
              <p className="mb-4 text-sm font-medium text-brand-700">
                <span key={phase.message} className="inline-block animate-fade-in-up">
                  {phase.message}
                </span>
              </p>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-500 to-emerald-500 transition-all duration-700 ease-out"
                  style={{ width: `${phase.progress}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400">
                已等待 {elapsed} 秒
                {elapsed >= 15 && <span className="text-accent-500"> · 较长，请耐心...</span>}
              </p>
              <button
                onClick={handleCancel}
                className="mt-4 inline-flex items-center gap-1.5 rounded-button border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                取消
              </button>
            </div>
          )}

          {showResult && (
            <div className="rounded-card border border-neutral-200/80 bg-white p-6 shadow-emboss">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-800">生成完成</h3>
                    <p className="text-[11px] text-neutral-400">
                      {state.sections.length} 个章节 · {template?.name || '自定义'} 模板
                    </p>
                  </div>
                </div>
                {readmeScore && (
                  <span className={`shrink-0 rounded-tag px-2 py-0.5 text-[11px] font-semibold ${getScoreColor(readmeScore.total)}`}
                        style={{ backgroundColor: readmeScore.total >= 70 ? '#ecfdf5' : readmeScore.total >= 45 ? '#fffbeb' : '#fef2f2' }}>
                    {getScoreLabel(readmeScore.total)} · {readmeScore.total}
                  </span>
                )}
              </div>

              <div className="mb-4 max-h-36 space-y-1 overflow-y-auto">
                {state.sections.slice(0, 8).map((s, i) => (
                  <div key={s.id || i} className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-1.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-600">
                      {i + 1}
                    </span>
                    <span className="truncate text-xs text-neutral-600">{s.heading}</span>
                  </div>
                ))}
                {state.sections.length > 8 && (
                  <p className="text-center text-[10px] text-neutral-300">+{state.sections.length - 8} 更多</p>
                )}
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    navigate('/editor');
                    dispatch({ type: 'SET_EDITOR_OPEN', payload: true });
                  }}
                  className="btn-primary w-full justify-center"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  进入编辑 & 预览
                </button>
                <div className="flex gap-2">
                  <button onClick={handleCopy} className="btn-secondary flex-1 justify-center text-xs">
                    {copying ? '已复制' : '复制 Markdown'}
                  </button>
                  <button onClick={handleDownload} className="btn-secondary flex-1 justify-center text-xs">
                    下载 .md
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowResult(false);
                    dispatch({ type: 'SELECT_TEMPLATE', payload: '' });
                    dispatch({ type: 'GENERATE_SUCCESS', payload: { title: '', preamble: '', sections: [] } });
                    setReadmeScore(null);
                  }}
                  className="flex w-full items-center justify-center gap-1 text-xs text-neutral-400 transition-colors hover:text-neutral-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  换一个模板重新生成
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
