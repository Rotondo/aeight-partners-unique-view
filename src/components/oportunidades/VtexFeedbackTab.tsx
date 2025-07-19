
import React, { useState, useEffect } from 'react';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexFeedbackList } from './VtexFeedbackList';
import { VtexFeedbackForm } from './VtexFeedbackForm';
import { VtexFeedbackHistory } from './VtexFeedbackHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Settings, BarChart3, RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export const VtexFeedbackTab: React.FC = () => {
  const [oportunidadesVtex, setOportunidadesVtex] = useState<Oportunidade[]>([]);
  const [selectedOportunidade, setSelectedOportunidade] = useState<Oportunidade | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'history'>('list');
  const [isLoadingOportunidades, setIsLoadingOportunidades] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    totalOportunidades: number;
    vtexOportunidades: number;
    totalFeedbacks: number;
    isOnline: boolean;
    lastSync: Date | null;
  }>({ 
    totalOportunidades: 0, 
    vtexOportunidades: 0, 
    totalFeedbacks: 0,
    isOnline: navigator.onLine,
    lastSync: null
  });
  
  const { fetchOportunidadesVtex, loading, fetchFeedbacks, feedbacks, getEstatisticasFeedback } = useVtexFeedback();
  const { user } = useAuth();

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      console.log('[VTEX] Conectado à internet');
      setDebugInfo(prev => ({ ...prev, isOnline: true }));
    };
    
    const handleOffline = () => {
      console.log('[VTEX] Desconectado da internet');
      setDebugInfo(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      console.log('[VTEX] Usuário autenticado, carregando dados...', user.nome);
      loadOportunidades();
      fetchFeedbacks();
    } else {
      console.log('[VTEX] Usuário não autenticado');
      setError('Usuário não autenticado');
    }
  }, [user]);

  const loadOportunidades = async () => {
    setIsLoadingOportunidades(true);
    setError(null);
    
    try {
      console.log('[VTEX] Iniciando carregamento de oportunidades VTEX...');
      const oportunidades = await fetchOportunidadesVtex();
      console.log('[VTEX] Oportunidades carregadas:', oportunidades.length);
      
      setOportunidadesVtex(oportunidades);
      
      // Atualizar debug info
      setDebugInfo(prev => ({
        ...prev,
        vtexOportunidades: oportunidades.length,
        lastSync: new Date()
      }));
      
      if (oportunidades.length === 0) {
        setError('Nenhuma oportunidade VTEX encontrada. Verifique se existem oportunidades ativas com empresas relacionadas à VTEX.');
      }
    } catch (error) {
      console.error('[VTEX] Erro ao carregar oportunidades:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar oportunidades');
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
    console.log('[VTEX] Iniciando feedback para oportunidade:', oportunidade.id);
    setSelectedOportunidade(oportunidade);
    setActiveView('form');
  };

  const handleVerHistorico = (oportunidade: Oportunidade) => {
    console.log('[VTEX] Visualizando histórico da oportunidade:', oportunidade.id);
    setSelectedOportunidade(oportunidade);
    setActiveView('history');
  };

  const handleVoltar = () => {
    console.log('[VTEX] Voltando para lista');
    setActiveView('list');
    setSelectedOportunidade(null);
  };

  const handleFeedbackSalvo = () => {
    console.log('[VTEX] Feedback salvo, recarregando dados...');
    loadOportunidades();
    fetchFeedbacks();
    handleVoltar();
  };

  const handleRefresh = () => {
    console.log('[VTEX] Refresh solicitado pelo usuário');
    loadOportunidades();
    fetchFeedbacks();
  };

  if (loading || isLoadingOportunidades) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados VTEX...</p>
          {!debugInfo.isOnline && (
            <p className="mt-2 text-sm text-yellow-600">
              <WifiOff className="inline h-4 w-4 mr-1" />
              Sem conexão com a internet
            </p>
          )}
        </div>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Feedback VTEX</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie feedbacks semanais para oportunidades VTEX
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={isLoadingOportunidades}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingOportunidades ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-700">Erro ao Carregar Dados</h3>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getEstatisticasFeedback(oportunidadesVtex);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Feedback VTEX
            {debugInfo.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </h2>
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

            {debugInfo.lastSync && (
              <div className="mt-2 text-xs text-muted-foreground">
                Última sincronização: {debugInfo.lastSync.toLocaleTimeString()}
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
              Loading: {loading ? 'Sim' : 'Não'} | 
              Online: {debugInfo.isOnline ? 'Sim' : 'Não'}
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
