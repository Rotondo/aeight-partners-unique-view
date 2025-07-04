
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Detectar e corrigir problemas com React
try {
  console.log("[Main] React version:", React.version);
  console.log("[Main] Inicializando aplicação...");

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  // Verificar se já existe uma root montada
  let root;
  try {
    root = createRoot(rootElement);
  } catch (error) {
    console.error("[Main] Erro ao criar root:", error);
    // Tentar limpar e recriar
    rootElement.innerHTML = '';
    root = createRoot(rootElement);
  }

  // Temporariamente sem StrictMode para debug
  root.render(
    <App />
  );

  console.log("[Main] Aplicação renderizada com sucesso");
} catch (error) {
  console.error("[Main] Erro crítico na inicialização:", error);
  
  // Fallback de emergência
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">Erro na Inicialização</h1>
          <p style="margin-bottom: 1rem;">Ocorreu um erro ao inicializar a aplicação.</p>
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
