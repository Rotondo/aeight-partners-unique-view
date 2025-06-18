
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, FileText, Filter, Edit, Trash2, Eye, MessageSquare, Phone, Mail, Users, Video } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { CrmAcao, StatusAcaoCrm, MetodoComunicacao } from '@/types/diario';
import { CrmActionDetail } from './CrmActionDetail';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CrmActionList: React.FC = () => {
  const { crmAcoes, loadingAcoes, deleteAcaoCrm } = useCrm();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroComunicacao, setFiltroComunicacao] = useState<string>('todos');
  const [filtroPeriodoInicio, setFiltroPeriodoInicio] = useState<Date | undefined>();
  const [filtroPeriodoFim, setFiltroPeriodoFim] = useState<Date | undefined>();
  const [selectedAction, setSelectedAction] = useState<CrmAcao | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const acoesFiltradas = crmAcoes.filter(acao => {
    const matchStatus = filtroStatus === 'todos' || acao.status === filtroStatus;
    const matchComunicacao = filtroComunicacao === 'todos' || acao.communication_method === filtroComunicacao;
    
    let matchPeriodo = true;
    if (filtroPeriodoInicio || filtroPeriodoFim) {
      const acaoData = new Date(acao.created_at);
      if (filtroPeriodoInicio && acaoData < filtroPeriodoInicio) matchPeriodo = false;
      if (filtroPeriodoFim && acaoData > filtroPeriodoFim) matchPeriodo = false;
    }
    
    return matchStatus && matchComunicacao && matchPeriodo;
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

  const getComunicacaoIcon = (metodo: MetodoComunicacao) => {
    switch (metodo) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'ligacao': return <Phone className="h-4 w-4 text-blue-600" />;
      case 'email': return <Mail className="h-4 w-4 text-red-600" />;
      case 'encontro': return <Users className="h-4 w-4 text-purple-600" />;
      case 'reuniao_meet': return <Video className="h-4 w-4 text-orange-600" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComunicacaoLabel = (metodo: MetodoComunicacao) => {
    switch (metodo) {
      case 'whatsapp': return 'WhatsApp';
      case 'ligacao': return 'Ligação';
      case 'email': return 'E-mail';
      case 'encontro': return 'Encontro';
      case 'reuniao_meet': return 'Meet/Online';
      default: return metodo;
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta ação?')) {
      await deleteAcaoCrm(id);
    }
  };

  const handleViewDetails = (acao: CrmAcao) => {
    setSelectedAction(acao);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setFiltroStatus('todos');
    setFiltroComunicacao('todos');
    setFiltroPeriodoInicio(undefined);
    setFiltroPeriodoFim(undefined);
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
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroComunicacao} onValueChange={setFiltroComunicacao}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Comunicação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Meios</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="ligacao">Ligação</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="encontro">Encontro</SelectItem>
                <SelectItem value="reuniao_meet">Meet/Online</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <DatePicker
                selected={filtroPeriodoInicio}
                onSelect={setFiltroPeriodoInicio}
                placeholder="Data início"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <DatePicker
                selected={filtroPeriodoFim}
                onSelect={setFiltroPeriodoFim}
                placeholder="Data fim"
              />
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      {getComunicacaoIcon(acao.communication_method)}
                      <h4 className="font-semibold">{acao.description}</h4>
                      <Badge className={getStatusColor(acao.status)}>
                        {getStatusLabel(acao.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getComunicacaoLabel(acao.communication_method)}
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {acao.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(acao.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(acao.created_at), 'HH:mm')}
                      </div>
                      
                      {acao.parceiro && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {acao.parceiro.nome}
                        </div>
                      )}
                    </div>
                    
                    {acao.next_steps && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          Próximos Passos:
                        </p>
                        <p>{acao.next_steps}</p>
                        {acao.next_step_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📅 {format(new Date(acao.next_step_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(acao)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(acao.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ação</DialogTitle>
          </DialogHeader>
          {selectedAction && (
            <CrmActionDetail 
              action={selectedAction} 
              onClose={() => setShowDetailModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
