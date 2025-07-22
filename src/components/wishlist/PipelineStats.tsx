
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WishlistApresentacao, PipelineFase } from "@/types";

interface PipelineStatsProps {
  apresentacoes: WishlistApresentacao[];
}

const PipelineStats: React.FC<PipelineStatsProps> = ({ apresentacoes }) => {
  const stats = React.useMemo(() => {
    const faseCount: Record<PipelineFase, number> = {
      aprovado: 0,
      planejado: 0,
      apresentado: 0,
      aguardando_feedback: 0,
      convertido: 0,
      rejeitado: 0,
    };

    apresentacoes.forEach(apresentacao => {
      if (apresentacao.fase_pipeline) {
        faseCount[apresentacao.fase_pipeline]++;
      }
    });

    return faseCount;
  }, [apresentacoes]);

  const faseLabels: Record<PipelineFase, string> = {
    aprovado: "Aprovados",
    planejado: "Planejados",
    apresentado: "Apresentados",
    aguardando_feedback: "Aguardando Feedback",
    convertido: "Convertidos",
    rejeitado: "Rejeitados",
  };

  const faseColors: Record<PipelineFase, string> = {
    aprovado: "text-blue-600",
    planejado: "text-yellow-600",
    apresentado: "text-purple-600",
    aguardando_feedback: "text-orange-600",
    convertido: "text-green-600",
    rejeitado: "text-red-600",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {Object.entries(stats).map(([fase, count]) => (
        <Card key={fase}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {faseLabels[fase as PipelineFase]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${faseColors[fase as PipelineFase]}`}>
              {count}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PipelineStats;
