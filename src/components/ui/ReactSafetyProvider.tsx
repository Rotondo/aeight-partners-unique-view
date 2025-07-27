
import React from 'react';

// Emergency React Safety Provider
interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

// Simple error fallback component
const ErrorFallback = ({ message, onReload }: { message: string; onReload: () => void }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui',
    padding: '2rem',
    textAlign: 'center',
    background: '#f9fafb'
  }}>
    <div style={{
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
        {message}
      </p>
      <button
        onClick={onReload}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Reload Application
      </button>
    </div>
  </div>
);

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Basic React availability check
  if (typeof React === 'undefined' || !React) {
    console.error('[ReactSafetyProvider] React is not available');
    return <ErrorFallback 
      message="React is not properly loaded. Please refresh the page." 
      onReload={() => window.location.reload()} 
    />;
  }

  // Check if essential React features are available
  if (!React.useState || !React.useEffect || !React.createElement) {
    console.error('[ReactSafetyProvider] Essential React features are missing');
    return <ErrorFallback 
      message="React features are not properly initialized. Please refresh the page." 
      onReload={() => window.location.reload()} 
    />;
  }

  // Use hooks only after confirming React is available
  try {
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    // Error event listener
    React.useEffect(() => {
      const handleError = (event: ErrorEvent) => {
        console.error('[ReactSafetyProvider] Runtime error caught:', event.error);
        
        // Check for React-related errors
        if (event.error?.message?.includes('useState') || 
            event.error?.message?.includes('useEffect') ||
            event.error?.message?.includes('Cannot read properties of null')) {
          setHasError(true);
          setErrorMessage(event.error.message || 'React hook error detected');
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('[ReactSafetyProvider] Promise rejection:', event.reason);
        if (event.reason?.message?.includes('React') || 
            event.reason?.message?.includes('hook')) {
          setHasError(true);
          setErrorMessage(event.reason.message || 'React promise error detected');
        }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }, []);

    // If we caught a React error, show recovery options
    if (hasError) {
      return <ErrorFallback 
        message={`React Error: ${errorMessage}`}
        onReload={() => window.location.reload()} 
      />;
    }

    // All good, render children
    return <>{children}</>;

  } catch (hookError) {
    console.error('[ReactSafetyProvider] Error using React hooks:', hookError);
    return <ErrorFallback 
      message="Unable to initialize React hooks. Please refresh the page." 
      onReload={() => window.location.reload()} 
    />;
  }
};
