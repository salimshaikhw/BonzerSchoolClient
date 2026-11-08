import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  failed: boolean;
}

/** Last line of defence: a rendering bug shows a message instead of a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook for a monitoring service (Sentry, Datadog RUM...). Keep console output for local debugging.
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="auth-layout">
          <div className="card">
            <h2>Something went wrong</h2>
            <p>Reload the page. If it keeps happening, contact support.</p>
            <button className="btn btn--primary" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
