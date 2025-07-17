
import React, { useState, useEffect } from 'react';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexFeedbackList } from './VtexFeedbackList';
import { VtexFeedbackForm } from './VtexFeedbackForm';
import { VtexFeedbackHistory } from './VtexFeedbackHistory';
import { Button } from '@/components/ui/button';
import { Plus, Settings, BarChart3, RefreshCw } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const VtexFeedbackTab: React.FC = () => {
  const [oportunidadesVtex, setOportunidadesVtex] = useState<Oportunidade[]>([]);
  const [selectedOportunidade, setSelectedOportunidade] = useState<Oportunidade | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'history'>('list');
  const [isLoadingOportunidades, setIsLoadingOportunidades] = useState(false);
  
  const { fetchOportunidadesVtex, loading, fetchFeedbacks } = useVtexFeedback();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOportunidades();
      fetchFeedbacks();
    }
  }, [user]);

  const loadOportunidades = async () => {
    setIsLoadingOportunidades(true);
    try {
      console.log('Iniciando carregamento de oportunidades VTEX...');
      const oportunidades = await fetchOportunidadesVtex();
      console.log('Oportunidades carregadas:', oportunidades.length);
      setOportunidadesVtex(oportunidades);
    } catch (error) {
      console.error('Erro ao carregar oportunidades:', error);
    } finally {
      setIsLoadingOportunidades(false);
    }
  };

  const handleDarFeedback = (oportunidade: Oportunidade) => {
    setSelectedOportunidade(oportunidade);
    setActiveView('form');
  };

  const handleVerHistorico = (oportunidade: Oportunidade) => {
    setSelectedOportunidade(oportunidade);
    setActiveView('history');
  };

  const handleVoltar = () => {
    setActiveView('list');
    setSelectedOportunidade(null);
  };

  const handleFeedbackSalvo = () => {
    loadOportunidades();
    fetchFeedbacks();
    handleVoltar();
  };

  const handleRefresh = () => {
    loadOportunidades();
    fetchFeedbacks();
  };

  if (loading || isLoadingOportunidades) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados VTEX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Feedback VTEX</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie feedbacks semanais para oportunidades VTEX
          </p>
        </div>
        
        {activeView === 'list' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
              disabled={isLoadingOportunidades}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingOportunidades ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveView('history')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Histórico Geral
            </Button>
            {user?.papel === 'admin' && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar Campos
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Debug: {oportunidadesVtex.length} oportunidades VTEX encontradas | 
            Usuário: {user?.nome || 'N/A'} | 
            Loading: {loading ? 'Sim' : 'Não'}
          </p>
        </div>
      )}

      {/* Content */}
      {activeView === 'list' && (
        <VtexFeedbackList
          oportunidades={oportunidadesVtex}
          onDarFeedback={handleDarFeedback}
          onVerHistorico={handleVerHistorico}
        />
      )}

      {activeView === 'form' && selectedOportunidade && (
        <VtexFeedbackForm
          oportunidade={selectedOportunidade}
          onVoltar={handleVoltar}
          onFeedbackSalvo={handleFeedbackSalvo}
        />
      )}

      {activeView === 'history' && (
        <VtexFeedbackHistory
          oportunidade={selectedOportunidade}
          onVoltar={handleVoltar}
        />
      )}
    </div>
  );
};
