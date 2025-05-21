import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  try {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  } catch (e) {
    // Mostra claramente qual o problema se o contexto não estiver disponível
    return (
      <div style={{ color: "red", padding: 32 }}>
        <h2>Erro crítico de autenticação</h2>
        <p>
          O componente <b>PrivateRoute</b> está sendo usado fora do <b>AuthProvider</b>.<br />
          Certifique-se de que <b>&lt;AuthProvider&gt;</b> envolve TODA a aplicação em <b>src/App.tsx</b>.<br />
          Se o erro persistir, recarregue a página ou limpe o cache do navegador.
        </p>
      </div>
    );
  }
};

export default PrivateRoute;
