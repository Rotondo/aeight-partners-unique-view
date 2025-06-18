
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContatoFormRapido } from './ContatoFormRapido';
import { ContatoFormAvancado } from './ContatoFormAvancado';
import { ContatosList } from './ContatosList';
import { EventoAnalytics } from './EventoAnalytics';
import { ContatosExport } from './ContatosExport';
import { useEventos } from '@/contexts/EventosContext';
import { Calendar, MapPin, Users, Plus, Camera, BarChart3, Settings } from 'lucide-react';

export const EventoAtivo: React.FC = () => {
  const { eventoAtivo } = useEventos();
  const [showContatoRapido, setShowContatoRapido] = useState(false);
  const [showContatoAvancado, setShowContatoAvancado] = useState(false);

  if (!eventoAtivo) return null;

  return (
    <div className="space-y-6">
      {/* Header do Evento Ativo */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-green-800">
                {eventoAtivo.nome}
              </CardTitle>
              <CardDescription className="text-green-700 mt-1">
                Evento ativo para coleta de contatos
              </CardDescription>
            </div>
            <Badge variant="default" className="bg-green-600">
              Ativo
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-green-700">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(eventoAtivo.data_inicio).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {eventoAtivo.local && (
              <div className="flex items-center gap-2 text-green-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{eventoAtivo.local}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-green-700">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                {eventoAtivo.total_contatos} contatos coletados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          size="lg"
          className="h-20 text-lg"
          onClick={() => setShowContatoRapido(true)}
        >
          <Plus className="h-6 w-6 mr-3" />
          Contato Rápido
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="h-20 text-lg"
          onClick={() => setShowContatoAvancado(true)}
        >
          <Settings className="h-6 w-6 mr-3" />
          Contato Completo
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="h-20 text-lg"
          onClick={() => {
            // TODO: Implementar captura de cartão
            alert('Funcionalidade de captura de cartão será implementada');
          }}
        >
          <Camera className="h-6 w-6 mr-3" />
          Fotografar Cartão
        </Button>
      </div>

      {/* Tabs com Conteúdo */}
      <Tabs defaultValue="contatos" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="contatos" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <ContatosExport 
            contatos={eventoAtivo.contatos} 
            eventoNome={eventoAtivo.nome}
          />
        </div>

        <TabsContent value="contatos">
          <ContatosList contatos={eventoAtivo.contatos} />
        </TabsContent>

        <TabsContent value="analytics">
          <EventoAnalytics evento={eventoAtivo} />
        </TabsContent>
      </Tabs>

      {/* Modais */}
      <ContatoFormRapido
        open={showContatoRapido}
        onClose={() => setShowContatoRapido(false)}
      />

      <ContatoFormAvancado
        open={showContatoAvancado}
        onClose={() => setShowContatoAvancado(false)}
      />
    </div>
  );
};
