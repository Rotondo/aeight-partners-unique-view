import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WishlistApresentacao, PipelineFase } from "@/types";
import ClientePipelineItem from "./ClientePipelineItem";
import {
  DndContext,
  useDroppable,
  useDraggable,
  DragOverlay,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PipelineParceiroCardProps {
  parceiroNome: string;
  apresentacoes: WishlistApresentacao[];
  onUpdateApresentacao: () => void;
  draggingId?: string;
  updateApresentacaoFase?: (apresentacaoId: string, novaFase: PipelineFase) => Promise<void>;
}

const fases: PipelineFase[] = [
  "aprovado",
  "planejado",
  "apresentado",
  "aguardando_feedback",
  "convertido",
  "rejeitado",
];

const faseLabels: Record<PipelineFase, string> = {
  aprovado: "Aprovado",
  planejado: "Planejado",
  apresentado: "Apresentado",
  aguardando_feedback: "Aguardando Feedback",
  convertido: "Convertido",
  rejeitado: "Rejeitado",
};

const faseColors: Record<PipelineFase, string> = {
  aprovado: "bg-blue-100 text-blue-800",
  planejado: "bg-yellow-100 text-yellow-800",
  apresentado: "bg-purple-100 text-purple-800",
  aguardando_feedback: "bg-orange-100 text-orange-800",
  convertido: "bg-green-100 text-green-800",
  rejeitado: "bg-red-100 text-red-800",
};

const PipelineParceiroCard: React.FC<PipelineParceiroCardProps> = ({
  parceiroNome,
  apresentacoes,
  onUpdateApresentacao,
  draggingId,
  updateApresentacaoFase,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeCard, setActiveCard] = useState<WishlistApresentacao | null>(null);

  // Agrupa por fase
  const apresentacoesPorFase = React.useMemo(() => {
    const grouped: Record<PipelineFase, WishlistApresentacao[]> = {
      aprovado: [],
      planejado: [],
      apresentado: [],
      aguardando_feedback: [],
      convertido: [],
      rejeitado: [],
    };

    apresentacoes.forEach((apresentacao) => {
      if (apresentacao.fase_pipeline) {
        grouped[apresentacao.fase_pipeline].push(apresentacao);
      }
    });

    return grouped;
  }, [apresentacoes]);

  const totalClientes = apresentacoes.length;

  // DnD: handle drag end para troca de fase
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const card = apresentacoes.find(ap => ap.id === active.id);
    const faseDestino = over.id as PipelineFase;
    if (!card || card.fase_pipeline === faseDestino) return;

    if (updateApresentacaoFase) {
      await updateApresentacaoFase(card.id, faseDestino);
    }
    onUpdateApresentacao();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">{parceiroNome}</CardTitle>
            <Badge variant="outline">{totalClientes} clientes</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={event => {
              const itemId = event.active.id as string;
              const card = apresentacoes.find(ap => ap.id === itemId);
              setActiveCard(card || null);
            }}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fases.map(fase => (
                <DroppableFaseColumn
                  key={fase}
                  fase={fase}
                  apresentacoes={apresentacoesPorFase[fase]}
                  draggingId={draggingId}
                />
              ))}
            </div>
            <DragOverlay>
              {activeCard && (
                <ClientePipelineItem apresentacao={activeCard} onUpdate={onUpdateApresentacao} />
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      )}
    </Card>
  );
};

export default PipelineParceiroCard;

// Coluna droppable de fase
function DroppableFaseColumn({
  fase,
  apresentacoes,
  draggingId,
}: {
  fase: PipelineFase;
  apresentacoes: WishlistApresentacao[];
  draggingId?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: fase,
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 transition-all ${isOver ? "ring-2 ring-primary ring-inset" : ""}`}
      style={{ minHeight: 120, background: "#FAFAFA", borderRadius: 8, padding: 12 }}
    >
      <div className="flex items-center gap-2">
        <Badge className={faseColors[fase]}>{faseLabels[fase]}</Badge>
        <span className="text-sm text-muted-foreground">
          ({apresentacoes.length})
        </span>
      </div>
      <SortableContext
        items={apresentacoes.map(a => a.id)}
        strategy={verticalListSortingStrategy}
      >
        {apresentacoes.map(apresentacao => (
          <DraggableClientePipelineItem
            key={apresentacao.id}
            apresentacao={apresentacao}
            isDragging={draggingId === apresentacao.id}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// Card drag handle
function DraggableClientePipelineItem({
  apresentacao,
  isDragging,
}: {
  apresentacao: WishlistApresentacao;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging: dndIsDragging } =
    useDraggable({ id: apresentacao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 200ms ease",
    opacity: dndIsDragging || isDragging ? 0.6 : 1,
    zIndex: dndIsDragging || isDragging ? 10 : "auto",
    cursor: "grab",
    marginBottom: 8,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ClientePipelineItem apresentacao={apresentacao} onUpdate={() => {}} />
    </div>
  );
}