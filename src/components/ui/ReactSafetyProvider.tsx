
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

// Enhanced React safety checks
const isReactSafe = () => {
  try {
    return (
      typeof React !== 'undefined' &&
      React !== null &&
      typeof React.useState === 'function' &&
      typeof React.useEffect === 'function' &&
      typeof React.createElement === 'function' &&
      React.useState !== null &&
      React.useEffect !== null
    );
  } catch (error) {
    console.error('[ReactSafetyProvider] Error in React safety check:', error);
    return false;
  }
};

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Basic React availability check
  if (!isReactSafe()) {
    console.error('[ReactSafetyProvider] React is not safely available');
    return React.createElement(ErrorFallback, {
      message: "React is not properly loaded. Please refresh the page.",
      onReload: () => window.location.reload()
    });
  }

  // Use try-catch around hook usage to prevent crashes
  try {
    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');

    // Error event listener with additional safety checks
    React.useEffect(() => {
      if (!isReactSafe()) {
        console.error('[ReactSafetyProvider] React became unsafe during useEffect');
        setHasError(true);
        setErrorMessage('React hooks became unavailable');
        return;
      }

      const handleError = (event: ErrorEvent) => {
        console.error('[ReactSafetyProvider] Runtime error caught:', event.error);
        
        // Check for React-related errors or hook errors
        const errorMessage = event.error?.message || '';
        if (errorMessage.includes('useState') || 
            errorMessage.includes('useEffect') ||
            errorMessage.includes('Cannot read properties of null') ||
            errorMessage.includes('hooks') ||
            errorMessage.includes('React')) {
          setHasError(true);
          setErrorMessage(errorMessage || 'React hook error detected');
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('[ReactSafetyProvider] Promise rejection:', event.reason);
        const reasonMessage = event.reason?.message || '';
        if (reasonMessage.includes('React') || 
            reasonMessage.includes('hook') ||
            reasonMessage.includes('useState')) {
          setHasError(true);
          setErrorMessage(reasonMessage || 'React promise error detected');
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
      return React.createElement(ErrorFallback, {
        message: `React Error: ${errorMessage}`,
        onReload: () => window.location.reload()
      });
    }

    // Periodic React health check
    React.useEffect(() => {
      const healthCheck = setInterval(() => {
        if (!isReactSafe()) {
          console.error('[ReactSafetyProvider] React health check failed');
          setHasError(true);
          setErrorMessage('React became unavailable during runtime');
          clearInterval(healthCheck);
        }
      }, 5000);

      return () => clearInterval(healthCheck);
    }, []);

    // All good, render children
    return React.createElement(React.Fragment, null, children);

  } catch (hookError) {
    console.error('[ReactSafetyProvider] Error using React hooks:', hookError);
    return React.createElement(ErrorFallback, {
      message: "Unable to initialize React hooks. Please refresh the page.",
      onReload: () => window.location.reload()
    });
  }
};
