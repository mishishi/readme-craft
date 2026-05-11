import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  repoUrl: '',
  repoInfo: null,
  repoLoading: false,
  repoError: null,
  selectedTemplate: null,
  generating: false,
  generateError: null,
  title: '',
  preamble: '',
  sections: [],
  toast: null,
  toasts: [],
  activeSectionId: null,
  collapsedSections: [],
  history: [],
  historyIndex: -1,
};

const SESSION_KEY = 'readme-craft-state';

function loadInitialState(): AppState {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      return { ...parsed, collapsedSections: parsed.collapsedSections ?? [], history: [], historyIndex: -1, repoLoading: false, repoError: null, generating: false, generateError: null, toast: null, toasts: [] };
    }
  } catch {}
  return initialState;
}

const MAX_HISTORY = 50;

function pushHistory(state: AppState): { history: AppState['history']; historyIndex: number } {
  const snapshot = { title: state.title, preamble: state.preamble, sections: state.sections };
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(snapshot);
  while (history.length > MAX_HISTORY) history.shift();
  return { history, historyIndex: history.length - 1 };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload, repoError: null };
    case 'FETCH_REPO_START':
      return { ...state, repoLoading: true, repoError: null, repoInfo: null };
    case 'FETCH_REPO_SUCCESS':
      return { ...state, repoLoading: false, repoInfo: action.payload };
    case 'FETCH_REPO_ERROR':
      return { ...state, repoLoading: false, repoError: action.payload };
    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'GENERATE_START':
      return { ...state, generating: true, generateError: null };
    case 'GENERATE_SUCCESS': {
      const genHistory = pushHistory(state);
      return {
        ...state,
        ...genHistory,
        generating: false,
        title: action.payload.title,
        preamble: action.payload.preamble,
        sections: action.payload.sections,
      };
    }
    case 'GENERATE_ERROR':
      return { ...state, generating: false, generateError: action.payload };
    case 'SET_TITLE': {
      const titleHistory = pushHistory(state);
      return { ...state, ...titleHistory, title: action.payload };
    }
    case 'UPDATE_SECTION': {
      const updHistory = pushHistory(state);
      return {
        ...state,
        ...updHistory,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, content: action.payload.content } : s
        ),
      };
    }
    case 'UPDATE_SECTION_HEADING': {
      const headingHistory = pushHistory(state);
      return {
        ...state,
        ...headingHistory,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, heading: action.payload.heading } : s
        ),
      };
    }
    case 'SHOW_TOAST': {
      const id = action.payload.id || crypto.randomUUID();
      return { ...state, toast: { ...action.payload, id }, toasts: [...state.toasts, { ...action.payload, id }] };
    }
    case 'DISMISS_TOAST': {
      if (action.payload) {
        return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload), toast: state.toast?.id === action.payload ? null : state.toast };
      }
      return { ...state, toast: null, toasts: state.toasts.slice(1) };
    }
    case 'CLEAR_CONTENT':
      return { ...state, sections: [], title: '', preamble: '', generating: false, generateError: null };
    case 'ADD_SECTION': {
      const addHistory = pushHistory(state);
      const newSection = {
        id: crypto.randomUUID(),
        heading: action.payload?.heading || '新章节',
        content: '',
      };
      return { ...state, ...addHistory, sections: [...state.sections, newSection] };
    }
    case 'DELETE_SECTION': {
      const delHistory = pushHistory(state);
      return { ...state, ...delHistory, sections: state.sections.filter((s) => s.id !== action.payload.id) };
    }
    case 'MOVE_SECTION': {
      const moveHistory = pushHistory(state);
      const idx = state.sections.findIndex((s) => s.id === action.payload.id);
      if (idx === -1) return state;
      const sections = [...state.sections];
      const targetIdx = action.payload.direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sections.length) return state;
      [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
      return { ...state, ...moveHistory, sections };
    }
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSectionId: action.payload };
    case 'MOVE_SECTION_TO': {
      const moveToHistory = pushHistory(state);
      const fromIdx = state.sections.findIndex((s) => s.id === action.payload.id);
      if (fromIdx === -1) return state;
      const sections = [...state.sections];
      const [removed] = sections.splice(fromIdx, 1);
      sections.splice(action.payload.toIndex, 0, removed);
      return { ...state, ...moveToHistory, sections };
    }
    case 'SET_COLLAPSED': {
      const collapsedSections = action.payload.collapsed
        ? [...state.collapsedSections, action.payload.id]
        : state.collapsedSections.filter((id) => id !== action.payload.id);
      return { ...state, collapsedSections };
    }
    case 'UNDO': {
      if (state.historyIndex < 0) return state;
      const prevSnapshot = state.history[state.historyIndex];
      return {
        ...state,
        title: prevSnapshot.title,
        preamble: prevSnapshot.preamble,
        sections: prevSnapshot.sections,
        historyIndex: state.historyIndex - 1,
      };
    }
    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextSnapshot = state.history[state.historyIndex + 1];
      return {
        ...state,
        title: nextSnapshot.title,
        preamble: nextSnapshot.preamble,
        sections: nextSnapshot.sections,
        historyIndex: state.historyIndex + 1,
      };
    }
    case 'RESET':
      try { sessionStorage.removeItem(SESSION_KEY); } catch {}
      return initialState;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      const { toast, toasts, repoLoading, repoError, generating, generateError, activeSectionId, history, historyIndex, ...persistable } = state;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(persistable));
    } catch {}
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
