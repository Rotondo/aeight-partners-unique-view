
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, Users, CheckCircle, Clock, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ParceiroRelevanceProps {
  parceiro: {
    id: string;
    nome: string;
    totalClientes: number;
    clientesDeInteresse: number;
    apresentacoesRealizadas: number;
    apresentacoesPendentes: number;
    solicitacoesAprovadas: number;
    taxaConversao: number;
    taxaAprovacao: number;
    scoreRelevancia: number;
    ultimaAtividade?: string;
  };
  onClick?: () => void;
}

const ParceiroRelevanceCard: React.FC<ParceiroRelevanceProps> = ({
  parceiro,
  onClick,
}) => {
  const getRelevanceBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, label: "Alto", color: "text-green-600" };
    if (score >= 60) return { variant: "secondary" as const, label: "Médio", color: "text-yellow-600" };
    return { variant: "outline" as const, label: "Baixo", color: "text-red-600" };
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
          <Badge variant={relevanceBadge.variant} className={relevanceBadge.color}>
            {relevanceBadge.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total Clientes</span>
              <span className="font-medium">{parceiro.totalClientes}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">De Interesse</span>
              <span className="font-medium text-primary">
                {parceiro.clientesDeInteresse}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Realizadas</span>
              <span className="font-medium">{parceiro.apresentacoesRealizadas}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Pendentes</span>
              <span className="font-medium">{parceiro.apresentacoesPendentes}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Aprovadas</span>
              <span className="font-medium">{parceiro.solicitacoesAprovadas}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Conversão:</span>
            <span className="font-medium">
              {parceiro.taxaConversao.toFixed(1)}%
            </span>
          </div>
        </div>

        {parceiro.ultimaAtividade && (
          <div className="text-xs text-muted-foreground">
            Última atividade: {format(new Date(parceiro.ultimaAtividade), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        )}
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Score de Relevância</span>
            <span className="font-medium">{parceiro.scoreRelevancia}/100</span>
          </div>
          <Progress value={parceiro.scoreRelevancia} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-medium">{parceiro.taxaAprovacao.toFixed(1)}%</div>
            <div className="text-muted-foreground">Taxa Aprovação</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-medium">
              {parceiro.totalClientes > 0 ? ((parceiro.clientesDeInteresse / parceiro.totalClientes) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-muted-foreground">% Interesse</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParceiroRelevanceCard;
