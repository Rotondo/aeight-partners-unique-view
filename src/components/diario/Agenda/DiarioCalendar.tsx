
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Calendar, Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { AgendaEvento } from '@/types/diario';
import { AgendaEventForm } from './AgendaEventForm';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DiarioCalendar: React.FC = () => {
  const { agendaEventos, selectedDate, setSelectedDate } = useAgenda();
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showEventForm, setShowEventForm] = useState(false);

  // CORREÇÃO: Debug da agenda para identificar problemas
  console.log('[DiarioCalendar] Eventos carregados:', agendaEventos.length);
  console.log('[DiarioCalendar] Data selecionada:', selectedDate);
  console.log('[DiarioCalendar] Eventos detalhados:', agendaEventos.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start,
    status: e.status,
    date: new Date(e.start).toLocaleDateString('pt-BR')
  })));

  const getEventTypeColor = (tipo?: string) => {
    switch (tipo) {
      case 'proximo_passo_crm': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'reuniao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'call': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'scheduled': return '📅';
      case 'canceled': return '❌';
      default: return '⏳';
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { locale: ptBR });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getEventsForDate = (date: Date) => {
    const eventos = agendaEventos.filter(evento => {
      const eventoDate = new Date(evento.start);
      const isSame = isSameDay(eventoDate, date);
      
      // Debug para identificar problemas
      if (isSame) {
        console.log('[DiarioCalendar] Evento encontrado para data:', {
          date: format(date, 'dd/MM/yyyy'),
          evento: evento.title,
          start: evento.start,
          status: evento.status
        });
      }
      
      return isSame;
    });
    
    console.log(`[DiarioCalendar] Eventos para ${format(date, 'dd/MM/yyyy')}:`, eventos.length);
    return eventos;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setSelectedDate(addDays(selectedDate, days));
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 1 : -1;
    setSelectedDate(addDays(selectedDate, days));
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-colors min-h-[120px] ${
                isSelected ? 'border-primary bg-primary/5' : 
                isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="font-medium text-sm mb-2">
                {format(day, 'EEE dd', { locale: ptBR })}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((evento) => (
                  <div 
                    key={evento.id}
                    className={`text-xs p-1 rounded border ${getEventTypeColor(evento.event_type)}`}
                    title={`${evento.title} - ${evento.status}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{getStatusIcon(evento.status)}</span>
                      <span className="truncate">{evento.title}</span>
                    </div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
                
                {dayEvents.length === 0 && (
                  <div className="text-xs text-gray-400 italic">
                    Sem eventos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(selectedDate);
    
    console.log('[DiarioCalendar] Renderizando dia:', {
      date: format(selectedDate, 'dd/MM/yyyy'),
      events: dayEvents.length
    });
    
    return (
      <div className="space-y-3">
        {dayEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento para {format(selectedDate, 'dd/MM/yyyy')}</p>
            <p className="text-sm text-gray-500 mt-2">
              Total de eventos no sistema: {agendaEventos.length}
            </p>
          </div>
        ) : (
          dayEvents.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getStatusIcon(evento.status)}</span>
                      <h4 className="font-semibold">{evento.title}</h4>
                      <Badge className={getEventTypeColor(evento.event_type)}>
                        {evento.event_type?.replace('_', ' ') || 'evento'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {evento.status}
                      </Badge>
                    </div>
                    
                    {evento.description && (
                      <p className="text-muted-foreground text-sm mb-2">
                        {evento.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(evento.start), 'HH:mm')} - {format(new Date(evento.end), 'HH:mm')}
                      </div>
                      
                      {evento.parceiro && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {evento.parceiro.nome}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário do Diário
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })} - {agendaEventos.length} eventos total
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
                className="border border-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex border rounded-lg border-gray-300">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Semana
                </Button>
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Dia
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
                className="border border-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Button size="sm" onClick={() => setShowEventForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Novo Evento
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {viewMode === 'week' ? renderWeekView() : renderDayView()}
        </CardContent>
      </Card>

      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent className="max-w-2xl p-0 bg-white border border-gray-300">
          <AgendaEventForm
            onClose={() => setShowEventForm(false)}
            onSuccess={() => setShowEventForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
