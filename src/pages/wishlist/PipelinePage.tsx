import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import PipelineFilters from "@/components/wishlist/PipelineFilters";
import PipelineParceiroCard from "@/components/wishlist/PipelineParceiroCard";
import PipelineExport from "@/components/wishlist/PipelineExport";
import PipelineStats from "@/components/wishlist/PipelineStats";
import { WishlistApresentacao } from "@/types";

// Novo: Drag and Drop
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const PipelinePage: React.FC = () => {
  const {
    apresentacoes,
    loading,
    fetchApresentacoes,
    updateApresentacao, // <-- Certifique-se de expor esse método no seu context
  } = useWishlist();

  const navigate = useNavigate();

  const [parceiroFilter, setParceiroFilter] = useState<string>("all");
  const [executivoFilter, setExecutivoFilter] = useState<string>("all");
  const [faseFilter, setFaseFilter] = useState<string>("all");

  // Estado para drag & drop
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [pipelinePorParceiro, setPipelinePorParceiro] = useState<Record<string, WishlistApresentacao[]>>({});

  // Agrupa as apresentações por parceiro, com filtros aplicados
  const apresentacoesPorParceiro = React.useMemo(() => {
    let filteredApresentacoes = apresentacoes.filter((apresentacao) => {
      if (!apresentacao.fase_pipeline) return false;

      const matchesParceiro =
        parceiroFilter === "all" ||
        apresentacao.empresa_facilitadora?.nome === parceiroFilter;

      const matchesExecutivo =
        executivoFilter === "all" ||
        apresentacao.executivo_responsavel?.nome === executivoFilter;

      const matchesFase =
        faseFilter === "all" ||
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

  // Sincroniza agrupamento local para drag & drop
  useEffect(() => {
    setPipelinePorParceiro(apresentacoesPorParceiro);
  }, [apresentacoesPorParceiro]);

  // Configura sensores do dnd-kit
  const sensors = useSensors(useSensor(PointerSensor));

  // Drag start
  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id as string);
  };

  // Drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // Encontra o parceiro do card sendo movido
    let parceiroNome: string | undefined;
    let cards: WishlistApresentacao[] = [];
    for (const [key, list] of Object.entries(pipelinePorParceiro)) {
      if (list.find((a) => a.id === active.id)) {
        parceiroNome = key;
        cards = list;
        break;
      }
    }
    if (!parceiroNome) return;

    const oldIndex = cards.findIndex((a) => a.id === active.id);
    const newIndex = cards.findIndex((a) => a.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Atualiza ordenação local
    const newCards = arrayMove(cards, oldIndex, newIndex);
    setPipelinePorParceiro({
      ...pipelinePorParceiro,
      [parceiroNome]: newCards,
    });

    // Opcional: Salvar ordenação no backend (ex: campo 'ordem' na apresentação) - customizar se necessário!
    // Exemplo: await updateApresentacao(active.id, { ordem: newIndex });

    // Refetch pipeline se necessário
    fetchApresentacoes();
  };

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
          <Button
            variant="outline"
            onClick={() => navigate("/wishlist/itens")}
            className="flex-shrink-0"
          >
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
          <PipelineExport apresentacoes={apresentacoes} parceiroFilter={parceiroFilter} />
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

      {/* Pipeline Cards com Drag & Drop */}
      <div className="space-y-6">
        {Object.keys(pipelinePorParceiro).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma apresentação encontrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Apresentações são criadas automaticamente quando itens da wishlist são aprovados
            </p>
          </div>
        ) : (
          Object.entries(pipelinePorParceiro).map(([parceiroNome, cards]) => (
            <div key={parceiroNome}>
              <h2 className="text-lg font-semibold mb-2">{parceiroNome}</h2>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={cards.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <PipelineParceiroCard
                    parceiroNome={parceiroNome}
                    apresentacoes={cards}
                    draggingId={draggingId}
                    onUpdateApresentacao={fetchApresentacoes}
                  />
                </SortableContext>
              </DndContext>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PipelinePage;
