import React from "react";
import { Outlet, Link } from "react-router-dom";

const MainLayout: React.FC = () => (
  <div>
    <header style={{ padding: 16, background: "#f5f5f5" }}>
      <nav>
        <Link to="/" style={{ marginRight: 16 }}>Dashboard</Link>
        {/* Adicione mais links aqui se desejar */}
        <Link to="/login">Sair</Link>
      </nav>
    </header>
    <main style={{ padding: 24 }}>
      <Outlet />
    </main>
  </div>
);

export default MainLayout;
