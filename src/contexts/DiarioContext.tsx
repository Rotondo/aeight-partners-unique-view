
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AgendaProvider } from './AgendaContext';
import { CrmProvider } from './CrmContext';
import { ResumoProvider } from './ResumoContext';
import { IAProvider } from './IAContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DiarioContextType {
  currentView: 'agenda' | 'crm' | 'resumo' | 'ia';
  setCurrentView: (view: 'agenda' | 'crm' | 'resumo' | 'ia') => void;
}

const DiarioContext = createContext<DiarioContextType | undefined>(undefined);

interface DiarioProviderProps {
  children: ReactNode;
}

export const DiarioProvider: React.FC<DiarioProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'agenda' | 'crm' | 'resumo' | 'ia'>('agenda');

  // Verificar se usuário é admin
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

  const value: DiarioContextType = {
    currentView,
    setCurrentView
  };

  return (
    <DiarioContext.Provider value={value}>
      <AgendaProvider>
        <CrmProvider>
          <ResumoProvider>
            <IAProvider>
              {children}
            </IAProvider>
          </ResumoProvider>
        </CrmProvider>
      </AgendaProvider>
    </DiarioContext.Provider>
  );
};

export const useDiario = () => {
  const context = useContext(DiarioContext);
  if (context === undefined) {
    throw new Error('useDiario deve ser usado dentro de um DiarioProvider');
  }
  return context;
};
