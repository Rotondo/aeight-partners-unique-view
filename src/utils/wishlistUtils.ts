
import { WishlistItem, WishlistStatus } from "@/types";

const CONSOLE_PREFIX = "[WishlistUtils]";

export const filterWishlistItems = (
  items: WishlistItem[],
  searchTerm: string,
  statusFilter: WishlistStatus | "all",
  origemFilter?: string,
  destinoFilter?: string
): WishlistItem[] => {
  return items.filter((item) => {
    try {
      const matchesSearch =
        (item.empresa_interessada?.nome || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.empresa_desejada?.nome || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.empresa_proprietaria?.nome || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      const matchesOrigem = !origemFilter || origemFilter === "all" || 
        item.empresa_proprietaria?.nome === origemFilter;
      
      // Destino: agora comparamos por ID para evitar colisões com nomes incorretos
      const matchesDestino = !destinoFilter || destinoFilter === "all" || 
        item.empresa_desejada_id === destinoFilter;

      if (
        !item.empresa_interessada?.nome ||
        !item.empresa_desejada?.nome ||
        !item.empresa_proprietaria?.nome
      ) {
        console.warn(
          `${CONSOLE_PREFIX} Item com campos nulos:`,
          item
        );
      }

      return matchesSearch && matchesStatus && matchesOrigem && matchesDestino;
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao filtrar wishlistItens:`, error, item);
      return false;
    }
  });
};

export const sortWishlistItems = (
  items: WishlistItem[],
  sortField: string | null,
  sortDirection: "asc" | "desc"
): WishlistItem[] => {
  if (!sortField) return items;

  return [...items].sort((a, b) => {
    let valueA: any;
    let valueB: any;

    switch (sortField) {
      case "empresa_interessada.nome":
        valueA = a.empresa_interessada?.nome || "";
        valueB = b.empresa_interessada?.nome || "";
        break;
      case "empresa_proprietaria.nome":
        valueA = a.empresa_proprietaria?.nome || "";
        valueB = b.empresa_proprietaria?.nome || "";
        break;
      case "empresa_desejada.nome":
        valueA = a.empresa_desejada?.nome || "";
        valueB = b.empresa_desejada?.nome || "";
        break;
      case "prioridade":
        valueA = a.prioridade;
        valueB = b.prioridade;
        break;
      case "status":
        valueA = a.status;
        valueB = b.status;
        break;
      case "data_solicitacao":
        valueA = new Date(a.data_solicitacao);
        valueB = new Date(b.data_solicitacao);
        break;
      default:
        return 0;
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    if (valueA < valueB) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
};

export const toSafeString = (val: unknown): string => {
  return typeof val === "string" ? val : val == null ? "" : String(val);
};

export const toSafeNumber = (val: unknown, fallback = 3): number => {
  return typeof val === "number" && !isNaN(val) ? val : fallback;
};
