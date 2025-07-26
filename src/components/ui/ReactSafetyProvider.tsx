
import React from 'react';

// Emergency React Safety Provider
interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Check if React and React hooks are available
  if (typeof React === 'undefined' || !React || !React.useState || !React.useEffect) {
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

  // Use a try-catch around hook usage to prevent errors
  let hasError = false;
  let errorDetails = '';
  let setHasError: React.Dispatch<React.SetStateAction<boolean>> | null = null;
  let setErrorDetails: React.Dispatch<React.SetStateAction<string>> | null = null;

  try {
    // Now we can use hooks safely
    const [internalHasError, internalSetHasError] = React.useState(false);
    const [internalErrorDetails, internalSetErrorDetails] = React.useState<string>('');
    
    hasError = internalHasError;
    errorDetails = internalErrorDetails;
    setHasError = internalSetHasError;
    setErrorDetails = internalSetErrorDetails;

    // Enhanced error boundary
    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        console.error('[ReactSafetyProvider] Runtime error caught:', event.error);
        if (event.error?.message?.includes('useState') || event.error?.message?.includes('useRef')) {
          internalSetHasError(true);
          internalSetErrorDetails(event.error.message);
        }
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);
  } catch (error) {
    console.error('[ReactSafetyProvider] Error using hooks:', error);
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
            React Hook Error
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            Unable to initialize React hooks. Please refresh the page.
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
                if (setHasError && setErrorDetails) {
                  setHasError(false);
                  setErrorDetails('');
                }
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
