
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { CrmProvider } from "@/contexts/CrmContext";
import WishlistErrorBoundary from "@/components/wishlist/WishlistErrorBoundary";
import { SafeContextProvider } from "@/components/auth/SafeContextProvider";
import WishlistDashboard from "./WishlistDashboard";
import EmpresasClientesPage from "./EmpresasClientesPage";
import WishlistItemsPage from "./WishlistItemsPage";
import ApresentacoesPage from "./ApresentacoesPage";
import ClientesSobrepostosPage from "./ClientesSobrepostosPage";
import ModoApresentacaoPage from "./ModoApresentacaoPage";
import TrocaMutuaPage from "./TrocaMutuaPage";
import QualificacaoPage from "./QualificacaoPage";

const CONSOLE_PREFIX = "[WishlistPage]";

const WishlistPage: React.FC = () => {
  useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Renderizando WishlistPage, pathname:`, window.location.pathname);
  }, []);

  return (
    <SafeContextProvider>
      <WishlistProvider>
        <CrmProvider>
          <WishlistErrorBoundary>
            <div className="container mx-auto px-4 py-6">
              <Routes>
                <Route index element={<WishlistDashboard />} />
                <Route path="clientes" element={<EmpresasClientesPage />} />
                <Route path="itens" element={<WishlistItemsPage />} />
                <Route path="apresentacoes" element={<ApresentacoesPage />} />
                <Route path="sobrepostos" element={<ClientesSobrepostosPage />} />
                <Route path="modo-apresentacao" element={<ModoApresentacaoPage />} />
                <Route path="troca-mutua" element={<TrocaMutuaPage />} />
                <Route path="qualificacao" element={<QualificacaoPage />} />
              </Routes>
            </div>
          </WishlistErrorBoundary>
        </CrmProvider>
      </WishlistProvider>
    </SafeContextProvider>
  );
};

export default WishlistPage;
