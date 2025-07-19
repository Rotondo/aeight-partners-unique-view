
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, History, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VtexFeedbackListProps {
  oportunidades: Oportunidade[];
  onDarFeedback: (oportunidade: Oportunidade) => void;
  onVerHistorico: (oportunidade: Oportunidade) => void;
}

export const VtexFeedbackList: React.FC<VtexFeedbackListProps> = ({
  oportunidades,
  onDarFeedback,
  onVerHistorico
}) => {
  const { getUltimoFeedback, temFeedbackPendente } = useVtexFeedback();

  const getStatusFeedback = (oportunidade: Oportunidade) => {
    const ultimoFeedback = getUltimoFeedback(oportunidade.id);
    const isPendente = temFeedbackPendente(oportunidade.id, ultimoFeedback?.data_feedback);
    
    if (!ultimoFeedback) {
      return {
        status: 'nunca_enviado',
        label: 'Nunca enviado',
        variant: 'destructive' as const,
        icon: AlertTriangle
      };
    }
    
    if (isPendente) {
      return {
        status: 'atrasado',
        label: 'Atrasado',
        variant: 'destructive' as const,
        icon: AlertTriangle
      };
    }
    
    return {
      status: 'em_dia',
      label: 'Em dia',
      variant: 'default' as const,
      icon: CheckCircle
    };
  };

  const getProximoFeedback = (ultimaData?: string) => {
    if (!ultimaData) return 'Imediato';
    
    const proxima = new Date(ultimaData);
    proxima.setDate(proxima.getDate() + 7);
    
    return format(proxima, 'dd/MM/yyyy', { locale: ptBR });
  };

  if (oportunidades.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma oportunidade VTEX encontrada</h3>
          <p className="text-muted-foreground text-center">
            Não há oportunidades VTEX ativas no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{oportunidades.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-500">
                  {oportunidades.filter(op => {
                    const ultimoFeedback = getUltimoFeedback(op.id);
                    return temFeedbackPendente(op.id, ultimoFeedback?.data_feedback);
                  }).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em dia</p>
                <p className="text-2xl font-bold text-green-500">
                  {oportunidades.filter(op => {
                    const ultimoFeedback = getUltimoFeedback(op.id);
                    return !temFeedbackPendente(op.id, ultimoFeedback?.data_feedback);
                  }).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de oportunidades */}
      <div className="space-y-4">
        {oportunidades.map((oportunidade) => {
          const statusFeedback = getStatusFeedback(oportunidade);
          const ultimoFeedback = getUltimoFeedback(oportunidade.id);
          const StatusIcon = statusFeedback.icon;
          
          return (
            <Card key={oportunidade.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base">{oportunidade.nome_lead}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {oportunidade.empresa_origem?.nome} → {oportunidade.empresa_destino?.nome}
                    </p>
                  </div>
                  <Badge variant={statusFeedback.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusFeedback.label}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Próximo: {getProximoFeedback(ultimoFeedback?.data_feedback)}
                      </span>
                    </div>
                    {ultimoFeedback && (
                      <div>
                        Último: {format(new Date(ultimoFeedback.data_feedback), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerHistorico(oportunidade)}
                      className="flex items-center gap-1"
                    >
                      <History className="h-4 w-4" />
                      Histórico
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onDarFeedback(oportunidade)}
                      className="flex items-center gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Dar Feedback
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
