
import React, { useState, useEffect } from 'react';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexFeedbackList } from './VtexFeedbackList';
import { VtexFeedbackForm } from './VtexFeedbackForm';
import { VtexFeedbackHistory } from './VtexFeedbackHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Settings, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const VtexFeedbackTab: React.FC = () => {
  const [oportunidadesVtex, setOportunidadesVtex] = useState<Oportunidade[]>([]);
  const [selectedOportunidade, setSelectedOportunidade] = useState<Oportunidade | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'history'>('list');
  const [isLoadingOportunidades, setIsLoadingOportunidades] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    totalOportunidades: number;
    vtexOportunidades: number;
    totalFeedbacks: number;
  }>({ totalOportunidades: 0, vtexOportunidades: 0, totalFeedbacks: 0 });
  
  const { fetchOportunidadesVtex, loading, fetchFeedbacks, feedbacks, getEstatisticasFeedback } = useVtexFeedback();
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
      
      // Atualizar debug info
      setDebugInfo(prev => ({
        ...prev,
        vtexOportunidades: oportunidades.length
      }));
    } catch (error) {
      console.error('Erro ao carregar oportunidades:', error);
    } finally {
      setIsLoadingOportunidades(false);
    }
  };

  useEffect(() => {
    // Atualizar estatísticas quando feedbacks mudarem
    setDebugInfo(prev => ({
      ...prev,
      totalFeedbacks: feedbacks.length
    }));
  }, [feedbacks]);

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

  const stats = getEstatisticasFeedback(oportunidadesVtex);

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

      {/* Status de Controle */}
      {activeView === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status de Controle VTEX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Oportunidades VTEX:</span>
                <span className="ml-2 font-semibold">{debugInfo.vtexOportunidades}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Feedbacks:</span>
                <span className="ml-2 font-semibold">{debugInfo.totalFeedbacks}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Compliance:</span>
                <span className="ml-2 font-semibold">
                  {stats.total > 0 ? Math.round((stats.em_dia / stats.total) * 100) : 0}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Pendentes:</span>
                <span className="ml-2 font-semibold text-red-500">
                  {stats.atrasado + stats.nunca_enviado}
                </span>
              </div>
            </div>
            
            {stats.atrasado + stats.nunca_enviado > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">
                  Existem {stats.atrasado + stats.nunca_enviado} oportunidades que precisam de feedback!
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug Info - Apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && activeView === 'list' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Debug Info:</strong> {debugInfo.vtexOportunidades} oportunidades VTEX | 
              {debugInfo.totalFeedbacks} feedbacks | 
              Usuário: {user?.nome || 'N/A'} | 
              Loading: {loading ? 'Sim' : 'Não'}
            </p>
          </CardContent>
        </Card>
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
