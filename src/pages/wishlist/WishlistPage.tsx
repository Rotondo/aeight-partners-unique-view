
import React from "react";
import { Routes, Route } from "react-router-dom";
import { WishlistProvider } from "@/contexts/WishlistContext";
import WishlistDashboard from "./WishlistDashboard";
import EmpresasClientesPage from "./EmpresasClientesPage";
import WishlistItemsPage from "./WishlistItemsPage";
import ApresentacoesPage from "./ApresentacoesPage";

const WishlistPage: React.FC = () => {
  return (
    <WishlistProvider>
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route index element={<WishlistDashboard />} />
          <Route path="clientes" element={<EmpresasClientesPage />} />
          <Route path="itens" element={<WishlistItemsPage />} />
          <Route path="apresentacoes" element={<ApresentacoesPage />} />
        </Routes>
      </div>
    </WishlistProvider>
  );
};

export default WishlistPage;
