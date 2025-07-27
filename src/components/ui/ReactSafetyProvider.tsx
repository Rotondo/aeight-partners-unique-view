
import React from 'react';

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
        Runtime Error
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
  const [hasError, setHasError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  // Error event listener for runtime errors
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[ReactSafetyProvider] Runtime error caught:', event.error);
      
      // Check for React-related errors
      const errorMessage = event.error?.message || '';
      if (errorMessage.includes('Cannot read properties of null') && 
          (errorMessage.includes('useState') || errorMessage.includes('useEffect'))) {
        setHasError(true);
        setErrorMessage('React runtime error detected');
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[ReactSafetyProvider] Promise rejection:', event.reason);
      const reasonMessage = event.reason?.message || '';
      if (reasonMessage.includes('React') || reasonMessage.includes('hook')) {
        setHasError(true);
        setErrorMessage('React promise error detected');
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
    return (
      <ErrorFallback
        message={`Runtime Error: ${errorMessage}`}
        onReload={() => window.location.reload()}
      />
    );
  }

  // All good, render children
  return <>{children}</>;
};
