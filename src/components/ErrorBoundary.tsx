import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Application error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="lm-backdrop flex items-center justify-center p-4 sm:p-6">
          <div className="lm-card relative z-10 w-full max-w-md rounded-3xl p-8 text-center">
            <h1 className="lm-display-serif text-3xl font-bold text-[#34485B]">
              Little Moments
            </h1>
            <p className="mt-2 text-sm font-bold tracking-[0.14em] text-[#B58B50] uppercase">
              GIFT BASKETS
            </p>
            <p className="mt-5 text-sm leading-relaxed text-[#34485B]/85">
              Something went wrong while loading this page. Please refresh to try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="lm-submit-btn mt-6 inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
