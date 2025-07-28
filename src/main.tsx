
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced React initialization check with better validation
const waitForReactInitialization = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // Increased attempts
    
    const checkReact = () => {
      console.log(`[Main] React initialization check attempt ${attempts + 1}/${maxAttempts}`);
      
      // More comprehensive React validation including internal state
      const isReactReady = React && 
        typeof React === 'object' &&
        React.version &&
        React.useState &&
        React.useEffect &&
        React.useRef &&
        React.useCallback &&
        React.useMemo &&
        React.useContext &&
        React.Suspense &&
        React.lazy &&
        typeof React.useState === 'function' &&
        typeof React.useEffect === 'function' &&
        typeof React.useRef === 'function';

      // Additional check to ensure React internals are ready
      let internalStateReady = false;
      try {
        // Test React context by accessing the current dispatcher
        const testElement = React.createElement('div');
        internalStateReady = !!testElement && typeof testElement === 'object';
      } catch (e) {
        console.log('[Main] React internals not ready yet:', e);
        internalStateReady = false;
      }

      if (isReactReady && internalStateReady) {
        console.log('[Main] React is fully initialized:', {
          version: React.version,
          hasHooks: true,
          hasComponents: !!React.Suspense,
          internalsReady: internalStateReady
        });
        
        // Final test - try to actually use a hook-like function
        try {
          const testHookAccess = React.useState !== null && React.useState !== undefined;
          if (testHookAccess) {
            resolve();
            return;
          }
        } catch (e) {
          console.log('[Main] Hook access test failed:', e);
        }
      }

      attempts++;
      if (attempts >= maxAttempts) {
        reject(new Error('React failed to initialize after maximum attempts'));
        return;
      }

      setTimeout(checkReact, 50); // Reduced timeout for faster checking
    };

    checkReact();
  });
};

// Initialize the application only after React is ready
const initializeApp = async () => {
  try {
    console.log('[Main] Starting application initialization...');
    
    // Wait for React to be fully ready
    await waitForReactInitialization();
    
    console.log('[Main] React is ready, initializing DOM...');

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Clean any existing content
    rootElement.innerHTML = '';
    
    // Create root and render
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('[Main] Application rendered successfully');
    
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    
    // Emergency fallback
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f9fafb;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">React Initialization Error</h1>
            <p style="margin-bottom: 1rem; color: #4b5563;">Failed to initialize React properly. This may be a loading issue.</p>
            <button 
              onclick="window.location.reload()" 
              style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
            >
              Reload Application
            </button>
            <details style="margin-top: 1.5rem; text-align: left;">
              <summary style="cursor: pointer; font-weight: 500; color: #6b7280;">Error Details</summary>
              <pre style="margin-top: 0.5rem; padding: 1rem; background: #f3f4f6; border-radius: 6px; overflow: auto; font-size: 0.875rem; color: #374151;">${error}</pre>
            </details>
          </div>
        </div>
      `;
    }
  }
};

// Start initialization
initializeApp();
