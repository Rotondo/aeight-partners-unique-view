
import * as React from 'react';

// Simple React Safety Provider without complex error handling
interface ReactSafetyProviderProps {
  children: React.ReactNode;
}

export const ReactSafetyProvider: React.FC<ReactSafetyProviderProps> = ({ children }) => {
  // Basic React verification
  if (typeof React === 'undefined' || !React.useState) {
    console.error('[ReactSafetyProvider] React is not available');
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
            React Loading Error
          </h1>
          <p style={{ marginBottom: '1rem' }}>
            React is not properly loaded. Please refresh the page.
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

  return <>{children}</>;
};
