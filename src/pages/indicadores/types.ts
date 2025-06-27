
import { IndicadoresParceiro, Empresa, Oportunidade, TamanhoEmpresa } from "@/types";

export interface IndicadoresParceiroWithEmpresa extends IndicadoresParceiro {
  empresa?: {
    id: string;
    nome: string;
  };
  oportunidadesIndicadas?: number;
  share_of_wallet?: number;
}

export const QUALI_KEYS = [
  { key: "potencial_leads", label: "Potencial" },
  { key: "engajamento", label: "Engajamento" },
  { key: "alinhamento", label: "Alinhamento" },
  { key: "potencial_investimento", label: "Pot. Investimento" },
];

export const TAMANHOS = [
  { value: "PP", label: "Pequeno Porte (PP)" },
  { value: "P", label: "Pequeno (P)" },
  { value: "M", label: "Médio (M)" },
  { value: "G", label: "Grande (G)" },
  { value: "GG", label: "Grande Porte (GG)" },
];
