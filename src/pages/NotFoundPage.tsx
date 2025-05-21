import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: "center", marginTop: "10vh" }}>
    <h1 style={{ fontSize: "3rem" }}>404</h1>
    <p>Página não encontrada.</p>
    <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
      Voltar para o início
    </Link>
  </div>
);

export default NotFoundPage;
