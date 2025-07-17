
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log("[Main] Inicializando aplicação React...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("[Main] Aplicação renderizada com sucesso");
} catch (error) {
  console.error("[Main] Erro crítico na inicialização:", error);
  
  // Fallback de emergência
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Erro na Inicialização</h1>
          <p style="margin-bottom: 1rem;">Ocorreu um erro ao carregar a aplicação.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
            Recarregar Página
          </button>
          <details style="margin-top: 1rem; text-align: left;">
            <summary style="cursor: pointer;">Detalhes do Erro</summary>
            <pre style="margin-top: 0.5rem; padding: 1rem; background: #f3f4f6; border-radius: 0.375rem; overflow: auto;">${error}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
