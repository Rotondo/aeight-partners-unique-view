
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('[main.tsx] Iniciando aplicação');

// Garantir que o elemento root existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Elemento root não encontrado no DOM");
  const body = document.body;
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  body.appendChild(newRoot);
  console.log("Elemento root criado manualmente");
}

try {
  console.log("Iniciando renderização da aplicação");
  
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log("Aplicação renderizada com sucesso");
} catch (error) {
  console.error("Erro ao renderizar a aplicação:", error);
  
  // Fallback: mostrar erro na tela
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
        <h1 style="color: red; margin-bottom: 16px;">Erro ao carregar aplicação</h1>
        <p style="color: #666; text-align: center; max-width: 500px;">
          Ocorreu um erro ao inicializar a aplicação. Verifique o console do navegador para mais detalhes.
        </p>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recarregar Página
        </button>
      </div>
    `;
  }
}
