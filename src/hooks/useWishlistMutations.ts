
import {
  useEmpresaClienteMutations,
  useWishlistItemMutations,
  useApresentacaoMutations,
} from "./useWishlistMutations/index";

export const useWishlistMutations = (
  fetchEmpresasClientes: () => Promise<void>,
  fetchWishlistItems: () => Promise<void>,
  fetchApresentacoes: () => Promise<void>
) => {
  const empresaClienteMutations = useEmpresaClienteMutations(fetchEmpresasClientes);
  const wishlistItemMutations = useWishlistItemMutations(fetchWishlistItems);
  const apresentacaoMutations = useApresentacaoMutations(fetchApresentacoes, fetchWishlistItems);

  return {
    // Empresa Cliente
    ...empresaClienteMutations,
    // Wishlist Item
    ...wishlistItemMutations,
    // Apresentação
    ...apresentacaoMutations,
  };
};
