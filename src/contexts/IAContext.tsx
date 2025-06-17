
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { IaSugestao, StatusSugestaoIA } from '@/types/diario';

interface IAContextType {
  // Estados
  iaSugestoes: IaSugestao[];
  loadingIa: boolean;
  
  // Ações
  reviewSugestao: (id: string, conteudoAprovado: string, observacoes?: string) => Promise<void>;
  approveSugestao: (id: string) => Promise<void>;
  rejectSugestao: (id: string, observacoes: string) => Promise<void>;
}

const IAContext = createContext<IAContextType | undefined>(undefined);

interface IAProviderProps {
  children: ReactNode;
}

export const IAProvider: React.FC<IAProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [iaSugestoes, setIaSugestoes] = useState<IaSugestao[]>([]);
  const [loadingIa, setLoadingIa] = useState(false);

  const isAdmin = user?.papel === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadIaSugestoes();
    }
  }, [isAdmin]);

  const loadIaSugestoes = async () => {
    if (!isAdmin) return;
    
    setLoadingIa(true);
    try {
      // Mock data - substituir por chamada real do Supabase
      const mockSugestoes: IaSugestao[] = [
        {
          id: '1',
          tipo_sugestao: 'melhoria_texto',
          titulo: 'Sugestão de melhoria',
          conteudo_original: 'Texto original',
          conteudo_sugerido: 'Texto melhorado pela IA',
          justificativa_ia: 'Melhoria na clareza e objetividade',
          status: 'pendente',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setIaSugestoes(mockSugestoes);
    } catch (error) {
      console.error('Erro ao carregar sugestões da IA:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar sugestões da IA",
        variant: "destructive"
      });
    } finally {
      setLoadingIa(false);
    }
  };

  const reviewSugestao = async (id: string, conteudoAprovado: string, observacoes?: string) => {
    if (!isAdmin) return;
    
    try {
      setIaSugestoes(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          conteudo_aprovado: conteudoAprovado,
          status: 'em_revisao' as StatusSugestaoIA,
          usuario_revisor_id: user?.id,
          data_revisao: new Date().toISOString(),
          observacoes_revisor: observacoes,
          updated_at: new Date().toISOString()
        } : s
      ));
      
      toast({
        title: "Sucesso",
        description: "Sugestão revisada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao revisar sugestão:', error);
      toast({
        title: "Erro",
        description: "Falha ao revisar sugestão",
        variant: "destructive"
      });
    }
  };

  const approveSugestao = async (id: string) => {
    if (!isAdmin) return;
    
    try {
      setIaSugestoes(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          status: 'aprovada' as StatusSugestaoIA,
          usuario_revisor_id: user?.id,
          data_revisao: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : s
      ));
      
      toast({
        title: "Sucesso",
        description: "Sugestão aprovada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao aprovar sugestão:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar sugestão",
        variant: "destructive"
      });
    }
  };

  const rejectSugestao = async (id: string, observacoes: string) => {
    if (!isAdmin) return;
    
    try {
      setIaSugestoes(prev => prev.map(s => 
        s.id === id ? { 
          ...s, 
          status: 'rejeitada' as StatusSugestaoIA,
          usuario_revisor_id: user?.id,
          data_revisao: new Date().toISOString(),
          observacoes_revisor: observacoes,
          updated_at: new Date().toISOString()
        } : s
      ));
      
      toast({
        title: "Sucesso",
        description: "Sugestão rejeitada"
      });
    } catch (error) {
      console.error('Erro ao rejeitar sugestão:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar sugestão",
        variant: "destructive"
      });
    }
  };

  const value: IAContextType = {
    iaSugestoes,
    loadingIa,
    reviewSugestao,
    approveSugestao,
    rejectSugestao
  };

  return (
    <IAContext.Provider value={value}>
      {children}
    </IAContext.Provider>
  );
};

export const useIA = () => {
  const context = useContext(IAContext);
  if (context === undefined) {
    throw new Error('useIA deve ser usado dentro de um IAProvider');
  }
  return context;
};
