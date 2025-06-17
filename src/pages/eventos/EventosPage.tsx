
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EventosProvider } from '@/contexts/EventosContext';
import { EventosTabs } from '@/components/eventos/EventosTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const EventosPage: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.papel !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar o módulo de Eventos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <EventosProvider>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Eventos & Networking</h1>
          <p className="text-gray-600 mt-2">
            Gerencie eventos e colete contatos em feiras, conferências e networking
          </p>
        </div>
        
        <EventosTabs />
      </div>
    </EventosProvider>
  );
};

export default EventosPage;
