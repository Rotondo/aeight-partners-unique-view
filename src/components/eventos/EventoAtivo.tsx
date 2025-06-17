
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContatoFormRapido } from './ContatoFormRapido';
import { ContatosList } from './ContatosList';
import { useEventos } from '@/contexts/EventosContext';
import { Calendar, MapPin, Users, Plus, Camera } from 'lucide-react';

export const EventoAtivo: React.FC = () => {
  const { eventoAtivo } = useEventos();
  const [showContatoForm, setShowContatoForm] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          size="lg"
          className="h-20 text-lg"
          onClick={() => setShowContatoForm(true)}
        >
          <Plus className="h-6 w-6 mr-3" />
          Adicionar Contato
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="h-20 text-lg"
          onClick={() => {
            // Implementar captura de cartão
            alert('Funcionalidade de captura de cartão será implementada');
          }}
        >
          <Camera className="h-6 w-6 mr-3" />
          Fotografar Cartão
        </Button>
      </div>

      {/* Contatos do Evento */}
      <ContatosList contatos={eventoAtivo.contatos} />

      {/* Modal de Contato Rápido */}
      <ContatoFormRapido
        open={showContatoForm}
        onClose={() => setShowContatoForm(false)}
      />
    </div>
  );
};
