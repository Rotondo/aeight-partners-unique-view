
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventosListView } from './EventosListView';
import { EventoAtivo } from './EventoAtivo';
import { ContatosColetados } from './ContatosColetados';
import { useEventos } from '@/contexts/EventosContext';
import { Calendar, Users, ContactIcon } from 'lucide-react';

export const EventosTabs: React.FC = () => {
  const { eventoAtivo } = useEventos();

  return (
    <Tabs defaultValue="eventos" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="eventos" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Eventos
        </TabsTrigger>
        <TabsTrigger 
          value="coleta" 
          className="flex items-center gap-2"
          disabled={!eventoAtivo}
        >
          <ContactIcon className="h-4 w-4" />
          Coleta de Contatos
        </TabsTrigger>
        <TabsTrigger value="contatos" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Contatos Coletados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="eventos">
        <EventosListView />
      </TabsContent>

      <TabsContent value="coleta">
        {eventoAtivo ? (
          <EventoAtivo />
        ) : (
          <div className="text-center py-12">
            <ContactIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum evento ativo
            </h3>
            <p className="text-gray-600">
              Selecione um evento na aba "Eventos" para iniciar a coleta de contatos
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="contatos">
        <ContatosColetados />
      </TabsContent>
    </Tabs>
  );
};
