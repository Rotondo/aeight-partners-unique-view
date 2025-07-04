import { WishlistItem, WishlistStatus } from "@/types";

const CONSOLE_PREFIX = "[WishlistUtils]";

export const filterWishlistItems = (
  items: WishlistItem[],
  searchTerm: string,
  statusFilter: WishlistStatus | "all"
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

      return matchesSearch && matchesStatus;
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao filtrar wishlistItens:`, error, item);
      return false;
    }
  });
};

export const toSafeString = (val: unknown): string => {
  return typeof val === "string" ? val : val == null ? "" : String(val);
};

export const toSafeNumber = (val: unknown, fallback = 3): number => {
  return typeof val === "number" && !isNaN(val) ? val : fallback;
};