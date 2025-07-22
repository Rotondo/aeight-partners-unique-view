
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { WishlistApresentacao, PipelineFase } from "@/types";

interface PipelineFiltersProps {
  parceiroFilter: string;
  onParceiroChange: (value: string) => void;
  executivoFilter: string;
  onExecutivoChange: (value: string) => void;
  faseFilter: string;
  onFaseChange: (value: string) => void;
  apresentacoes: WishlistApresentacao[];
}

const PipelineFilters: React.FC<PipelineFiltersProps> = ({
  parceiroFilter,
  onParceiroChange,
  executivoFilter,
  onExecutivoChange,
  faseFilter,
  onFaseChange,
  apresentacoes,
}) => {
  // Extract unique values for filters
  const parceirosUnicos = Array.from(
    new Set(apresentacoes.map(item => item.empresa_facilitadora?.nome).filter(Boolean))
  ).sort();

  const executivosUnicos = Array.from(
    new Set(apresentacoes.map(item => item.executivo_responsavel?.nome).filter(Boolean))
  ).sort();

  const faseLabels: Record<PipelineFase, string> = {
    aprovado: "Aprovado",
    planejado: "Planejado",
    apresentado: "Apresentado",
    aguardando_feedback: "Aguardando Feedback",
    convertido: "Convertido",
    rejeitado: "Rejeitado",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Parceiro</label>
            <Select value={parceiroFilter} onValueChange={onParceiroChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os parceiros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os parceiros</SelectItem>
                {parceirosUnicos.map((parceiro) => (
                  <SelectItem key={parceiro} value={parceiro}>
                    {parceiro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Executivo</label>
            <Select value={executivoFilter} onValueChange={onExecutivoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os executivos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os executivos</SelectItem>
                {executivosUnicos.map((executivo) => (
                  <SelectItem key={executivo} value={executivo}>
                    {executivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Fase</label>
            <Select value={faseFilter} onValueChange={onFaseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fases</SelectItem>
                {Object.entries(faseLabels).map(([fase, label]) => (
                  <SelectItem key={fase} value={fase}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineFilters;
