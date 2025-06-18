
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventosListView } from './EventosListView';
import { EventoAtivo } from './EventoAtivo';
import { ContatosColetados } from './ContatosColetados';
import { useEventos } from '@/contexts/EventosContext';
import { Calendar, Users, ContactIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
          data-value="coleta"
        >
          <ContactIcon className="h-4 w-4" />
          Coleta de Contatos
          {eventoAtivo && (
            <Badge variant="default" className="ml-2 bg-green-600">
              Ativo
            </Badge>
          )}
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
        <EventoAtivo />
      </TabsContent>

      <TabsContent value="contatos">
        <ContatosColetados />
      </TabsContent>
    </Tabs>
  );
};
