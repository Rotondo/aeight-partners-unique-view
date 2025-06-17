
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, FileText, Filter } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { StatusAcaoCrm } from '@/types/diario';

export const CrmActionList: React.FC = () => {
  const { crmAcoes, loadingAcoes } = useCrm();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const acoesFiltradas = crmAcoes.filter(acao => {
    const matchStatus = filtroStatus === 'todos' || acao.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || acao.tipo === filtroTipo;
    return matchStatus && matchTipo;
  });

  const getStatusColor = (status: StatusAcaoCrm) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: StatusAcaoCrm) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'audio': return <div className="h-4 w-4 bg-green-500 rounded-full" />;
      case 'video': return <div className="h-4 w-4 bg-blue-500 rounded-full" />;
      case 'texto': return <FileText className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loadingAcoes) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="audio">Áudio</SelectItem>
            <SelectItem value="video">Vídeo</SelectItem>
            <SelectItem value="texto">Texto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de ações */}
      {acoesFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Nenhuma ação encontrada</h3>
          <p className="text-muted-foreground">
            {crmAcoes.length === 0 
              ? "Registre sua primeira ação para começar"
              : "Tente ajustar os filtros"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {acoesFiltradas.map((acao) => (
            <Card key={acao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTipoIcon(acao.tipo)}
                      <h4 className="font-semibold">{acao.titulo}</h4>
                      <Badge className={getStatusColor(acao.status)}>
                        {getStatusLabel(acao.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3">
                      {acao.descricao}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(acao.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(acao.created_at).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      
                      {acao.parceiro && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {acao.parceiro.nome}
                        </div>
                      )}
                    </div>
                    
                    {acao.proximos_passos && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          Próximos Passos:
                        </p>
                        <p>{acao.proximos_passos}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
