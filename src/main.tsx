
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced React availability check
const isReactFullyAvailable = () => {
  try {
    return (
      typeof React !== 'undefined' &&
      React !== null &&
      typeof React.useState === 'function' &&
      typeof React.useEffect === 'function' &&
      typeof React.createElement === 'function' &&
      typeof React.StrictMode === 'function'
    );
  } catch (error) {
    console.error('[Main] Error checking React availability:', error);
    return false;
  }
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

// Wait for React with improved checking
const waitForReact = async (maxAttempts = 20) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`[Main] Checking React availability, attempt ${attempt}/${maxAttempts}`);
    
    if (isReactFullyAvailable()) {
      console.log('[Main] React is fully available, proceeding with initialization');
      return true;
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.error('[Main] React failed to initialize after maximum attempts');
  return false;
};

// Initialize the application
const initializeApp = async () => {
  try {
    console.log('[Main] Starting application initialization...');

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Show loading state
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
          <div style="width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p style="color: #64748b;">Initializing React...</p>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    // Wait for React to be ready
    const reactReady = await waitForReact();
    if (!reactReady) {
      showEmergencyFallback();
      return;
    }

    // Additional safety check before creating root
    if (!isReactFullyAvailable()) {
      console.error('[Main] React became unavailable before creating root');
      showEmergencyFallback();
      return;
    }

    try {
      const root = createRoot(rootElement);
      
      root.render(
        React.createElement(React.StrictMode, null,
          React.createElement(App)
        )
      );

      console.log('[Main] Application rendered successfully');
    } catch (renderError) {
      console.error('[Main] Error rendering application:', renderError);
      showEmergencyFallback();
    }
    
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
