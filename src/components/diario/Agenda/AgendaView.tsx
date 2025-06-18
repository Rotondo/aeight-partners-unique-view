
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { DiarioCalendar } from './DiarioCalendar';

export const AgendaView: React.FC = () => {
  const { agendaEventos } = useAgenda();

  const eventosHoje = agendaEventos.filter(evento => {
    const hoje = new Date();
    const eventoData = new Date(evento.data_inicio);
    return hoje.toDateString() === eventoData.toDateString();
  });

  const eventosRealizados = agendaEventos.filter(e => e.status === 'realizado');
  const eventosAgendados = agendaEventos.filter(e => e.status === 'agendado');
  const proximosPassos = agendaEventos.filter(e => e.tipo === 'proximo_passo_crm');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Agenda do Diário</h2>
          <p className="text-muted-foreground">
            Gerencie seus eventos, próximos passos e atividades
          </p>
        </div>
      </div>

      {/* Calendário Principal */}
      <DiarioCalendar />

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">{eventosHoje.length}</div>
            <p className="text-center text-muted-foreground">Eventos Hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">
              {eventosRealizados.length}
            </div>
            <p className="text-center text-muted-foreground">Realizados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {eventosAgendados.length}
            </div>
            <p className="text-center text-muted-foreground">Agendados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-orange-600">
              {proximosPassos.length}
            </div>
            <p className="text-center text-muted-foreground">Próximos Passos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
