
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Simple React initialization with proper error handling
const initializeApp = async () => {
  try {
    console.log('[Main] Starting React application...');

    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve(undefined);
        } else {
          window.addEventListener('load', () => resolve(undefined));
        }
      });
    }

    // Simple validation that React is available
    if (!React || typeof React.useState !== 'function') {
      throw new Error('React hooks are not available');
    }

    console.log('[Main] React is ready, finding root element...');
    
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    // Clear any existing content
    rootElement.innerHTML = '';
    
    console.log('[Main] Creating React root and rendering...');
    
    // Create root and render with error boundary
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('[Main] Application rendered successfully');
    
  } catch (error) {
    console.error('[Main] Critical initialization error:', error);
    
    // Emergency fallback UI
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: #f9fafb;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 500px;">
            <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">Application Error</h1>
            <p style="margin-bottom: 1rem; color: #4b5563;">Failed to initialize the application. This appears to be a React loading issue.</p>
            <button 
              onclick="window.location.reload()" 
              style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; margin-bottom: 1rem;"
            >
              Reload Page
            </button>
            <details style="text-align: left;">
              <summary style="cursor: pointer; font-weight: 500; color: #6b7280; margin-bottom: 0.5rem;">Error Details</summary>
              <pre style="padding: 1rem; background: #f3f4f6; border-radius: 6px; overflow: auto; font-size: 0.875rem; color: #374151; white-space: pre-wrap;">${error}</pre>
            </details>
          </div>
        </div>
      `;
    }
  }
};

// Start the application
initializeApp();
