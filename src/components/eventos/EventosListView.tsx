
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Users, Play, Edit } from 'lucide-react';
import { useEventos } from '@/contexts/EventosContext';
import { EventoFormModal } from './EventoFormModal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventosListView: React.FC = () => {
  const { eventos, loading, setEventoAtivo } = useEventos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);

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

  const handleStartEvent = (evento: any) => {
    setEventoAtivo(evento);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ativar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEvento(evento)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
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
