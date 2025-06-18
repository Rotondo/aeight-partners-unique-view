
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
}
