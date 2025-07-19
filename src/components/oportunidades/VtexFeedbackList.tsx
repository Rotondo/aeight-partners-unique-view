
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, History, Clock, AlertTriangle, CheckCircle, XCircle, Bug } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexDebugPanel } from './VtexDebugPanel';
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
  const { getUltimoFeedback, getStatusFeedback, getEstatisticasFeedback } = useVtexFeedback();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [showDebug, setShowDebug] = useState(process.env.NODE_ENV === 'development');

  const stats = getEstatisticasFeedback(oportunidades);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'nunca_enviado':
        return {
          label: 'Nunca enviado',
          variant: 'destructive' as const,
          icon: XCircle,
          color: 'text-red-500'
        };
      case 'atrasado':
        return {
          label: 'Atrasado',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-red-500'
        };
      case 'em_dia':
        return {
          label: 'Em dia',
          variant: 'default' as const,
          icon: CheckCircle,
          color: 'text-green-500'
        };
      default:
        return {
          label: 'Desconhecido',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-gray-500'
        };
    }
  };

  const getProximoFeedback = (ultimaData?: string) => {
    if (!ultimaData) return 'Imediato';
    
    const proxima = new Date(ultimaData);
    proxima.setDate(proxima.getDate() + 7);
    
    return format(proxima, 'dd/MM/yyyy', { locale: ptBR });
  };

  // Filtrar oportunidades
  const oportunidadesFiltradas = oportunidades.filter(op => {
    if (filtroStatus === 'todos') return true;
    return getStatusFeedback(op.id) === filtroStatus;
  });

  if (oportunidades.length === 0) {
    return (
      <div className="space-y-4">
        {/* Debug Panel */}
        <VtexDebugPanel isVisible={showDebug} />
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma oportunidade VTEX encontrada</h3>
            <p className="text-muted-foreground text-center">
              Não há oportunidades VTEX ativas no momento.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(!showDebug)}
              className="mt-4 text-xs"
            >
              <Bug className="h-3 w-3 mr-1" />
              {showDebug ? 'Ocultar' : 'Mostrar'} Debug
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      <VtexDebugPanel isVisible={showDebug} />

      {/* Debug Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs"
          >
            <Bug className="h-3 w-3 mr-1" />
            {showDebug ? 'Ocultar' : 'Mostrar'} Debug
          </Button>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nunca enviado</p>
                <p className="text-2xl font-bold text-gray-500">{stats.nunca_enviado}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-500">{stats.atrasado}</p>
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
                <p className="text-2xl font-bold text-green-500">{stats.em_dia}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filtrar por status:</span>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos ({stats.total})</SelectItem>
              <SelectItem value="nunca_enviado">Nunca enviado ({stats.nunca_enviado})</SelectItem>
              <SelectItem value="atrasado">Atrasados ({stats.atrasado})</SelectItem>
              <SelectItem value="em_dia">Em dia ({stats.em_dia})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de oportunidades */}
      <div className="space-y-4">
        {oportunidadesFiltradas.map((oportunidade) => {
          const status = getStatusFeedback(oportunidade.id);
          const statusInfo = getStatusBadge(status);
          const ultimoFeedback = getUltimoFeedback(oportunidade.id);
          const StatusIcon = statusInfo.icon;
          
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
                  <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {statusInfo.label}
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
                      variant={status === 'atrasado' || status === 'nunca_enviado' ? 'destructive' : 'default'}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {status === 'nunca_enviado' ? 'Primeiro Feedback' : 'Dar Feedback'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {oportunidadesFiltradas.length === 0 && filtroStatus !== 'todos' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">
              Nenhuma oportunidade encontrada com o status selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
