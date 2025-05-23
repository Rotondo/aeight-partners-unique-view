
import React from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Acesso livre - mantendo conexão com dados do Supabase
  return <>{children}</>;
};

export default PrivateRoute;
