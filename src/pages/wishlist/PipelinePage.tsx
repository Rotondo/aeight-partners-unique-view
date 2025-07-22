
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { ChevronLeft, Download, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import PipelineFilters from "@/components/wishlist/PipelineFilters";
import PipelineParceiroCard from "@/components/wishlist/PipelineParceiroCard";
import PipelineExport from "@/components/wishlist/PipelineExport";
import PipelineStats from "@/components/wishlist/PipelineStats";
import { WishlistApresentacao } from "@/types";

const PipelinePage: React.FC = () => {
  const {
    apresentacoes,
    loading,
    fetchApresentacoes,
  } = useWishlist();

  const navigate = useNavigate();

  const [parceiroFilter, setParceiroFilter] = useState<string>("all");
  const [executivoFilter, setExecutivoFilter] = useState<string>("all");
  const [faseFilter, setFaseFilter] = useState<string>("all");

  // Group apresentacoes by empresa_facilitadora
  const apresentacoesPorParceiro = React.useMemo(() => {
    let filteredApresentacoes = apresentacoes.filter(apresentacao => {
      // Only show apresentacoes that have been approved (have fase_pipeline)
      if (!apresentacao.fase_pipeline) return false;
      
      const matchesParceiro = parceiroFilter === "all" || 
        apresentacao.empresa_facilitadora?.nome === parceiroFilter;
      
      const matchesExecutivo = executivoFilter === "all" || 
        apresentacao.executivo_responsavel?.nome === executivoFilter;
      
      const matchesFase = faseFilter === "all" || 
        apresentacao.fase_pipeline === faseFilter;

      return matchesParceiro && matchesExecutivo && matchesFase;
    });

    const grouped = filteredApresentacoes.reduce((acc, apresentacao) => {
      const parceiroNome = apresentacao.empresa_facilitadora?.nome || "Sem Parceiro";
      if (!acc[parceiroNome]) {
        acc[parceiroNome] = [];
      }
      acc[parceiroNome].push(apresentacao);
      return acc;
    }, {} as Record<string, WishlistApresentacao[]>);

    return grouped;
  }, [apresentacoes, parceiroFilter, executivoFilter, faseFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/wishlist/itens")} className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar aos Itens
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline de Apresentações</h1>
            <p className="text-muted-foreground">
              Gerencie o fluxo de apresentações por parceiro facilitador
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <PipelineExport 
            apresentacoes={apresentacoes}
            parceiroFilter={parceiroFilter}
          />
        </div>
      </div>

      {/* Filters */}
      <PipelineFilters
        parceiroFilter={parceiroFilter}
        onParceiroChange={setParceiroFilter}
        executivoFilter={executivoFilter}
        onExecutivoChange={setExecutivoFilter}
        faseFilter={faseFilter}
        onFaseChange={setFaseFilter}
        apresentacoes={apresentacoes}
      />

      {/* Stats */}
      <PipelineStats apresentacoes={apresentacoes} />

      {/* Pipeline Cards */}
      <div className="space-y-6">
        {Object.keys(apresentacoesPorParceiro).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma apresentação encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Apresentações são criadas automaticamente quando itens da wishlist são aprovados
            </p>
          </div>
        ) : (
          Object.entries(apresentacoesPorParceiro).map(([parceiroNome, apresentacoesParceiro]) => (
            <PipelineParceiroCard
              key={parceiroNome}
              parceiroNome={parceiroNome}
              apresentacoes={apresentacoesParceiro}
              onUpdateApresentacao={fetchApresentacoes}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PipelinePage;
