
import * as React from 'react';

// Emergency React Safety Provider
interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Comprehensive React verification
  const [hasError, setHasError] = React.useState(false);
  const [errorDetails, setErrorDetails] = React.useState<string>('');

  // Enhanced error boundary
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[ReactSafetyProvider] Runtime error caught:', event.error);
      if (event.error?.message?.includes('useState') || event.error?.message?.includes('useRef')) {
        setHasError(true);
        setErrorDetails(event.error.message);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Verify React is available before proceeding
  if (!React || !React.useState || !React.useEffect || !React.useRef) {
    console.error('[ReactSafetyProvider] React hooks are not available');
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
            React Initialization Error
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            React hooks are not properly initialized. Please refresh the page.
          </p>
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
        </div>
      </div>
    );
  }

  // If we caught a React hook error, show recovery options
  if (hasError) {
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
            Error: {errorDetails}
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
              onClick={() => {
                setHasError(false);
                setErrorDetails('');
              }}
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

  return <>{children}</>;
};
