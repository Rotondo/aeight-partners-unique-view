
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, RefreshCw, Settings } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { AgendaEventList } from './AgendaEventList';
import { AgendaSyncOutlook } from './AgendaSyncOutlook';
import { AgendaSyncGoogle } from './AgendaSyncGoogle';
import { DatePicker } from '@/components/ui/date-picker';

export const AgendaView: React.FC = () => {
  const { selectedDate, setSelectedDate, agendaEventos, loadingEventos, syncGoogleCalendar, syncOutlookCalendar } = useAgenda();
  const [showSyncOptions, setShowSyncOptions] = useState(false);

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
          
          <Button size="sm">
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
              {agendaEventos.filter(e => e.status === 'realizado').length}
            </div>
            <p className="text-center text-muted-foreground">Realizados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-center text-blue-600">
              {agendaEventos.filter(e => e.status === 'agendado').length}
            </div>
            <p className="text-center text-muted-foreground">Agendados</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
