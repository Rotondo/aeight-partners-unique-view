
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, Users, CheckCircle } from "lucide-react";

interface ParceiroRelevanceProps {
  parceiro: {
    id: string;
    nome: string;
    totalClientes: number;
    clientesDeInteresse: number;
    apresentacoesRealizadas: number;
    taxaConversao: number;
    scoreRelevancia: number;
  };
  onClick?: () => void;
}

const ParceiroRelevanceCard: React.FC<ParceiroRelevanceProps> = ({
  parceiro,
  onClick,
}) => {
  const getRelevanceBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Alto" };
    if (score >= 60) return { variant: "secondary" as const, label: "Médio" };
    return { variant: "outline" as const, label: "Baixo" };
  };

  const relevanceBadge = getRelevanceBadge(parceiro.scoreRelevancia);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {parceiro.nome}
          </CardTitle>
          <Badge variant={relevanceBadge.variant}>
            {relevanceBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total Clientes:</span>
            <span className="font-medium">{parceiro.totalClientes}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">De Interesse:</span>
            <span className="font-medium text-primary">
              {parceiro.clientesDeInteresse}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Apresentações:</span>
            <span className="font-medium">{parceiro.apresentacoesRealizadas}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Conversão:</span>
            <span className="font-medium">
              {parceiro.taxaConversao.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Score de Relevância</span>
            <span className="font-medium">{parceiro.scoreRelevancia}/100</span>
          </div>
          <Progress value={parceiro.scoreRelevancia} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ParceiroRelevanceCard;
