
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { DiarioResumo, TipoResumo } from '@/types/diario';

interface ResumoContextType {
  // Estados
  resumos: DiarioResumo[];
  loadingResumos: boolean;
  
  // Ações
  generateResumo: (tipo: TipoResumo, inicio: string, fim: string) => Promise<void>;
  exportResumoToPdf: (resumoId: string) => Promise<void>;
  exportResumoToCsv: (resumoId: string) => Promise<void>;
}

const ResumoContext = createContext<ResumoContextType | undefined>(undefined);

interface ResumoProviderProps {
  children: ReactNode;
}

export const ResumoProvider: React.FC<ResumoProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [resumos, setResumos] = useState<DiarioResumo[]>([]);
  const [loadingResumos, setLoadingResumos] = useState(false);

  const isAdmin = user?.papel === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadResumos();
    }
  }, [isAdmin]);

  const loadResumos = async () => {
    if (!isAdmin) return;
    
    setLoadingResumos(true);
    try {
      // Mock data - substituir por chamada real do Supabase
      const mockResumos: DiarioResumo[] = [
        {
          id: '1',
          tipo: 'semanal',
          periodo_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          periodo_fim: new Date().toISOString(),
          titulo: 'Resumo Semanal',
          conteudo_resumo: 'Semana produtiva com várias reuniões',
          total_eventos: 5,
          total_acoes_crm: 3,
          total_parceiros_envolvidos: 2,
          principais_realizacoes: ['Reunião de alinhamento', 'Apresentação de proposta'],
          proximos_passos: ['Follow-up com cliente', 'Preparar relatório'],
          usuario_gerador_id: user?.id || '',
          created_at: new Date().toISOString()
        }
      ];
      
      setResumos(mockResumos);
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar resumos",
        variant: "destructive"
      });
    } finally {
      setLoadingResumos(false);
    }
  };

  const generateResumo = async (tipo: TipoResumo, inicio: string, fim: string) => {
    if (!isAdmin) return;
    
    try {
      toast({
        title: "Gerando Resumo",
        description: "Processando dados para gerar o resumo..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const novoResumo: DiarioResumo = {
        id: Date.now().toString(),
        tipo,
        periodo_inicio: inicio,
        periodo_fim: fim,
        titulo: `Resumo ${tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
        conteudo_resumo: 'Resumo gerado automaticamente',
        total_eventos: 5,
        total_acoes_crm: 3,
        total_parceiros_envolvidos: 5,
        principais_realizacoes: ['Reuniões realizadas', 'Propostas enviadas'],
        proximos_passos: ['Acompanhar propostas', 'Agendar follow-ups'],
        usuario_gerador_id: user?.id || '',
        created_at: new Date().toISOString()
      };
      
      setResumos(prev => [novoResumo, ...prev]);
      toast({
        title: "Sucesso",
        description: "Resumo gerado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar resumo",
        variant: "destructive"
      });
    }
  };

  const exportResumoToPdf = async (resumoId: string) => {
    if (!isAdmin) return;
    
    try {
      toast({
        title: "Exportando",
        description: "Gerando arquivo PDF..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Sucesso",
        description: "PDF exportado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar PDF",
        variant: "destructive"
      });
    }
  };

  const exportResumoToCsv = async (resumoId: string) => {
    if (!isAdmin) return;
    
    try {
      toast({
        title: "Exportando",
        description: "Gerando arquivo CSV..."
      });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Sucesso",
        description: "CSV exportado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar CSV",
        variant: "destructive"
      });
    }
  };

  const value: ResumoContextType = {
    resumos,
    loadingResumos,
    generateResumo,
    exportResumoToPdf,
    exportResumoToCsv
  };

  return (
    <ResumoContext.Provider value={value}>
      {children}
    </ResumoContext.Provider>
  );
};

export const useResumo = () => {
  const context = useContext(ResumoContext);
  if (context === undefined) {
    throw new Error('useResumo deve ser usado dentro de um ResumoProvider');
  }
  return context;
};
