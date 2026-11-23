import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--sc-bg)] text-[var(--sc-text)]">
          <div className="max-w-md w-full rounded-[20px] bg-[var(--sc-surface)] border border-[var(--sc-border)] p-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--sc-danger-bg)] text-[var(--sc-danger-text)] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-sm text-[var(--sc-text-muted)]">
              SafeCircle ran into an unexpected display issue. Your local safety records are safe.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign('/')}
              className="w-full min-h-[48px] rounded-2xl bg-[var(--sc-primary)] text-white font-semibold px-4 py-3 cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
