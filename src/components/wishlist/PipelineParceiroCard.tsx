
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { WishlistApresentacao, PipelineFase } from "@/types";
import ClientePipelineItem from "./ClientePipelineItem";

interface PipelineParceiroCardProps {
  parceiroNome: string;
  apresentacoes: WishlistApresentacao[];
  onUpdateApresentacao: () => void;
}

const PipelineParceiroCard: React.FC<PipelineParceiroCardProps> = ({
  parceiroNome,
  apresentacoes,
  onUpdateApresentacao,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Group apresentacoes by fase
  const apresentacoesPorFase = React.useMemo(() => {
    const grouped: Record<PipelineFase, WishlistApresentacao[]> = {
      aprovado: [],
      planejado: [],
      apresentado: [],
      aguardando_feedback: [],
      convertido: [],
      rejeitado: [],
    };

    apresentacoes.forEach(apresentacao => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(apresentacoesPorFase).map(([fase, apresentacoesFase]) => (
              <div key={fase} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={faseColors[fase as PipelineFase]}>
                    {faseLabels[fase as PipelineFase]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({apresentacoesFase.length})
                  </span>
                </div>
                
                <div className="space-y-2 min-h-[100px] bg-gray-50 rounded-lg p-3">
                  {apresentacoesFase.map(apresentacao => (
                    <ClientePipelineItem
                      key={apresentacao.id}
                      apresentacao={apresentacao}
                      onUpdate={onUpdateApresentacao}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PipelineParceiroCard;
