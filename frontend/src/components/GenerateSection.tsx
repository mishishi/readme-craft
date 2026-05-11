import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateReadme } from '../services/api';
import { parseSections } from '../services/markdown';
import { templates } from '../templates';
import type { RepoInfo } from '../types';
import Modal from './Modal';
import { trackEvent } from '../services/tracking';

const STATUS_MESSAGES = [
  '正在分析仓库结构...',
  '正在提取项目信息...',
  '正在生成 README 内容...',
  '正在优化章节排版...',
];

/** 确认弹窗中的动态预览 — 使用用户实际仓库信息，按模板风格展示 */
function RepoPreview({ repoInfo, templateId }: { repoInfo: RepoInfo; templateId: string }) {
  const { name, description, language, owner, license } = repoInfo;
  switch (templateId) {
    case 'minimal':
      return (
        <div className="w-full rounded-md bg-white p-3 font-sans text-[10px] leading-relaxed text-gray-700">
          <div className="mb-1 text-xs font-bold text-gray-900">{name}</div>
          <p className="mb-1.5 text-[9px] leading-relaxed text-gray-500">{description}</p>
          <div className="mb-1.5 text-[9px]">
            <span className="font-medium text-gray-700">Features</span>
          </div>
          <ul className="mb-1.5 list-inside list-disc space-y-[2px] text-[9px] text-gray-600">
            <li>Lightweight and fast</li>
            <li>Easy integration</li>
            <li>Developer friendly</li>
          </ul>
          <div className="rounded bg-gray-100 p-1.5 font-mono text-[8px] text-gray-700">
            {language ? `${language.toLowerCase()} install ${name}` : 'npm install'}
          </div>
          <div className="mt-1.5 border-t border-gray-100 pt-1 text-[8px] text-gray-400">
            {license || 'MIT'} © {owner}
          </div>
        </div>
      );
    case 'badges':
      return (
        <div className="w-full rounded-md bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-[3px]">
            <span className="rounded-sm bg-[#f59e0b] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">version 1.0</span>
            <span className="rounded-sm bg-[#f43f5e] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">{license || 'MIT'}</span>
            <span className="rounded-sm bg-[#ea580c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">{language || 'JavaScript'}</span>
            <span className="rounded-sm bg-[#fb923c] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">★ stars</span>
            <span className="rounded-sm bg-[#ef4444] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">passing</span>
            <span className="rounded-sm bg-[#f97316] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">92%</span>
            <span className="rounded-sm bg-[#eab308] px-1.5 py-[2px] text-[7px] font-medium text-white leading-none">ready</span>
          </div>
          <div className="mb-1.5">
            <div className="flex border-b border-gray-200 pb-1 text-[8px] font-semibold text-gray-600">
              <span className="w-1/3">特性</span>
              <span className="w-2/3">说明</span>
            </div>
            <div className="flex border-b border-gray-100 py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-amber-600">⚡ Fast</span>
              <span className="w-2/3">Sub-second response</span>
            </div>
            <div className="flex border-b border-gray-100 py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-orange-600">🎯 Simple</span>
              <span className="w-2/3">Zero config setup</span>
            </div>
            <div className="flex py-1 text-[8px] text-gray-500">
              <span className="w-1/3 font-medium text-rose-600">🔥 Hot</span>
              <span className="w-2/3">Live reload included</span>
            </div>
          </div>
          <div className="rounded bg-amber-50 p-1.5 text-[8px] text-amber-800">
            <span className="font-semibold">Stack:</span> {language || 'TypeScript'} · Node.js · Vite
          </div>
        </div>
      );
    case 'enterprise':
      return (
        <div className="w-full rounded-md bg-white">
          <div className="flex justify-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <span className="rounded-sm bg-[#6366f1] px-1.5 py-[2px] text-[7px] font-medium text-white">v2.0</span>
            <span className="rounded-sm bg-[#3b82f6] px-1.5 py-[2px] text-[7px] font-medium text-white">build</span>
            <span className="rounded-sm bg-[#1e40af] px-1.5 py-[2px] text-[7px] font-medium text-white">{license || 'MIT'}</span>
          </div>
          <div className="p-3 pt-2">
            <div className="mb-1.5 text-[10px] font-bold text-gray-900">{name}</div>
            <div className="mb-2 overflow-hidden rounded border border-gray-200 text-[8px]">
              <div className="flex bg-indigo-50 px-1.5 py-1 font-semibold text-indigo-700">
                <span className="w-[34%]">Module</span>
                <span className="w-[33%]">Description</span>
                <span className="w-[33%]">Use Case</span>
              </div>
              <div className="flex border-t border-gray-100 px-1.5 py-1 text-gray-600">
                <span className="w-[34%] font-medium">Auth</span>
                <span className="w-[33%]">Auth system</span>
                <span className="w-[33%]">Login flow</span>
              </div>
              <div className="flex border-t border-gray-100 px-1.5 py-1 text-gray-600">
                <span className="w-[34%] font-medium">Cache</span>
                <span className="w-[33%]">Redis cache</span>
                <span className="w-[33%]">Performance</span>
              </div>
              <div className="flex border-t border-gray-100 px-1.5 py-1 text-gray-600">
                <span className="w-[34%] font-medium">{language || 'API'}</span>
                <span className="w-[33%]">REST endpoint</span>
                <span className="w-[33%]">Integration</span>
              </div>
            </div>
            <div className="rounded bg-gray-900 p-1.5 font-mono text-[8px] text-green-400">
              npm install &amp;&amp; npm run build
            </div>
          </div>
        </div>
      );
    case 'cards':
      return (
        <div className="w-full rounded-md bg-gradient-to-br from-emerald-50 to-teal-50 p-3">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[11px]">✨</span>
            <span className="text-[10px] font-bold text-gray-800">{name}</span>
          </div>
          <div className="mb-1 rounded border-l-2 border-emerald-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-emerald-700">
              <span>🌟</span> Highlights
            </div>
            <p className="mt-[2px] text-[8px] text-gray-500 leading-relaxed">{description}</p>
          </div>
          <div className="mb-1 rounded border-l-2 border-teal-400 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex items-center gap-1 text-[9px] font-medium text-teal-700">
              <span>🎯</span> Features
            </div>
            <p className="mt-[2px] text-[8px] text-gray-500 leading-relaxed">
              {language || 'Cross-platform'} · Zero config · Fast setup
            </p>
          </div>
          <div className="text-[8px] text-gray-600">
            <span className="font-medium text-gray-700">{owner}</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-gray-500">{name}</span>
            <span className="mx-1 text-emerald-400">→</span>
            <span className="text-gray-500">{license || 'Open Source'}</span>
          </div>
        </div>
      );
    case 'showcase':
      return (
        <div className="w-full overflow-hidden rounded-md">
          <div className="flex h-10 items-center justify-center bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 px-3">
            <span className="text-[9px] font-semibold tracking-wider text-white/80">
              {name.toUpperCase()}
            </span>
          </div>
          <div className="bg-white p-3">
            <p className="mb-1.5 text-[9px] leading-relaxed text-gray-600">{description}</p>
            <div className="mb-1.5 space-y-[2px] text-[8px]">
              <div className="text-emerald-600">
                <span className="mr-1">☑</span> {language || 'Core'} support
              </div>
              <div className="text-gray-400">
                <span className="mr-1 text-gray-300">☐</span> V3 plugin system
              </div>
              <div className="text-gray-400">
                <span className="mr-1 text-gray-300">☐</span> WebAssembly port
              </div>
            </div>
            <div className="border-t border-gray-100 pt-1 text-[8px] italic text-gray-400">
              "{description?.slice(0, 40) || 'Build something amazing.'}"
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full rounded-md bg-white p-3 text-[10px] text-gray-700">
          <div className="font-bold text-gray-900">{name}</div>
          <p className="text-gray-500">{description}</p>
        </div>
      );
  }
}

export default function GenerateSection({ onGenerated }: { onGenerated?: () => void }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (state.generating) {
      setElapsed(0);
      setStatusIdx(0);
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
      statusTimerRef.current = setInterval(() => {
        setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    };
  }, [state.generating]);

  const canGenerate = state.selectedTemplate && state.repoInfo;

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (onGenerated) {
      dispatch({ type: 'CLEAR_CONTENT' });
    } else {
      navigate('/');
    }
  }, [dispatch, navigate, onGenerated]);

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTemplate || !state.repoInfo) return;

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    dispatch({ type: 'GENERATE_START' });
    setError(null);
    trackEvent('generation_started', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName });

    try {
      const markdown = await generateReadme({
        repoUrl: state.repoUrl,
        templateId: state.selectedTemplate,
        repoInfo: state.repoInfo,
      }, signal);

      const { preamble, sections } = parseSections(markdown);

      dispatch({
        type: 'GENERATE_SUCCESS',
        payload: {
          title: state.repoInfo.name,
          preamble,
          sections: sections.length > 0 ? sections : [
            { id: crypto.randomUUID(), heading: '简介', content: markdown },
          ],
        },
      });
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: onGenerated ? 'README 生成成功' : 'README 生成成功，已跳转到编辑页面', type: 'success' },
      });
      trackEvent('generation_succeeded', { templateId: state.selectedTemplate, repo: state.repoInfo.fullName, sectionCount: sections.length });
      if (onGenerated) {
        onGenerated();
      } else {
        navigate('/editor', { state: { fromGeneration: true } });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // 用户取消，不做任何处理
      }
      const msg = err instanceof Error ? err.message : '生成失败';
      setError(msg);
      dispatch({ type: 'GENERATE_ERROR', payload: msg });
      trackEvent('generation_failed', { templateId: state.selectedTemplate, repo: state.repoInfo?.fullName, error: msg });
    }
  }, [state.selectedTemplate, state.repoInfo, state.repoUrl, dispatch, navigate]);

  return (
    <div id="generate-section" className="mt-8 text-center">
      {state.generating ? (
        <div className="mx-auto max-w-sm rounded-xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-8 shadow-sm">
          {/* Spinner */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
            <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-200 opacity-30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
              <svg className="h-7 w-7 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>

          {/* 生成状态 — 每 3 秒循环切换文案 */}
          <p className="mb-4 text-sm font-medium text-indigo-700 transition-opacity">
            <span key={statusIdx} className="animate-fade-in-up inline-block">{STATUS_MESSAGES[statusIdx]}</span>
          </p>

          {/* 不确定进度条 */}
          <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
            <div className="h-full w-full origin-left animate-[indeterminate_1.5s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          </div>

          <p className="text-xs text-gray-400">
            已等待 {elapsed} 秒
            {elapsed >= 15 && <span className="text-amber-500"> · 生成时间较长，请耐心等待...</span>}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            首次生成稍慢，同一仓库再次生成会更快
          </p>
          <button
            onClick={handleCancel}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            取消生成
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canGenerate}
            className={`btn-primary gap-3 px-8 py-3 text-base ${canGenerate && !state.generating ? 'shadow-lg shadow-indigo-200 hover:shadow-indigo-300' : ''} ${canGenerate && !state.generating && showPulse ? 'animate-pulse' : ''}`}
          >
            <span>✨</span>
            AI 一键生成 README
          </button>

          {!state.selectedTemplate && (
            <p className="mt-2 text-sm text-gray-400">请先选择一个模板风格</p>
          )}
        </>
      )}

      {showConfirm && state.selectedTemplate && (() => {
        const template = templates.find((t) => t.id === state.selectedTemplate);
        return (
          <Modal
            open={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => { setShowConfirm(false); handleGenerate(); }}
            title="确认生成 README"
            confirmText="确认生成"
            hideIcon
            containerClassName="max-w-lg"
          >
            <p className="mb-4 text-sm text-gray-500">
              将使用「{template?.name || '未知'}」模板为 <strong className="text-gray-700">{state.repoInfo?.fullName || state.repoInfo?.name}</strong> 生成 README，确认开始？
            </p>

            {template && state.repoInfo && (
              <div className="mb-5 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <div className={`bg-gradient-to-br ${template.preview.gradient} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{template.preview.icon}</span>
                    <span className="text-sm font-semibold text-gray-600">{template.name}</span>
                  </div>
                  <div className="max-w-[260px]">
                    <RepoPreview repoInfo={state.repoInfo} templateId={template.id} />
                  </div>
                </div>
                <div className="px-4 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
                  仓库: <span className="font-medium text-gray-700">{state.repoInfo.fullName}</span>
                  {state.repoInfo.language && <span className="ml-2">· {state.repoInfo.language}</span>}
                  {state.repoInfo.license && <span className="ml-2">· {state.repoInfo.license}</span>}
                </div>
              </div>
            )}
          </Modal>
        );
      })()}

      {error && (
        <div className="mx-auto mt-3 max-w-md">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <span className="flex-1">{error}</span>
            <button
              onClick={handleGenerate}
              className="shrink-0 rounded-md bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              重试
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
            <button
              onClick={() => navigate('/')}
              className="transition-colors hover:text-indigo-500"
            >
              切换其他模板
            </button>
            {state.sections.length > 0 && (
              <button
                onClick={() => navigate('/editor')}
                className="transition-colors hover:text-indigo-500"
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
