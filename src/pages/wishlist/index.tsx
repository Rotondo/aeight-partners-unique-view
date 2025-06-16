import React from "react";
import WishlistDashboard from "./WishlistDashboard";
import { WishlistProvider } from "@/contexts/WishlistContext";

/**
 * Página principal da Wishlist & Networking.
 * Fornece o contexto global e exibe o dashboard centralizado do módulo.
 */
const WishlistIndexPage: React.FC = () => {
  return (
    <WishlistProvider>
      <WishlistDashboard />
    </WishlistProvider>
  );
};

export default WishlistIndexPage;