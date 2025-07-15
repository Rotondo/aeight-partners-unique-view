
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DiarioProvider } from '@/contexts/DiarioContext';
import { DiarioTabs } from '@/components/diario/DiarioTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const DiarioPage: React.FC = () => {
  const { user } = useAuth();

  // Verificar se o usuário é admin
  if (!user || user.papel !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Acesso negado.</strong> Você não tem permissão para acessar este recurso. Em caso de dúvida, contate o administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <DiarioProvider>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Diário Executivo</h1>
          <p className="text-gray-600 mt-2">
            Gestão completa de agenda, CRM, resumos e sugestões de IA
          </p>
        </div>
        
        <DiarioTabs />
      </div>
    </DiarioProvider>
  );
};

export default DiarioPage;
