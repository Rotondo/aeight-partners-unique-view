
import { useMemo } from "react";

/**
 * Hook para normalização de dados
 */
export const useDataNormalization = () => {
  return useMemo(() => ({
    normalizeString: (str: any): string => {
      if (typeof str !== "string") return "";
      
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
    },

    normalizeStatus: (status: any): string => {
      const normalized = normalizeString(status);
      
      const statusMap: Record<string, string> = {
        "em_contato": "em_contato",
        "negociando": "negociando", 
        "ganho": "ganho",
        "perdido": "perdido",
        "contato": "em_contato",
        "apresentado": "em_contato",
        "sem contato": "perdido"
      };
      
      return statusMap[normalized] || "em_contato";
    },

    normalizeTipo: (tipo: any): string => {
      const normalized = normalizeString(tipo);
      return normalized || "extra";
    }
  }), []);
};

// Helper function
const normalizeString = (str: any): string => {
  if (typeof str !== "string") return "";
  
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};
