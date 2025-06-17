import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Clock, MapPin, Users } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { TipoEventoAgenda, StatusEvento } from '@/types/diario';

const getTipoEventoBadge = (tipo: TipoEventoAgenda) => {
  const variants = {
    reuniao: 'default',
    call: 'secondary',
    apresentacao: 'outline',
    follow_up: 'destructive',
    outro: 'secondary'
  } as const;

  return <Badge variant={variants[tipo] || 'default'}>{tipo}</Badge>;
};

const getStatusEventoBadge = (status: StatusEvento) => {
  const variants = {
    agendado: 'default',
    realizado: 'secondary',
    cancelado: 'destructive',
    reagendado: 'outline'
  } as const;

  const colors = {
    agendado: 'bg-blue-100 text-blue-800',
    realizado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
    reagendado: 'bg-yellow-100 text-yellow-800'
  };

  return (
    <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  );
};

export const AgendaEventList: React.FC = () => {
  const { agendaEventos, loadingEventos, updateEvento, deleteEvento } = useAgenda();

  if (loadingEventos) {
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

  if (agendaEventos.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Nenhum evento hoje</h3>
        <p className="text-muted-foreground">Adicione um novo evento para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {agendaEventos.map((evento) => (
        <Card key={evento.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{evento.titulo}</h4>
                  {getTipoEventoBadge(evento.tipo)}
                  {getStatusEventoBadge(evento.status)}
                </div>
                
                {evento.descricao && (
                  <p className="text-muted-foreground mb-3">{evento.descricao}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(evento.data_inicio).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - {new Date(evento.data_fim).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  
                  {evento.parceiro && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {evento.parceiro.nome}
                    </div>
                  )}
                  
                  {evento.fonte_integracao !== 'manual' && (
                    <Badge variant="outline" className="text-xs">
                      {evento.fonte_integracao}
                    </Badge>
                  )}
                </div>
                
                {evento.observacoes && (
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    <strong>Observações:</strong> {evento.observacoes}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implementar edição
                    console.log('Editar evento:', evento.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Deseja excluir este evento?')) {
                      deleteEvento(evento.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
