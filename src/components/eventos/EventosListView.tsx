
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Users, Play, Edit } from 'lucide-react';
import { useEventos } from '@/contexts/EventosContext';
import { EventoFormModal } from './EventoFormModal';
import { EventoDeleteConfirm } from './EventoDeleteConfirm';
import { EventoLoadingSkeleton } from './EventoLoadingSkeleton';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventosListView: React.FC = () => {
  const { eventos, loading, setEventoAtivo, deleteEvento } = useEventos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);
  const [deletingEventoId, setDeletingEventoId] = useState<string | null>(null);
  const [activatingEventoId, setActivatingEventoId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      'planejado': 'default',
      'em_andamento': 'default',
      'finalizado': 'secondary',
      'cancelado': 'destructive'
    } as const;

    const labels = {
      'planejado': 'Planejado',
      'em_andamento': 'Em Andamento', 
      'finalizado': 'Finalizado',
      'cancelado': 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleStartEvent = async (evento: any) => {
    try {
      setActivatingEventoId(evento.id);
      
      // Definir o evento como ativo
      setEventoAtivo(evento);
      
      // Navegar para a aba de coleta de contatos
      const tabsTriggers = document.querySelectorAll('[data-value="coleta"]');
      if (tabsTriggers.length > 0) {
        (tabsTriggers[0] as HTMLElement).click();
      }
      
      toast({
        title: "Evento ativado",
        description: `"${evento.nome}" está agora ativo para coleta de contatos. Você foi redirecionado para a aba de coleta.`
      });
    } catch (error) {
      toast({
        title: "Erro ao ativar evento",
        description: "Ocorreu um erro ao ativar o evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setActivatingEventoId(null);
    }
  };

  const handleDeleteEvent = async (eventoId: string) => {
    try {
      setDeletingEventoId(eventoId);
      await deleteEvento(eventoId);
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o evento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeletingEventoId(null);
    }
  };

  if (loading) {
    return <EventoLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seus Eventos</h2>
          <p className="text-gray-600">
            {eventos.length} eventos cadastrados
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {eventos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum evento cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro evento para começar a coletar contatos
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {evento.nome}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {formatDistanceToNow(new Date(evento.data_inicio), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    {getStatusBadge(evento.status)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                      {evento.data_fim && ` - ${new Date(evento.data_fim).toLocaleDateString('pt-BR')}`}
                    </span>
                  </div>
                  
                  {evento.local && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{evento.local}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{evento.total_contatos} contatos coletados</span>
                  </div>
                </div>

                {evento.descricao && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {evento.descricao}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStartEvent(evento)}
                    className="flex-1"
                    disabled={activatingEventoId === evento.id}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {activatingEventoId === evento.id ? 'Ativando...' : 'Ativar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEvento(evento)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <EventoDeleteConfirm
                    evento={evento}
                    onConfirm={handleDeleteEvent}
                    loading={deletingEventoId === evento.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EventoFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EventoFormModal
        open={!!editingEvento}
        onClose={() => setEditingEvento(null)}
        evento={editingEvento}
      />
    </div>
  );
};
