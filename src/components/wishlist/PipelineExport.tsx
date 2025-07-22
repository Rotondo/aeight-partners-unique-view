
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Users } from "lucide-react";
import { WishlistApresentacao } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PipelineExportProps {
  apresentacoes: WishlistApresentacao[];
  parceiroFilter: string;
}

const PipelineExport: React.FC<PipelineExportProps> = ({
  apresentacoes,
  parceiroFilter,
}) => {
  const faseLabels = {
    aprovado: "Aprovado",
    planejado: "Planejado",
    apresentado: "Apresentado",
    aguardando_feedback: "Aguardando Feedback",
    convertido: "Convertido",
    rejeitado: "Rejeitado",
  };

  const exportDelegacao = () => {
    const data = apresentacoes
      .filter(ap => ap.executivo_responsavel_id && ap.data_planejada)
      .map(ap => ({
        "Executivo": ap.executivo_responsavel?.nome || "Não definido",
        "Cliente": ap.wishlist_item?.empresa_desejada?.nome || "N/A",
        "Parceiro": ap.empresa_facilitadora?.nome || "N/A",
        "Fase": faseLabels[ap.fase_pipeline] || ap.fase_pipeline,
        "Data Planejada": ap.data_planejada ? format(new Date(ap.data_planejada), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
        "Status": ap.status_apresentacao,
        "Observações": ap.feedback || "",
      }));

    downloadCSV(data, `delegacao-tarefas-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportTransparenciaParceiro = () => {
    const data = apresentacoes
      .filter(ap => parceiroFilter === "all" || ap.empresa_facilitadora?.nome === parceiroFilter)
      .map(ap => ({
        "Cliente": ap.wishlist_item?.empresa_desejada?.nome || "N/A",
        "Empresa Interessada": ap.wishlist_item?.empresa_interessada?.nome || "N/A",
        "Fase": faseLabels[ap.fase_pipeline] || ap.fase_pipeline,
        "Data Apresentação": format(new Date(ap.data_apresentacao), "dd/MM/yyyy", { locale: ptBR }),
        "Data Planejada": ap.data_planejada ? format(new Date(ap.data_planejada), "dd/MM/yyyy", { locale: ptBR }) : "N/A",
        "Executivo": ap.executivo_responsavel?.nome || "Não definido",
        "Status": ap.status_apresentacao,
        "Converteu": ap.converteu_oportunidade ? "Sim" : "Não",
        "Observações": ap.feedback || "",
      }));

    const parceiro = parceiroFilter === "all" ? "todos-parceiros" : parceiroFilter.toLowerCase().replace(/\s+/g, '-');
    downloadCSV(data, `transparencia-${parceiro}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert("Nenhum dado para exportar");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => `"${row[header] || ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportDelegacao}>
          <Users className="h-4 w-4 mr-2" />
          Delegação de Tarefas
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportTransparenciaParceiro}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Transparência por Parceiro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PipelineExport;
