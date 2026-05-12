import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { AppAction } from '../types';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface UIState {
  toast: Toast | null;
  toasts: Toast[];
}

const initialUIState: UIState = {
  toast: null,
  toasts: [],
};

function uiReducer(state: UIState, action: AppAction): UIState {
  switch (action.type) {
    case 'SHOW_TOAST': {
      const id = action.payload.id || crypto.randomUUID();
      return { ...state, toast: { ...action.payload, id }, toasts: [...state.toasts, { ...action.payload, id }] };
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
    case 'RESET':
      return initialUIState;
    default:
      return state;
  }
}

interface UIContextValue {
  state: UIState;
  dispatch: React.Dispatch<AppAction>;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children, initialState }: { children: ReactNode; initialState?: Partial<UIState> }) {
  const [state, dispatch] = useReducer(uiReducer, { ...initialUIState, ...initialState });
  return <UIContext.Provider value={{ state, dispatch }}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
