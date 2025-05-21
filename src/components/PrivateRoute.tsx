import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Se o AuthProvider não estiver acima na hierarquia, isso dará erro.
  // Por isso, este componente deve SEMPRE ser usado dentro do <AuthProvider>.
  try {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  } catch (error) {
    // Se der erro de contexto, avisa claramente no front-end para facilitar debug
    return (
      <div style={{ color: "red", padding: 32 }}>
        <h2>Erro crítico de autenticação</h2>
        <p>
          O componente PrivateRoute está sendo usado fora do AuthProvider.
          <br />
          Certifique-se de que o AuthProvider está englobando toda a aplicação em <b>src/App.tsx</b>.
        </p>
      </div>
    );
  }
};

export default PrivateRoute;
