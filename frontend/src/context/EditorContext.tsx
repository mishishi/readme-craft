import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Section, AppAction } from '../types';

export interface EditorState {
  selectedTemplate: string | null;
  generating: boolean;
  generateError: string | null;
  title: string;
  preamble: string;
  sections: Section[];
  showResultCard: boolean;
  activeSectionId: string | null;
  collapsedSections: string[];
  history: { title: string; preamble: string; sections: Section[] }[];
  historyIndex: number;
  strictMode: boolean;
}

const initialEditorState: EditorState = {
  selectedTemplate: null,
  generating: false,
  generateError: null,
  title: '',
  preamble: '',
  sections: [],
  showResultCard: false,
  activeSectionId: null,
  collapsedSections: [],
  history: [],
  historyIndex: -1,
  strictMode: false,
};

const MAX_HISTORY = 50;

function pushHistory(state: EditorState): { history: EditorState['history']; historyIndex: number } {
  const snapshot = { title: state.title, preamble: state.preamble, sections: state.sections };
  const history = state.history.slice(0, state.historyIndex + 1);
  history.push(snapshot);
  while (history.length > MAX_HISTORY) history.shift();
  return { history, historyIndex: history.length - 1 };
}

function editorReducer(state: EditorState, action: AppAction): EditorState {
  switch (action.type) {
    case 'SELECT_TEMPLATE':
      return { ...state, selectedTemplate: action.payload };
    case 'GENERATE_START':
      return { ...state, generating: true, generateError: null, showResultCard: false };
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
    case 'MOVE_SECTION_TO': {
      const moveToHistory = pushHistory(state);
      const fromIdx = state.sections.findIndex((s) => s.id === action.payload.id);
      if (fromIdx === -1) return state;
      const sections = [...state.sections];
      const [removed] = sections.splice(fromIdx, 1);
      sections.splice(action.payload.toIndex, 0, removed);
      return { ...state, ...moveToHistory, sections };
    }
    case 'CLEAR_CONTENT':
      return { ...state, sections: [], title: '', preamble: '', generating: false, generateError: null, showResultCard: false };
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSectionId: action.payload };
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
    case 'SHOW_RESULT_CARD':
      return { ...state, showResultCard: true };
    case 'HIDE_RESULT_CARD':
      return { ...state, showResultCard: false };
    case 'SET_STRICT_MODE':
      return { ...state, strictMode: action.payload };
    case 'RESTORE_FROM_HISTORY':
      return {
        ...state,
        title: action.payload.title,
        preamble: action.payload.preamble,
        sections: action.payload.sections,
        selectedTemplate: action.payload.templateId,
        history: [],
        historyIndex: -1,
      };
    case 'RESET':
      return initialEditorState;
    default:
      return state;
  }
}

interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<AppAction>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children, initialState }: { children: ReactNode; initialState?: Partial<EditorState> }) {
  const [state, dispatch] = useReducer(editorReducer, { ...initialEditorState, ...initialState });
  return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
}
