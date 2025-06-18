
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CrmService } from '@/services/CrmService';
import { CrmAcao } from '@/types/diario';

interface CrmContextType {
  crmAcoes: CrmAcao[];
  loadingAcoes: boolean;
  createAcaoCrm: (acao: Partial<CrmAcao>) => Promise<void>;
  updateAcaoCrm: (id: string, updates: Partial<CrmAcao>) => Promise<void>;
  deleteAcaoCrm: (id: string) => Promise<void>;
  refreshAcoes: () => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};

interface CrmProviderProps {
  children: ReactNode;
}

export const CrmProvider: React.FC<CrmProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [crmAcoes, setCrmAcoes] = useState<CrmAcao[]>([]);
  const [loadingAcoes, setLoadingAcoes] = useState(true);

  const loadAcoes = async () => {
    try {
      setLoadingAcoes(true);
      const acoes = await CrmService.loadAcoes();
      setCrmAcoes(acoes);
    } catch (error) {
      console.error('Erro ao carregar ações:', error);
    } finally {
      setLoadingAcoes(false);
    }
  };

  const createAcaoCrm = async (acao: Partial<CrmAcao>) => {
    if (!user) return;
    
    try {
      const validation = CrmService.validateAcao(acao);
      if (!validation.isValid) {
        console.error('Ação inválida:', validation.errors);
        return;
      }

      await CrmService.createAcao(acao, user.id);
      await loadAcoes();
    } catch (error) {
      console.error('Erro ao criar ação:', error);
      throw error;
    }
  };

  const updateAcaoCrm = async (id: string, updates: Partial<CrmAcao>) => {
    try {
      await CrmService.updateAcao(id, updates);
      await loadAcoes();
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      throw error;
    }
  };

  const deleteAcaoCrm = async (id: string) => {
    try {
      await CrmService.deleteAcao(id);
      await loadAcoes();
    } catch (error) {
      console.error('Erro ao deletar ação:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadAcoes();
  }, []);

  return (
    <CrmContext.Provider
      value={{
        crmAcoes,
        loadingAcoes,
        createAcaoCrm,
        updateAcaoCrm,
        deleteAcaoCrm,
        refreshAcoes: loadAcoes
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};
