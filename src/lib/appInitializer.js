// Vanilla JavaScript React initialization system
// This runs before any React code to ensure safe initialization

class AppInitializer {
  constructor() {
    this.initTimeout = 10000; // 10 seconds timeout
    this.checkInterval = 50; // Check every 50ms
    this.maxRetries = 3;
    this.currentRetry = 0;
    this.reactRoot = null; // Store single React root instance
  }

  // Check if React is fully loaded and functional
  isReactReady() {
    try {
      // Check if React object exists
      if (!window.React) return false;
      
      // Check essential React methods
      const requiredMethods = [
        'createElement', 'useState', 'useEffect', 'useMemo', 
        'useCallback', 'forwardRef', 'Component'
      ];
      
      for (const method of requiredMethods) {
        if (!window.React[method] || typeof window.React[method] !== 'function') {
          return false;
        }
      }
      
      // Check if react-dom is available
      if (!window.ReactDOM || !window.ReactDOM.createRoot) return false;
      
      return true;
    } catch (error) {
      console.error('[AppInitializer] Error checking React readiness:', error);
      return false;
    }
  }

  // Show loading screen
  showLoadingScreen() {
    const root = document.getElementById('root');
    if (root && !root.hasAttribute('data-react-root')) {
      root.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          font-family: system-ui; 
          background: #f9fafb;
        ">
          <div style="text-align: center;">
            <div style="
              width: 40px; 
              height: 40px; 
              border: 4px solid #e5e7eb; 
              border-top: 4px solid #3b82f6; 
              border-radius: 50%; 
              animation: spin 1s linear infinite; 
              margin: 0 auto 1rem auto;
            "></div>
            <p style="color: #6b7280; margin: 0;">Carregando aplicação...</p>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
    }
  }

  // Show error screen
  showErrorScreen(message, allowRetry = true) {
    const root = document.getElementById('root');
    if (root && !root.hasAttribute('data-react-root')) {
      root.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          font-family: system-ui; 
          background: #f9fafb; 
          padding: 2rem;
        ">
          <div style="
            text-align: center; 
            background: white; 
            padding: 2rem; 
            border-radius: 8px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
            max-width: 500px;
          ">
            <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">
              Erro de Inicialização
            </h1>
            <p style="margin-bottom: 1.5rem; color: #4b5563;">
              ${message}
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              <button 
                onclick="window.location.reload()" 
                style="
                  padding: 0.75rem 1.5rem; 
                  background: #3b82f6; 
                  color: white; 
                  border: none; 
                  border-radius: 6px; 
                  cursor: pointer; 
                  font-weight: 500;
                "
              >
                Recarregar Página
              </button>
              ${allowRetry && this.currentRetry < this.maxRetries ? `
                <button 
                  onclick="window.appInitializer.retry()" 
                  style="
                    padding: 0.75rem 1.5rem; 
                    background: #6b7280; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: 500;
                  "
                >
                  Tentar Novamente
                </button>
              ` : ''}
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #9ca3af;">
              Tentativa ${this.currentRetry + 1} de ${this.maxRetries + 1}
            </p>
          </div>
        </div>
      `;
    }
  }

  // Wait for React to be ready
  async waitForReact() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkReact = () => {
        if (this.isReactReady()) {
          console.log('[AppInitializer] React is ready!');
          resolve(true);
          return;
        }
        
        if (Date.now() - startTime > this.initTimeout) {
          reject(new Error('React initialization timeout'));
          return;
        }
        
        setTimeout(checkReact, this.checkInterval);
      };
      
      checkReact();
    });
  }

  // Initialize React app
  async initializeReactApp() {
    try {
      const { default: App } = await import('../App.tsx');
      const React = window.React;
      const { createRoot } = window.ReactDOM;
      
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        throw new Error('Root element not found');
      }

      // Clean the container completely before React takes over
      rootElement.innerHTML = '';
      
      // Mark that React now owns this container
      rootElement.setAttribute('data-react-root', 'true');
      
      // Create and render with a single root
      if (!this.reactRoot) {
        this.reactRoot = createRoot(rootElement);
      }
      
      this.reactRoot.render(
        React.createElement(React.StrictMode, null,
          React.createElement(App)
        )
      );
      
      console.log('[AppInitializer] React app initialized successfully');
      return true;
    } catch (error) {
      console.error('[AppInitializer] Failed to initialize React app:', error);
      throw error;
    }
  }

  // Retry initialization
  async retry() {
    this.currentRetry++;
    console.log(`[AppInitializer] Retrying initialization (${this.currentRetry}/${this.maxRetries})`);
    await this.initialize();
  }

  // Main initialization method
  async initialize() {
    try {
      console.log('[AppInitializer] Starting app initialization...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }
      
      // Wait for React to be ready
      await this.waitForReact();
      
      // Initialize React app
      await this.initializeReactApp();
      
      console.log('[AppInitializer] App initialized successfully');
      
    } catch (error) {
      console.error('[AppInitializer] Initialization failed:', error);
      
      if (this.currentRetry < this.maxRetries) {
        this.showErrorScreen(
          `Falha ao carregar a aplicação: ${error.message}. Você pode tentar novamente ou recarregar a página.`,
          true
        );
      } else {
        this.showErrorScreen(
          `Não foi possível carregar a aplicação após ${this.maxRetries + 1} tentativas. Por favor, recarregue a página ou tente novamente mais tarde.`,
          false
        );
      }
    }
  }
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('[Global] Runtime error:', event.error);
  if (event.error?.message?.includes('Cannot read properties of null')) {
    if (window.appInitializer) {
      window.appInitializer.showErrorScreen(
        'Erro de inicialização do React detectado. A aplicação será recarregada.',
        false
      );
      setTimeout(() => window.location.reload(), 2000);
    }
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
});

// Create global instance
window.appInitializer = new AppInitializer();

export default window.appInitializer;