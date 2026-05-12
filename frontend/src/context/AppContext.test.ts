import { describe, it, expect } from 'vitest';
import type { AppState, AppAction, Section } from '../types';

/**
 * Inline reducer (duplicated from AppContext) for isolated testing.
 * This is the same pure function used in the app.
 */
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
      return { ...state, generating: true, generateError: null, showResultCard: false };
    case 'GENERATE_ERROR':
      return { ...state, generating: false, generateError: action.payload };
    case 'GENERATE_SUCCESS':
      return {
        ...state,
        generating: false,
        title: action.payload.title,
        preamble: action.payload.preamble,
        sections: action.payload.sections,
      };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'UPDATE_SECTION': {
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, content: action.payload.content } : s
        ),
      };
    }
    case 'UPDATE_SECTION_HEADING': {
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, heading: action.payload.heading } : s
        ),
      };
    }
    case 'SHOW_TOAST': {
      const id = action.payload.id || 'test-id';
      return {
        ...state,
        toast: { ...action.payload, id },
        toasts: [...state.toasts, { ...action.payload, id }],
      };
    }
    case 'DISMISS_TOAST': {
      if (action.payload) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.payload),
          toast: state.toast?.id === action.payload ? null : state.toast,
        };
      }
      return { ...state, toast: null, toasts: state.toasts.slice(1) };
    }
    case 'CLEAR_CONTENT':
      return {
        ...state,
        sections: [],
        title: '',
        preamble: '',
        generating: false,
        generateError: null,
        showResultCard: false,
      };
    case 'ADD_SECTION': {
      const newSection = {
        id: crypto.randomUUID(),
        heading: action.payload?.heading || '新章节',
        content: '',
      };
      return { ...state, sections: [...state.sections, newSection] };
    }
    case 'DELETE_SECTION': {
      return {
        ...state,
        sections: state.sections.filter((s) => s.id !== action.payload.id),
      };
    }
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
    case 'SET_COLLAPSED': {
      const collapsedSections = action.payload.collapsed
        ? [...state.collapsedSections, action.payload.id]
        : state.collapsedSections.filter((id) => id !== action.payload.id);
      return { ...state, collapsedSections };
    }
    case 'SHOW_RESULT_CARD':
      return { ...state, showResultCard: true };
    case 'HIDE_RESULT_CARD':
      return { ...state, showResultCard: false };
    case 'RESET':
      return {
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
        showResultCard: false,
        history: [],
        historyIndex: -1,
      };
    default:
      return state;
  }
}

const sampleSection = (id: string): Section => ({
  id,
  heading: `Section ${id}`,
  content: `Content ${id}`,
});

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
  showResultCard: false,
  history: [],
  historyIndex: -1,
};

