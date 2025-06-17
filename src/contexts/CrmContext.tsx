
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CrmService } from '@/services/CrmService';
import type { CrmAcao } from '@/types/diario';

interface CrmContextType {
  // Estados
  crmAcoes: CrmAcao[];
  loadingAcoes: boolean;
  
  // Ações
  createAcaoCrm: (acao: Partial<CrmAcao>) => Promise<void>;
  updateAcaoCrm: (id: string, acao: Partial<CrmAcao>) => Promise<void>;
  deleteAcaoCrm: (id: string) => Promise<void>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

interface CrmProviderProps {
  children: ReactNode;
}

export const CrmProvider: React.FC<CrmProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [crmAcoes, setCrmAcoes] = useState<CrmAcao[]>([]);
  const [loadingAcoes, setLoadingAcoes] = useState(false);

  const isAdmin = user?.papel === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadCrmAcoes();
    }
  }, [isAdmin]);

  const loadCrmAcoes = async () => {
    if (!isAdmin) return;
    
    setLoadingAcoes(true);
    try {
      const acoes = await CrmService.loadAcoes();
      setCrmAcoes(acoes);
    } catch (error) {
      console.error('Erro ao carregar ações do CRM:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar ações do CRM",
        variant: "destructive"
      });
    } finally {
      setLoadingAcoes(false);
    }
  };

  const createAcaoCrm = async (acao: Partial<CrmAcao>) => {
    if (!isAdmin || !user) return;
    
    const validation = CrmService.validateAcao(acao);
    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }
    
    try {
      const novaAcao = await CrmService.createAcao(acao, user.id);
      if (novaAcao) {
        setCrmAcoes(prev => [novaAcao, ...prev]);
        toast({
          title: "Sucesso",
          description: "Ação do CRM criada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao criar ação do CRM:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar ação do CRM",
        variant: "destructive"
      });
    }
  };

  const updateAcaoCrm = async (id: string, acao: Partial<CrmAcao>) => {
    if (!isAdmin) return;
    
    try {
      const success = await CrmService.updateAcao(id, acao);
      if (success) {
        setCrmAcoes(prev => prev.map(a => 
          a.id === id ? { ...a, ...acao, updated_at: new Date().toISOString() } : a
        ));
        
        toast({
          title: "Sucesso",
          description: "Ação do CRM atualizada com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar ação do CRM:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar ação do CRM",
        variant: "destructive"
      });
    }
  };

  const deleteAcaoCrm = async (id: string) => {
    if (!isAdmin) return;
    
    try {
      const success = await CrmService.deleteAcao(id);
      if (success) {
        setCrmAcoes(prev => prev.filter(a => a.id !== id));
        
        toast({
          title: "Sucesso",
          description: "Ação do CRM excluída com sucesso"
        });
      }
    } catch (error) {
      console.error('Erro ao excluir ação do CRM:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir ação do CRM",
        variant: "destructive"
      });
    }
  };

  const value: CrmContextType = {
    crmAcoes,
    loadingAcoes,
    createAcaoCrm,
    updateAcaoCrm,
    deleteAcaoCrm
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm deve ser usado dentro de um CrmProvider');
  }
  return context;
};
