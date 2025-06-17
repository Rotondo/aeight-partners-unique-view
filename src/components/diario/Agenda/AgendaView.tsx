
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, RefreshCw, Settings } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { AgendaEventList } from './AgendaEventList';
import { AgendaSyncOutlook } from './AgendaSyncOutlook';
import { AgendaSyncGoogle } from './AgendaSyncGoogle';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const AgendaView: React.FC = () => {
  const { selectedDate, setSelectedDate, agendaEventos, loadingEventos, fetchEventos } = useAgenda();
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: '',
    end: ''
  });

  const handleCreateEvent = async () => {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .insert({
          title: newEvent.title,
          description: newEvent.description,
          start: new Date(newEvent.start).toISOString(),
          end: new Date(newEvent.end).toISOString(),
          source: 'manual',
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Evento criado com sucesso!'
      });

      setShowNewEventModal(false);
      setNewEvent({ title: '', description: '', start: '', end: '' });
      fetchEventos();
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar evento',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Agenda</h2>
            <p className="text-muted-foreground">
              Gerencie seus eventos e integrações com calendários externos
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DatePicker
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSyncOptions(!showSyncOptions)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          
          <Button size="sm" onClick={() => setShowNewEventModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Opções de sincronização */}
      {showSyncOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sincronização de Calendários</CardTitle>
            <CardDescription>
              Sincronize seus eventos com Google Calendar e Outlook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AgendaSyncGoogle />
              <AgendaSyncOutlook />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de eventos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Eventos do Dia</CardTitle>
              <CardDescription>
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            
            {loadingEventos && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <AgendaEventList />
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center">{agendaEventos.length}</div>
            <p className="text-center text-muted-foreground">Eventos Hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-green-600">
              {agendaEventos.filter(e => e.status === 'completed').length}
            </div>
            <p className="text-center text-muted-foreground">Realizados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {agendaEventos.filter(e => e.status === 'scheduled').length}
            </div>
            <p className="text-center text-muted-foreground">Agendados</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal Novo Evento */}
      <Dialog open={showNewEventModal} onOpenChange={setShowNewEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Título</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="Digite o título do evento"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Descrição</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                placeholder="Descrição do evento (opcional)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Início</label>
                <Input
                  type="datetime-local"
                  value={newEvent.start}
                  onChange={(e) => setNewEvent({...newEvent, start: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Fim</label>
                <Input
                  type="datetime-local"
                  value={newEvent.end}
                  onChange={(e) => setNewEvent({...newEvent, end: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewEventModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateEvent}
                disabled={!newEvent.title || !newEvent.start || !newEvent.end}
              >
                Criar Evento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
