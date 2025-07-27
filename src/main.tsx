
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enhanced initialization with React availability check
const initializeApp = () => {
  try {
    // Verify React is available before proceeding
    if (!React || !React.createElement || typeof React.useState !== 'function') {
      throw new Error("React is not properly loaded");
    }

    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    console.log('[Main] React confirmed available, initializing app...');

    // Create and render the React application
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('[Main] Application initialized successfully');
    
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    
    // Show a simple error fallback
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f9fafb;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Application Error</h1>
            <p style="margin-bottom: 1rem; color: #4b5563;">Failed to initialize the application. Please refresh the page.</p>
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
  }
};

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // Add a small delay to ensure all modules are loaded
  setTimeout(initializeApp, 10);
}
