
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced React availability check
const isReactAvailable = () => {
  return (
    typeof React !== 'undefined' &&
    React &&
    typeof React.useState === 'function' &&
    typeof React.useEffect === 'function' &&
    typeof React.createElement === 'function'
  );
};

// Wait for React to be fully available
const waitForReact = (callback: () => void, maxAttempts = 10) => {
  let attempts = 0;
  
  const checkReact = () => {
    attempts++;
    
    if (isReactAvailable()) {
      console.log('[Main] React is available, initializing app');
      callback();
    } else if (attempts < maxAttempts) {
      console.log(`[Main] React not ready, attempt ${attempts}/${maxAttempts}`);
      setTimeout(checkReact, 100);
    } else {
      console.error('[Main] React failed to initialize after maximum attempts');
      showEmergencyFallback();
    }
  };
  
  checkReact();
};

// Show emergency fallback
const showEmergencyFallback = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f9fafb;">
        <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">React Initialization Failed</h1>
          <p style="margin-bottom: 1rem; color: #4b5563;">React failed to load properly. Please refresh the page.</p>
          <button 
            onclick="window.location.reload()" 
            style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;"
          >
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
};

// Initialize the application
const initializeApp = () => {
  try {
    console.log('[Main] Starting application initialization...');

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Wait for React to be ready before creating root
    waitForReact(() => {
      try {
        const root = createRoot(rootElement);
        
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );

        console.log('[Main] Application rendered successfully');
      } catch (error) {
        console.error('[Main] Error rendering application:', error);
        showEmergencyFallback();
      }
    });
    
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    showEmergencyFallback();
  }
};

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
