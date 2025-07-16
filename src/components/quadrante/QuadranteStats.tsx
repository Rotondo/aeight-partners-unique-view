import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CheckCircle } from "lucide-react";

interface QuadranteStatsProps {
  totalParceiros: number;
  parceirosAvaliados: number;
}

const QuadranteStats: React.FC<QuadranteStatsProps> = ({
  totalParceiros,
  parceirosAvaliados,
}) => {
  const parceirosPendentes = totalParceiros - parceirosAvaliados;
  const progressPercentage = totalParceiros > 0 ? (parceirosAvaliados / totalParceiros) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{totalParceiros}</p>
              <p className="text-sm text-muted-foreground">Total de Parceiros</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{parceirosAvaliados}</p>
              <p className="text-sm text-muted-foreground">Avaliados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold">{parceirosPendentes}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Progresso de Avaliação</p>
              <Badge variant={progressPercentage === 100 ? "default" : "secondary"}>
                {progressPercentage.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {progressPercentage === 100 
                ? "🎉 Todos os parceiros foram avaliados!" 
                : `${parceirosPendentes} parceiro${parceirosPendentes !== 1 ? 's' : ''} ainda precisam ser avaliados`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuadranteStats;