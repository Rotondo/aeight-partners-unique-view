import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WishlistApresentacao, PipelineFase } from "@/types";
import ClientePipelineItem from "./ClientePipelineItem";
// Drag and Drop
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PipelineParceiroCardProps {
  parceiroNome: string;
  apresentacoes: WishlistApresentacao[];
  onUpdateApresentacao: () => void;
  draggingId?: string; // Recebe do PipelinePage para feedback visual opcional
}

const PipelineParceiroCard: React.FC<PipelineParceiroCardProps> = ({
  parceiroNome,
  apresentacoes,
  onUpdateApresentacao,
  draggingId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Agrupar apresentações por fase
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

  const totalClientes = apresentacoes.length;

  // Drag & Drop: cada fase vira uma lista "sortable"
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
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(apresentacoesPorFase).map(
              ([fase, apresentacoesFase]) => (
                <div key={fase} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={faseColors[fase as PipelineFase]}>
                      {faseLabels[fase as PipelineFase]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({apresentacoesFase.length})
                    </span>
                  </div>

                  {/* Drag & Drop context para os cards dessa fase */}
                  <SortableContext
                    items={apresentacoesFase.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[100px] bg-gray-50 rounded-lg p-3">
                      {apresentacoesFase.map((apresentacao) => (
                        <DraggableClientePipelineItem
                          key={apresentacao.id}
                          apresentacao={apresentacao}
                          onUpdate={onUpdateApresentacao}
                          isDragging={draggingId === apresentacao.id}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PipelineParceiroCard;

// Novo componente: Wrapper com DnD para cada card
interface DraggableClientePipelineItemProps {
  apresentacao: WishlistApresentacao;
  onUpdate: () => void;
  isDragging?: boolean;
}
const DraggableClientePipelineItem: React.FC<DraggableClientePipelineItemProps> = ({
  apresentacao,
  onUpdate,
  isDragging,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: apresentacao.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: dndIsDragging || isDragging ? 0.6 : 1,
    zIndex: dndIsDragging || isDragging ? 10 : "auto",
    cursor: "grab",
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ClientePipelineItem apresentacao={apresentacao} onUpdate={onUpdate} />
    </div>
  );
};