describe('appReducer', () => {
  describe('repo actions', () => {
    it('SET_REPO_URL updates URL and clears error', () => {
      const state = { ...initialState, repoError: 'previous error' };
      const next = appReducer(state, { type: 'SET_REPO_URL', payload: 'https://github.com/u/r' });
      expect(next.repoUrl).toBe('https://github.com/u/r');
      expect(next.repoError).toBeNull();
    });

    it('FETCH_REPO_START sets loading flag', () => {
      const next = appReducer(initialState, { type: 'FETCH_REPO_START' });
      expect(next.repoLoading).toBe(true);
      expect(next.repoInfo).toBeNull();
    });

    it('FETCH_REPO_SUCCESS sets repo info and stops loading', () => {
      const repoInfo = { name: 'test', fullName: 'u/test', description: 'desc', language: 'TS', stars: 10, topics: [], owner: 'u', license: 'MIT', htmlUrl: 'https://github.com/u/test', defaultBranch: 'main' };
      const next = appReducer(
        { ...initialState, repoLoading: true },
        { type: 'FETCH_REPO_SUCCESS', payload: repoInfo }
      );
      expect(next.repoLoading).toBe(false);
      expect(next.repoInfo).toEqual(repoInfo);
    });

    it('FETCH_REPO_ERROR stops loading and sets error', () => {
      const next = appReducer(
        { ...initialState, repoLoading: true },
        { type: 'FETCH_REPO_ERROR', payload: 'Not found' }
      );
      expect(next.repoLoading).toBe(false);
      expect(next.repoError).toBe('Not found');
    });
  });

  describe('template selection', () => {
    it('SELECT_TEMPLATE sets selectedTemplate', () => {
      const next = appReducer(initialState, { type: 'SELECT_TEMPLATE', payload: 'badges' });
      expect(next.selectedTemplate).toBe('badges');
    });
  });

  describe('generation', () => {
    it('GENERATE_START sets generating flag', () => {
      const next = appReducer(initialState, { type: 'GENERATE_START' });
      expect(next.generating).toBe(true);
      expect(next.generateError).toBeNull();
    });

    it('GENERATE_SUCCESS sets title, preamble, sections and stops generating', () => {
      const sections = [sampleSection('1'), sampleSection('2')];
      const next = appReducer(
        { ...initialState, generating: true },
        { type: 'GENERATE_SUCCESS', payload: { title: 'My Project', preamble: 'Lead', sections } }
      );
      expect(next.generating).toBe(false);
      expect(next.title).toBe('My Project');
      expect(next.preamble).toBe('Lead');
      expect(next.sections).toEqual(sections);
    });

    it('GENERATE_ERROR stops generating and sets error', () => {
      const next = appReducer(
        { ...initialState, generating: true },
        { type: 'GENERATE_ERROR', payload: 'API timeout' }
      );
      expect(next.generating).toBe(false);
      expect(next.generateError).toBe('API timeout');
    });
  });

  describe('section management', () => {
    it('ADD_SECTION appends a new section', () => {
      const next = appReducer(initialState, { type: 'ADD_SECTION' });
      expect(next.sections).toHaveLength(1);
      expect(next.sections[0].heading).toBe('新章节');
      expect(next.sections[0].content).toBe('');
    });

    it('ADD_SECTION with custom heading', () => {
      const next = appReducer(initialState, { type: 'ADD_SECTION', payload: { heading: 'Custom' } });
      expect(next.sections[0].heading).toBe('Custom');
    });

    it('UPDATE_SECTION updates content by id', () => {
      const s1 = sampleSection('a');
      const state = { ...initialState, sections: [s1, sampleSection('b')] };
      const next = appReducer(state, { type: 'UPDATE_SECTION', payload: { id: 'a', content: 'Updated' } });
      expect(next.sections[0].content).toBe('Updated');
      expect(next.sections[1].content).toBe('Content b'); // unchanged
    });

    it('UPDATE_SECTION_HEADING updates heading by id', () => {
      const s1 = sampleSection('a');
      const state = { ...initialState, sections: [s1] };
      const next = appReducer(state, { type: 'UPDATE_SECTION_HEADING', payload: { id: 'a', heading: 'New Head' } });
      expect(next.sections[0].heading).toBe('New Head');
    });

    it('DELETE_SECTION removes section by id', () => {
      const state = { ...initialState, sections: [sampleSection('a'), sampleSection('b')] };
      const next = appReducer(state, { type: 'DELETE_SECTION', payload: { id: 'a' } });
      expect(next.sections).toHaveLength(1);
      expect(next.sections[0].id).toBe('b');
    });

    it('MOVE_SECTION moves section up', () => {
      const state = { ...initialState, sections: [sampleSection('a'), sampleSection('b'), sampleSection('c')] };
      const next = appReducer(state, { type: 'MOVE_SECTION', payload: { id: 'b', direction: 'up' } });
      expect(next.sections[0].id).toBe('b');
      expect(next.sections[1].id).toBe('a');
    });

    it('MOVE_SECTION moves section down', () => {
      const state = { ...initialState, sections: [sampleSection('a'), sampleSection('b'), sampleSection('c')] };
      const next = appReducer(state, { type: 'MOVE_SECTION', payload: { id: 'a', direction: 'down' } });
      expect(next.sections[0].id).toBe('b');
      expect(next.sections[1].id).toBe('a');
    });

    it('MOVE_SECTION does nothing when already at the top moving up', () => {
      const state = { ...initialState, sections: [sampleSection('a'), sampleSection('b')] };
      const next = appReducer(state, { type: 'MOVE_SECTION', payload: { id: 'a', direction: 'up' } });
      expect(next.sections).toEqual(state.sections);
    });

    it('MOVE_SECTION does nothing for unknown id', () => {
      const state = { ...initialState, sections: [sampleSection('a')] };
      const next = appReducer(state, { type: 'MOVE_SECTION', payload: { id: 'unknown', direction: 'up' } });
      expect(next.sections).toEqual(state.sections);
    });
  });

  describe('toast management', () => {
    it('SHOW_TOAST adds toast with auto-generated id', () => {
      const next = appReducer(initialState, { type: 'SHOW_TOAST', payload: { message: 'Hello', type: 'success' } });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].message).toBe('Hello');
      expect(next.toasts[0].type).toBe('success');
    });

    it('SHOW_TOAST uses provided id', () => {
      const next = appReducer(initialState, { type: 'SHOW_TOAST', payload: { message: 'Hi', type: 'info', id: 'custom-id' } });
      expect(next.toasts[0].id).toBe('custom-id');
    });

    it('DISMISS_TOAST removes toast by id', () => {
      const state = {
        ...initialState,
        toast: { id: 't1', message: 'Hi', type: 'success' as const },
        toasts: [{ id: 't1', message: 'Hi', type: 'success' as const }, { id: 't2', message: 'Ho', type: 'error' as const }],
      };
      const next = appReducer(state, { type: 'DISMISS_TOAST', payload: 't1' });
      expect(next.toasts).toHaveLength(1);
      expect(next.toasts[0].id).toBe('t2');
      expect(next.toast).toBeNull();
    });

    it('DISMISS_TOAST without payload dismisses oldest toast', () => {
      const state = {
        ...initialState,
        toast: { id: 't1', message: 'A', type: 'success' as const },
        toasts: [{ id: 't1', message: 'A', type: 'success' as const }, { id: 't2', message: 'B', type: 'info' as const }],
      };
      const next = appReducer(state, { type: 'DISMISS_TOAST' });
      expect(next.toasts).toHaveLength(1);
      expect(next.toast).toBeNull();
    });
  });

  describe('SET_ACTIVE_SECTION', () => {
    it('sets the active section id', () => {
      const next = appReducer(initialState, { type: 'SET_ACTIVE_SECTION', payload: 'sec-1' });
      expect(next.activeSectionId).toBe('sec-1');
    });

    it('clears active section id when payload is null', () => {
      const state = { ...initialState, activeSectionId: 'sec-1' };
      const next = appReducer(state, { type: 'SET_ACTIVE_SECTION', payload: null });
      expect(next.activeSectionId).toBeNull();
    });
  });

  describe('SET_COLLAPSED', () => {
    it('adds id to collapsed list when collapsed is true', () => {
      const next = appReducer(initialState, { type: 'SET_COLLAPSED', payload: { id: 's1', collapsed: true } });
      expect(next.collapsedSections).toEqual(['s1']);
    });

    it('removes id from collapsed list when collapsed is false', () => {
      const state = { ...initialState, collapsedSections: ['s1', 's2'] };
      const next = appReducer(state, { type: 'SET_COLLAPSED', payload: { id: 's1', collapsed: false } });
      expect(next.collapsedSections).toEqual(['s2']);
    });
  });

  describe('CLEAR_CONTENT', () => {
    it('clears title, preamble, sections and generation state', () => {
      const state = {
        ...initialState,
        title: 'Proj',
        preamble: 'Lead',
        sections: [sampleSection('a')],
        generating: true,
        generateError: 'err',
      };
      const next = appReducer(state, { type: 'CLEAR_CONTENT' });
      expect(next.title).toBe('');
      expect(next.preamble).toBe('');
      expect(next.sections).toHaveLength(0);
      expect(next.generating).toBe(false);
      expect(next.generateError).toBeNull();
    });
  });

  describe('RESET', () => {
    it('resets state to initial values', () => {
      const state = {
        ...initialState,
        title: 'Something',
        sections: [sampleSection('a')],
        toasts: [{ id: 't1', message: 'hi', type: 'success' as const }],
      };
      const next = appReducer(state, { type: 'RESET' });
      expect(next).toEqual(initialState);
    });
  });
});
