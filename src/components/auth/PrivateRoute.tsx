
import React from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Acesso livre - sem verificações de autenticação
  return <>{children}</>;
};

export default PrivateRoute;
