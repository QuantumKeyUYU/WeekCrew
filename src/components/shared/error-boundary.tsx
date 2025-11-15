'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WeekCrew] Uncaught error boundary exception', error, errorInfo);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-100">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-brand/10">
            <h1 className="text-2xl font-semibold text-brand-foreground">Что-то пошло не так</h1>
            <p className="text-sm text-slate-300">
              Перезагрузите страницу. Если проблема повторяется, напишите в поддержку.
            </p>
            {this.state.error?.message && (
              <p className="rounded-2xl border border-white/5 bg-slate-900/80 p-3 text-xs text-slate-400">
                {this.state.error.message}
              </p>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex w-full items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-medium text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
