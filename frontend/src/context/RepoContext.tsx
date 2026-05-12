import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { RepoInfo, AppAction } from '../types';

export interface RepoState {
  repoUrl: string;
  repoInfo: RepoInfo | null;
  repoLoading: boolean;
  repoError: string | null;
}

const initialRepoState: RepoState = {
  repoUrl: '',
  repoInfo: null,
  repoLoading: false,
  repoError: null,
};

function repoReducer(state: RepoState, action: AppAction): RepoState {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload, repoError: null };
    case 'FETCH_REPO_START':
      return { ...state, repoLoading: true, repoError: null, repoInfo: null };
    case 'FETCH_REPO_SUCCESS':
      return { ...state, repoLoading: false, repoInfo: action.payload };
    case 'FETCH_REPO_ERROR':
      return { ...state, repoLoading: false, repoError: action.payload };
    case 'RESET':
      return initialRepoState;
    default:
      return state;
  }
}

interface RepoContextValue {
  state: RepoState;
  dispatch: React.Dispatch<AppAction>;
}

const RepoContext = createContext<RepoContextValue | null>(null);

export function RepoProvider({ children, initialState }: { children: ReactNode; initialState?: Partial<RepoState> }) {
  const [state, dispatch] = useReducer(repoReducer, { ...initialRepoState, ...initialState });
  return <RepoContext.Provider value={{ state, dispatch }}>{children}</RepoContext.Provider>;
}

export function useRepo() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error('useRepo must be used within RepoProvider');
  return ctx;
}
