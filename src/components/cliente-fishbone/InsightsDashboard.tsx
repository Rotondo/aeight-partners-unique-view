import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, TrendingUp, Users, Plus, Target, CheckCircle } from 'lucide-react';
import { ClienteFishboneView } from '@/types/cliente-fishbone';
import FishboneHeatMap from './FishboneHeatMap';

interface InsightsDashboardProps {
  fishboneData: ClienteFishboneView[];
  onAddFornecedor?: (etapaId: string, subnivelId?: string) => void;
  onQuickAction?: (action: string, data: any) => void;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  fishboneData,
  onAddFornecedor,
  onQuickAction
}) => {
  if (!fishboneData || fishboneData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Insights aparecerão aqui</p>
        </CardContent>
      </Card>
    );
  }

  const clienteView = fishboneData[0];

  // Calculate insights
  const insights = {
    etapasCriticas: clienteView.etapas.filter(e => 
      e.fornecedores.length === 0 && e.subniveis.every(s => s.fornecedores.length === 0)
    ),
    etapasComPoucosFornecedores: clienteView.etapas.filter(e => {
      const total = e.fornecedores.length + e.subniveis.reduce((acc, s) => acc + s.fornecedores.length, 0);
      return total === 1;
    }),
    etapasComMuitosParceiros: clienteView.etapas.filter(e => {
      const totalFornecedores = e.fornecedores.length + e.subniveis.reduce((acc, s) => acc + s.fornecedores.length, 0);
      const totalParceiros = e.fornecedores.filter(f => f.is_parceiro).length + 
        e.subniveis.reduce((acc, s) => acc + s.fornecedores.filter(f => f.is_parceiro).length, 0);
      return totalFornecedores > 0 && (totalParceiros / totalFornecedores) >= 0.7;
    }),
    totalGaps: clienteView.etapas.reduce((acc, e) => acc + (e.gaps || 0), 0),
    coveragePercentage: Math.round(
      (clienteView.etapas.filter(e => 
        e.fornecedores.length > 0 || e.subniveis.some(s => s.fornecedores.length > 0)
      ).length / clienteView.etapas.length) * 100
    )
  };

  const quickActions = [
    {
      label: 'Preencher Gaps Críticos',
      icon: AlertTriangle,
      variant: 'destructive' as const,
      action: () => onQuickAction?.('fill_critical_gaps', insights.etapasCriticas),
      count: insights.etapasCriticas.length
    },
    {
      label: 'Diversificar Fornecedores',
      icon: Users,
      variant: 'outline' as const,
      action: () => onQuickAction?.('diversify_suppliers', insights.etapasComPoucosFornecedores),
      count: insights.etapasComPoucosFornecedores.length
    },
    {
      label: 'Promover a Parceiros',
      icon: TrendingUp,
      variant: 'default' as const,
      action: () => onQuickAction?.('promote_partners', null),
      count: 0
    }
  ];

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            KPIs Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {insights.coveragePercentage}%
              </div>
              <div className="text-xs text-muted-foreground">Cobertura</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">
                {insights.etapasCriticas.length}
              </div>
              <div className="text-xs text-muted-foreground">Gaps Críticos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <FishboneHeatMap fishboneData={fishboneData} />
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Critical gaps */}
          {insights.etapasCriticas.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Gaps Críticos</span>
                <Badge variant="destructive" className="text-xs">
                  {insights.etapasCriticas.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {insights.etapasCriticas.slice(0, 3).map(etapa => (
                  <div key={etapa.id} className="flex items-center justify-between">
                    <span>{etapa.nome}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 px-2 text-xs"
                      onClick={() => onAddFornecedor?.(etapa.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                ))}
                {insights.etapasCriticas.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{insights.etapasCriticas.length - 3} mais...
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Single supplier warning */}
          {insights.etapasComPoucosFornecedores.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Risco de Dependência</span>
                <Badge variant="outline" className="text-xs">
                  {insights.etapasComPoucosFornecedores.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Etapas com apenas 1 fornecedor. Considere diversificar.
              </div>
            </div>
          )}

          <Separator />

          {/* Success stories */}
          {insights.etapasComMuitosParceiros.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Parcerias Fortes</span>
                <Badge variant="outline" className="text-xs">
                  {insights.etapasComMuitosParceiros.length}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {insights.etapasComMuitosParceiros.slice(0, 2).map(etapa => etapa.nome).join(', ')}
                {insights.etapasComMuitosParceiros.length > 2 && '...'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={action.action}
              disabled={action.count === 0}
            >
              <action.icon className="h-3 w-3 mr-2" />
              {action.label}
              {action.count > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {action.count}
                </Badge>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsDashboard;