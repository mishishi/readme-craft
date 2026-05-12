import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class AsyncBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[AsyncBoundary] Caught error:', error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <div className="mb-3 text-3xl">⚠️</div>
          <h3 className="text-sm font-semibold text-red-800">加载异常</h3>
          <p className="mt-1 text-xs text-red-600">
            {this.state.error?.message || '发生意外错误，请刷新页面重试'}
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
