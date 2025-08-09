import React from 'react';

interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

interface ReactSafetyProviderState {
  hasError: boolean;
  errorDetails: string;
}

// Class-based Safety Provider to avoid React hooks usage during initialization issues
class ReactSafetyProvider extends React.Component<ReactSafetyProviderProps, ReactSafetyProviderState> {
  state: ReactSafetyProviderState = {
    hasError: false,
    errorDetails: '',
  };

  private handleError = (event: ErrorEvent) => {
    try {
      const message = (event?.error?.message as string) || event.message || '';
      // Detect common React hook initialization errors
      if (message.includes('useState') || message.includes('useRef') || message.includes('Invalid hook call')) {
        this.setState({ hasError: true, errorDetails: message });
      }
    } catch (_) {
      // noop
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    try {
      const reason = (event?.reason?.message as string) || String(event.reason || '');
      if (reason.includes('useState') || reason.includes('useRef') || reason.includes('Invalid hook call')) {
        this.setState({ hasError: true, errorDetails: reason });
      }
    } catch (_) {
      // noop
    }
  };

  componentDidMount(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  componentWillUnmount(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleError);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              React Hook Error Detected
            </h1>
            <p style={{ marginBottom: '1rem' }}>
              {this.state.errorDetails}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, errorDetails: '' })}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export { ReactSafetyProvider };
export default ReactSafetyProvider;
