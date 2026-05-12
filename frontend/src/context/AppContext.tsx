import { createContext, useContext, useEffect, useRef, useMemo, useCallback, type ReactNode } from 'react';
import type { AppState, AppAction } from '../types';
import { RepoProvider, useRepo, type RepoState } from './RepoContext';
import { EditorProvider, useEditor, type EditorState } from './EditorContext';
import { UIProvider, useUI, type UIState } from './UIContext';
import { saveEntry } from '../services/history';
import { templates } from '../templates';

const SESSION_KEY = 'readme-craft-state';

function loadInitialState() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      return JSON.parse(saved) as Record<string, unknown>;
    }
  } catch {}
  return {};
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

function CombinedProvider({ children }: { children: ReactNode }) {
  const repo = useRepo();
  const editor = useEditor();
  const ui = useUI();

  const state = useMemo<AppState>(
    () => ({
      ...repo.state,
      ...editor.state,
      ...ui.state,
    }),
    [repo.state, editor.state, ui.state]
  );

  const dispatch = useCallback(
    (action: AppAction) => {
      repo.dispatch(action);
      editor.dispatch(action);
      ui.dispatch(action);
    },
    [repo.dispatch, editor.dispatch, ui.dispatch]
  );

  // Auto-save to persistent history when generation completes
  const prevGeneratingRef = useRef(editor.state.generating);
  useEffect(() => {
    if (prevGeneratingRef.current && !editor.state.generating && editor.state.sections.length > 0 && repo.state.repoInfo) {
      saveEntry({
        repoFullName: repo.state.repoInfo.fullName,
        repoUrl: repo.state.repoUrl,
        templateId: editor.state.selectedTemplate || '',
        templateName: templates.find((t) => t.id === editor.state.selectedTemplate)?.name || '',
        title: editor.state.title,
        preamble: editor.state.preamble,
        sections: editor.state.sections,
      });
    }
    prevGeneratingRef.current = editor.state.generating;
  }, [editor.state.generating, editor.state.sections, editor.state.title, editor.state.preamble, editor.state.selectedTemplate, repo.state.repoInfo, repo.state.repoUrl]);

  // Auto-save to sessionStorage for page-refresh recovery
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          repoUrl: repo.state.repoUrl,
          repoInfo: repo.state.repoInfo,
          selectedTemplate: editor.state.selectedTemplate,
          title: editor.state.title,
          preamble: editor.state.preamble,
          sections: editor.state.sections,
          collapsedSections: editor.state.collapsedSections,
          strictMode: editor.state.strictMode,
        }));
      } catch {}
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo.state.repoUrl, repo.state.repoInfo, editor.state.selectedTemplate, editor.state.title, editor.state.preamble, editor.state.sections, editor.state.collapsedSections, editor.state.strictMode]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const saved = loadInitialState();

  const repoInitial: Partial<RepoState> = {};
  if (saved.repoUrl) repoInitial.repoUrl = saved.repoUrl as string;
  if (saved.repoInfo) repoInitial.repoInfo = saved.repoInfo as RepoState['repoInfo'];

  const editorInitial: Partial<EditorState> = {};
  if (saved.selectedTemplate) editorInitial.selectedTemplate = saved.selectedTemplate as string;
  if (saved.title) editorInitial.title = saved.title as string;
  if (saved.preamble) editorInitial.preamble = saved.preamble as string;
  if (saved.sections) editorInitial.sections = saved.sections as EditorState['sections'];
  if (saved.collapsedSections) editorInitial.collapsedSections = saved.collapsedSections as string[];
  if (saved.strictMode) editorInitial.strictMode = saved.strictMode as boolean;

  return (
    <RepoProvider initialState={repoInitial}>
      <EditorProvider initialState={editorInitial}>
        <UIProvider>
          <CombinedProvider>
            {children}
          </CombinedProvider>
        </UIProvider>
      </EditorProvider>
    </RepoProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
