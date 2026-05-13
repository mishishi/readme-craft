import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateReadme } from '../services/api';
import { assembleMarkdown, parseSections } from '../services/markdown';
import { uuid } from '../utils/uuid';
import { templates } from '../templates';
import Modal from './Modal';
import RepoPreview from './RepoPreview';
import { trackEvent } from '../services/tracking';
import { scoreReadme, getScoreColor, getScoreLabel } from '../services/readme-scorer';
import type { ReadmeScore } from '../services/readme-scorer';

const PHASES = [
  { threshold: 0,  message: '正在连接 AI 服务...',        progress: 10, color: 'from-primary-500 to-blue-500' },
  { threshold: 2,  message: '正在分析仓库结构...',         progress: 30, color: 'from-blue-500 to-cyan-500' },
  { threshold: 5,  message: 'AI 正在生成 README 内容...',   progress: 55, color: 'from-cyan-500 to-teal-500' },
  { threshold: 8,  message: '正在优化章节排版...',         progress: 75, color: 'from-teal-500 to-emerald-500' },
  { threshold: 10, message: '正在进行质量检查...',         progress: 90, color: 'from-primary-500 to-green-500' },
];

export default function GenerateSection() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [copying, setCopying] = useState(false);
  const [readmeScore, setReadmeScore] = useState<ReadmeScore | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.generating) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.generating]);

  // Watch state.showResultCard — set when generation is triggered externally (Demo / Showcase)
  useEffect(() => {
    if (state.showResultCard && state.sections.length > 0) {
      setShowResult(true);
      // Auto-scroll result card into view
      setTimeout(() => {
        document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [state.showResultCard, state.sections.length]);

  // Calculate quality score when result is shown
  useEffect(() => {
    if (showResult && state.sections.length > 0) {
      setReadmeScore(scoreReadme(state.title, state.sections));
    }
  }, [showResult, state.title, state.sections]);

  const getMarkdown = useCallback(
    () => assembleMarkdown(state.title, state.preamble, state.sections),
    [state.title, state.preamble, state.sections]
  );

  const handleCopyFromResult = useCallback(async () => {
    const text = getMarkdown();
    setCopying(true);
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
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => {
      setCopying(false);
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: '已复制到剪贴板', type: 'success' },
      });
    }, 300);
  }, [getMarkdown, dispatch]);

  const handleDownloadFromResult = useCallback(() => {
    const text = getMarkdown();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.title || 'README'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: 'README 已下载', type: 'success' },
    });
  }, [getMarkdown, state.title, dispatch]);

  const handleEnterEditor = useCallback(() => {
    dispatch({ type: 'HIDE_RESULT_CARD' });
    navigate('/editor', { state: { fromGeneration: true } });
  }, [navigate, dispatch]);

  const handleSwitchTemplate = useCallback(() => {
    setShowResult(false);
    dispatch({ type: 'HIDE_RESULT_CARD' });
    setError(null);
    document.getElementById('template-selector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [dispatch]);

  // Phase-based progress: derive from elapsed time, never cycles back
  const phase = (() => {
    let p = PHASES[0];
    for (const ph of PHASES) {
      if (elapsed >= ph.threshold) p = ph;
    }
    return p;
  })();
  const phaseIndex = PHASES.indexOf(phase);

  const template = state.selectedTemplate ? templates.find((t) => t.id === state.selectedTemplate) : null;
  const sectionCount = state.sections.length;
  const canGenerate = state.selectedTemplate && state.repoInfo;

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    dispatch({ type: 'GENERATE_ERROR', payload: '已取消生成' });
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: '已取消生成', type: 'info' },
    });
  }, [dispatch]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTemplate || !state.repoInfo) return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    dispatch({ type: 'GENERATE_START' });
    dispatch({ type: 'HIDE_RESULT_CARD' });
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
          sections: sections.length > 0 ? sections : [
            { id: uuid(), heading: '简介', content: markdown },
          ],
        },
      });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: 'README 生成成功', type: 'success' },
      });
      trackEvent('generation_succeeded', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName, sectionCount: sections.length });
      setShowResult(true);
      // Auto-scroll result card into view
      setTimeout(() => {
        document.getElementById('generate-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户取消，不做任何处理
      }
      const msg = err instanceof Error ? err.message : '生成失败';
      const errCode = (err as any).code;
      let userMessage = msg;
      if (errCode === 'RATE_LIMIT') {
        userMessage = '请求太频繁，请稍后再试';
      } else if (errCode === 'AUTH_ERROR') {
        userMessage = 'AI 服务配置异常，请联系管理员';
      }
      setError(userMessage);
      dispatch({ type: 'GENERATE_ERROR', payload: userMessage });
      trackEvent('generation_failed', { templateId: state.selectedTemplate, repo: state.repoInfo?.fullName, error: userMessage });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, dispatch, navigate]);

  return (
    <div id="generate-section" className="mt-8 text-center">
      {state.generating ? (
        <div className="mx-auto max-w-sm rounded-card border border-primary-100 bg-gradient-to-b from-primary-50/50 to-white p-8 shadow-sm">
          {/* Spinner */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary-200 opacity-30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-200">
              <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>

          {/* 阶段化生成状态 — 单向推进，永不回退 */}
          <p className="mb-4 text-sm font-medium text-primary-700 transition-opacity">
            <span key={phase.message} className="animate-fade-in-up inline-block">
              {phase.message}
              {phaseIndex >= 2 && <span className="animate-pulse">..</span>}
            </span>
          </p>

          {/* 确定进度条 — 阶段色渐变 */}
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${phase.color} transition-all duration-700 ease-out`}
              style={{ width: `${phase.progress}%` }}
            />
          </div>

          <p className="text-xs text-muted-400">
            已等待 {elapsed} 秒
            {elapsed >= 15 && <span className="text-accent-500"> · 生成时间较长，请耐心等待...</span>}
          </p>
          <button
            onClick={handleCancel}
            className="mt-4 inline-flex items-center gap-1.5 rounded-button border border-muted-200 bg-white px-4 py-2 text-sm font-medium text-muted-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消生成
          </button>
        </div>
      ) : showResult && sectionCount > 0 ? (
        /* 生成结果摘要卡片 */
        <div className="mx-auto max-w-lg text-left">
          <div className="overflow-hidden rounded-card border border-primary-200 bg-white shadow-sm ring-1 ring-primary-50">
            {/* 头部 */}
            <div className="flex items-center gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-white px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-900">README 已生成</h3>
                <p className="text-xs text-muted-500">
                  {template?.name || '未知模板'} · {sectionCount} 章节
                  {state.repoInfo?.language && <span> · {state.repoInfo.language}</span>}
                </p>
              </div>
            </div>

            {/* 仓库信息 */}
            <div className="border-b border-muted-100 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-500">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="font-medium text-muted-700">{state.repoInfo?.fullName}</span>
                {state.repoInfo?.license && (
                  <><span className="text-muted-300">·</span>{state.repoInfo.license}</>
                )}
                {state.repoInfo?.stars != null && state.repoInfo.stars > 0 && (
                  <><span className="text-muted-300">·</span>⭐ {state.repoInfo.stars}</>
                )}
              </div>
            </div>

            {/* 章节预览 */}
            <div className="border-b border-muted-100 px-5 py-3">
              <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-400">章节预览</span>
              <div className="max-h-32 space-y-1 overflow-y-auto">
                {state.sections.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-muted-600">
                    <span className="shrink-0 w-4 text-right text-[10px] text-muted-300">{i + 1}</span>
                    <span className="truncate">{s.heading || '未命名章节'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 质量评分仪表盘 */}
            {readmeScore && (
              <div className="border-b border-muted-100 px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-400">质量评分</span>
                  <span className={`text-xs font-semibold ${getScoreColor(readmeScore.total)}`}>
                    {getScoreLabel(readmeScore.total)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      readmeScore.total >= 70 ? 'bg-primary-500' : readmeScore.total >= 45 ? 'bg-accent-500' : 'bg-red-400'
                    }`}
                    style={{ width: `${readmeScore.total}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-400">
                  <span title="章节数量与结构完整性">章节 {readmeScore.checks.sections}/30</span>
                  <span title="内容深度与信息量">内容 {readmeScore.checks.substance}/30</span>
                  <span title="细节丰富度（示例、数据、配置）">细节 {readmeScore.checks.details}/25</span>
                  <span title="语言表达与文档规范">语言 {readmeScore.checks.language}/15</span>
                </div>
              </div>
            )}

            {/* 操作按钮 — 层次化引导 */}
            <div className="space-y-2 px-5 py-4">
              {/* 一级：主要操作 — 进入编辑 */}
              <button
                onClick={handleEnterEditor}
                className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-primary-700 hover:to-primary-600 hover:shadow-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                </svg>
                进入编辑 & 预览
              </button>

              {/* 二级：快速导出 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFromResult}
                  disabled={copying}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-button border border-muted-200 bg-white px-3 py-2 text-xs font-medium text-muted-600 transition-colors hover:border-muted-300 hover:bg-muted-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copying ? (
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  )}
                  复制
                </button>
                <button
                  onClick={handleDownloadFromResult}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-button border border-muted-200 bg-white px-3 py-2 text-xs font-medium text-muted-600 transition-colors hover:border-muted-300 hover:bg-muted-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  下载 .md
                </button>
              </div>

              {/* 三级：换模板 */}
              <div className="text-center">
                <button
                  onClick={handleSwitchTemplate}
                  className="inline-flex items-center gap-1 text-xs text-muted-400 transition-colors hover:text-accent-500"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  不满意？换模板重新生成
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canGenerate}
            className={`btn-primary gap-3 px-8 py-3 text-base ${canGenerate && !state.generating ? 'shadow-lg shadow-primary-200 hover:shadow-primary-300' : ''} ${canGenerate && !state.generating && showPulse ? 'animate-pulse' : ''}`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            AI 一键生成 README
          </button>

          {!state.selectedTemplate && (
            <p className="mt-2 text-sm text-muted-400">请先选择一个模板风格</p>
          )}
        </>
      )}

      {showConfirm && state.selectedTemplate && (
        <Modal
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => { setShowConfirm(false); handleGenerate(); }}
          title="确认生成 README"
          confirmText="确认生成"
          hideIcon
          containerClassName="max-w-lg"
        >
          <p className="mb-4 text-sm text-muted-500">
            将使用「{template?.name || '未知'}」模板为 <strong className="text-muted-700">{state.repoInfo?.fullName || state.repoInfo?.name}</strong> 生成 README，确认开始？
          </p>

          {template && state.repoInfo && (
            <div className="mb-5 overflow-hidden rounded-card border border-muted-200 shadow-sm">
              <div className={`bg-gradient-to-br ${template.preview.gradient} p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center text-primary-500">{template.preview.icon}</span>
                  <span className="text-sm font-semibold text-muted-600">{template.name}</span>
                </div>
                <div className="max-w-[260px]">
                  <RepoPreview repoInfo={state.repoInfo} templateId={template.id} />
                </div>
              </div>
              <div className="px-4 py-3 text-xs text-muted-500 bg-muted-50 border-t border-muted-100">
                仓库: <span className="font-medium text-muted-700">{state.repoInfo.fullName}</span>
                {state.repoInfo.language && <span className="ml-2">· {state.repoInfo.language}</span>}
                {state.repoInfo.license && <span className="ml-2">· {state.repoInfo.license}</span>}
              </div>
            </div>
          )}
        </Modal>
      )}

      {error && (
        <div className="mx-auto mt-3 max-w-md">
          <div className="flex items-center gap-3 rounded-card bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <span className="flex-1">{error}</span>
            <button
              onClick={handleGenerate}
              className="shrink-0 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              重试
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-muted-400">
            <button
              onClick={() => navigate('/')}
              className="transition-colors hover:text-primary-500"
            >
              切换其他模板
            </button>
            {state.sections.length > 0 && (
              <button
                onClick={() => navigate('/editor')}
                className="transition-colors hover:text-primary-500"
              >
                返回编辑
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
