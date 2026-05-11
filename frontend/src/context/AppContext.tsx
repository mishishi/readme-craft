import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  step: 'input',
  repoUrl: '',
  repoInfo: null,
  repoLoading: false,
  repoError: null,
  selectedTemplate: null,
  generating: false,
  generateError: null,
  title: '',
  sections: [],
  toast: null,
  activeSectionId: null,
  collapsedSections: [],
};

const SESSION_KEY = 'readme-craft-state';

function loadInitialState(): AppState {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AppState;
      return { ...parsed, collapsedSections: parsed.collapsedSections ?? [], repoLoading: false, repoError: null, generating: false, generateError: null, toast: null };
    }
  } catch {}
  return initialState;
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
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        generating: false,
        title: action.payload.title,
        sections: action.payload.sections,
        step: 'edit' as const,
      };
    case 'GENERATE_ERROR':
      return { ...state, generating: false, generateError: action.payload, step: 'template' as const };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, content: action.payload.content } : s
        ),
      };
    case 'UPDATE_SECTION_HEADING':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, heading: action.payload.heading } : s
        ),
      };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'DISMISS_TOAST':
      return { ...state, toast: null };
    case 'BACK_TO_INPUT':
      return { ...state, step: 'input', sections: [], title: '', generating: false, generateError: null };
    case 'BACK_TO_TEMPLATE':
      return { ...state, step: 'template', generating: false, generateError: null };
    case 'ADD_SECTION': {
      const newSection = {
        id: crypto.randomUUID(),
        heading: action.payload?.heading || '新章节',
        content: '',
      };
      return { ...state, sections: [...state.sections, newSection] };
    }
    case 'DELETE_SECTION':
      return { ...state, sections: state.sections.filter((s) => s.id !== action.payload.id) };
    case 'MOVE_SECTION': {
      const idx = state.sections.findIndex((s) => s.id === action.payload.id);
      if (idx === -1) return state;
      const sections = [...state.sections];
      const targetIdx = action.payload.direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sections.length) return state;
      [sections[idx], sections[targetIdx]] = [sections[targetIdx], sections[idx]];
      return { ...state, sections };
    }
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSectionId: action.payload };
    case 'MOVE_SECTION_TO': {
      const fromIdx = state.sections.findIndex((s) => s.id === action.payload.id);
      if (fromIdx === -1) return state;
      const sections = [...state.sections];
      const [removed] = sections.splice(fromIdx, 1);
      sections.splice(action.payload.toIndex, 0, removed);
      return { ...state, sections };
    }
    case 'SET_COLLAPSED': {
      const collapsedSections = action.payload.collapsed
        ? [...state.collapsedSections, action.payload.id]
        : state.collapsedSections.filter((id) => id !== action.payload.id);
      return { ...state, collapsedSections };
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
      const { toast, repoLoading, repoError, generating, generateError, activeSectionId, ...persistable } = state;
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
