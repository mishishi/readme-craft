export interface RepoInfo {
  name: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  topics: string[];
  owner: string;
  license: string | null;
  htmlUrl: string;
  defaultBranch: string;
}

export interface Section {
  id: string;
  heading: string;
  content: string;
}

export interface TemplateDef {
  id: string;
  name: string;
  description: string;
  preview: {
    gradient: string;
    icon: string;
    accent: string;
  };
}

export interface AppState {
  repoUrl: string;
  repoInfo: RepoInfo | null;
  repoLoading: boolean;
  repoError: string | null;
  selectedTemplate: string | null;
  generating: boolean;
  generateError: string | null;
  title: string;
  preamble: string;
  sections: Section[];
  toast: { id?: string; message: string; type: 'success' | 'error' } | null;
  toasts: { id: string; message: string; type: 'success' | 'error' }[];
  activeSectionId: string | null;
  collapsedSections: string[];
  history: { title: string; preamble: string; sections: Section[] }[];
  historyIndex: number;
}

export type AppAction =
  | { type: 'SET_REPO_URL'; payload: string }
  | { type: 'FETCH_REPO_START' }
  | { type: 'FETCH_REPO_SUCCESS'; payload: RepoInfo }
  | { type: 'FETCH_REPO_ERROR'; payload: string }
  | { type: 'SELECT_TEMPLATE'; payload: string }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: { title: string; preamble: string; sections: Section[] } }
  | { type: 'GENERATE_ERROR'; payload: string }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'UPDATE_SECTION'; payload: { id: string; content: string } }
  | { type: 'UPDATE_SECTION_HEADING'; payload: { id: string; heading: string } }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error'; id?: string } }
  | { type: 'DISMISS_TOAST'; payload?: string }
  | { type: 'RESET' }
  | { type: 'CLEAR_CONTENT' }
  | { type: 'SET_ACTIVE_SECTION'; payload: string | null }
  | { type: 'ADD_SECTION'; payload?: { heading?: string } }
  | { type: 'DELETE_SECTION'; payload: { id: string } }
  | { type: 'MOVE_SECTION'; payload: { id: string; direction: 'up' | 'down' } }
  | { type: 'MOVE_SECTION_TO'; payload: { id: string; toIndex: number } }
  | { type: 'SET_COLLAPSED'; payload: { id: string; collapsed: boolean } }
  | { type: 'UNDO' }
  | { type: 'REDO' };
