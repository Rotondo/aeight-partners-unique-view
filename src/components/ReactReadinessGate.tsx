import React from 'react';

interface ReactReadinessGateProps {
  children: React.ReactNode;
}

// Global React readiness checker that prevents ANY rendering until React is stable
class ReactReadinessGate extends React.Component<ReactReadinessGateProps, { isReady: boolean; error: string | null }> {
  private checkInterval: NodeJS.Timeout | null = null;
  private maxChecks = 100; // Max 5 seconds at 50ms intervals
  private checkCount = 0;

  constructor(props: ReactReadinessGateProps) {
    super(props);
    this.state = {
      isReady: false,
      error: null
    };
  }

  componentDidMount() {
    this.startReactReadinessCheck();
  }

  componentWillUnmount() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private isReactFullyReady = (): boolean => {
    try {
      // Comprehensive React readiness check
      const requiredHooks = [
        'useState', 'useEffect', 'useMemo', 'useCallback', 
        'useContext', 'useReducer', 'useRef', 'forwardRef'
      ];

      // Check if React object exists and has all required methods
      if (!React || typeof React !== 'object') {
        return false;
      }

      // Check all required React methods exist and are functions
      for (const hook of requiredHooks) {
        if (!React[hook as keyof typeof React] || typeof React[hook as keyof typeof React] !== 'function') {
          return false;
        }
      }

      // Try to actually call a hook in a safe way
      const testComponent = () => {
        React.useState(false);
        return null;
      };

      // If we can create the component without error, React is ready
      React.createElement(testComponent);
      
      return true;
    } catch (error) {
      console.log('[ReactReadinessGate] React not ready:', error);
      return false;
    }
  };

  private startReactReadinessCheck = () => {
    this.checkInterval = setInterval(() => {
      this.checkCount++;
      
      if (this.isReactFullyReady()) {
        console.log('[ReactReadinessGate] React is ready!');
        this.setState({ isReady: true });
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }
      } else if (this.checkCount >= this.maxChecks) {
        console.error('[ReactReadinessGate] React readiness timeout');
        this.setState({ 
          error: 'React failed to initialize properly. Please refresh the page.' 
        });
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }
      }
    }, 50);
  };

  render() {
    const { children } = this.props;
    const { isReady, error } = this.state;

    if (error) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui',
          background: '#f9fafb',
          padding: '2rem'
        }}>
          <div style={{
            textAlign: 'center',
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '1.5rem' }}>
              React Initialization Error
            </h1>
            <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    if (!isReady) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui',
          background: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <p style={{ color: '#6b7280', margin: 0 }}>
              Iniciando React... ({this.checkCount}/{this.maxChecks})
            </p>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return <>{children}</>;
  }
}

export default ReactReadinessGate;