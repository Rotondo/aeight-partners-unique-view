import React from "react";
import { RouteObject } from "react-router-dom";
import WishlistIndexPage from "./index";
import WishlistItemsPage from "./WishlistItemsPage";
import ApresentacoesPage from "./ApresentacoesPage";
import EmpresasClientesPage from "./EmpresasClientesPage";

/**
 * Rotas do módulo Wishlist & Networking.
 * Use estas rotas para incluir no roteamento principal do app.
 */
const wishlistRoutes: RouteObject[] = [
  {
    path: "/wishlist",
    element: <WishlistIndexPage />,
    children: [
      {
        path: "items",
        element: <WishlistItemsPage />,
      },
      {
        path: "apresentacoes",
        element: <ApresentacoesPage />,
      },
      {
        path: "clientes",
        element: <EmpresasClientesPage />,
      },
    ],
  },
];

export default wishlistRoutes;