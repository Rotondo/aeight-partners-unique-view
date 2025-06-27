
import { IndicadoresParceiroWithEmpresa } from "./types";

export function exportToCSV(filteredIndicadores: IndicadoresParceiroWithEmpresa[], isDemoMode: boolean) {
  const headers = [
    "Empresa",
    "Potencial Leads",
    "Base Clientes",
    "Engajamento",
    "Alinhamento",
    "Pot. Investimento",
    "Tamanho",
    "Oportunidades Indicadas",
    "Share of Wallet (%)",
    "Data Avaliação",
  ];
  const rows = filteredIndicadores.map((i) => [
    isDemoMode ? "" : i.empresa?.nome || "-",
    i.potencial_leads,
    i.base_clientes || "-",
    i.engajamento,
    i.alinhamento,
    i.potencial_investimento,
    i.tamanho,
    i.oportunidadesIndicadas ?? 0,
    i.share_of_wallet !== undefined ? i.share_of_wallet.toFixed(2) : "-",
    formatDate(i.data_avaliacao),
  ]);
  let csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "indicadores.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export function maskName(nome: string | undefined, isDemoMode: boolean): string {
  if (!nome) return "-";
  return isDemoMode ? "" : nome;
}

export function arredondaParaCima(valor: number): number {
  if (valor <= 10) return 10;
  if (valor <= 20) return 20;
  if (valor <= 50) return 50;
  if (valor <= 100) return 100;
  return Math.ceil(valor / 10) * 10;
}

export function safeRenderCell(value: any): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 1);
    } catch {
      return "[objeto]";
    }
  }
  return String(value || "");
}
