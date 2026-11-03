import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log unexpected client runtime errors
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '40px 20px', maxWidth: 600, margin: '60px auto', textAlign: 'center' }}>
          <div className="card">
            <h2 style={{ color: 'var(--danger)', marginBottom: 12 }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
              An unexpected error occurred while rendering this view.
            </p>
            {this.state.error && (
              <pre
                style={{
                  background: 'var(--bg-muted)',
                  padding: 12,
                  borderRadius: 6,
                  textAlign: 'left',
                  fontSize: 12,
                  overflowX: 'auto',
                  marginBottom: 20,
                  color: 'var(--danger)',
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button type="button" className="btn btn--primary" onClick={this.handleReset}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
