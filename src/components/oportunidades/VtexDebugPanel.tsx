
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { RefreshCw, Database, Wifi, WifiOff, User, AlertTriangle, CheckCircle } from 'lucide-react';

interface VtexDebugPanelProps {
  isVisible?: boolean;
}

export const VtexDebugPanel: React.FC<VtexDebugPanelProps> = ({ isVisible = false }) => {
  const [debugData, setDebugData] = useState({
    isOnline: navigator.onLine,
    userAuth: null as any,
    dbConnection: false,
    totalOportunidades: 0,
    vtexOportunidades: 0,
    totalFeedbacks: 0,
    rlsPolicies: [] as any[],
    lastCheck: null as Date | null
  });
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    try {
      console.log('[VTEX Debug] Iniciando diagnósticos...');

      // 1. Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // 2. Testar conexão com banco
      const { data: testQuery, error: dbError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      // 3. Contar oportunidades totais
      const { count: totalOpp, error: oppError } = await supabase
        .from('oportunidades')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'perdido')
        .neq('status', 'ganho');

      // 4. Buscar oportunidades com empresas para filtrar VTEX
      const { data: allOpp, error: allOppError } = await supabase
        .from('oportunidades')
        .select(`
          id,
          nome_lead,
          empresa_origem:empresas!empresa_origem_id(nome),
          empresa_destino:empresas!empresa_destino_id(nome)
        `)
        .neq('status', 'perdido')
        .neq('status', 'ganho');

      const vtexCount = allOpp?.filter(op => {
        const origemNome = op.empresa_origem?.nome?.toLowerCase() || '';
        const destinoNome = op.empresa_destino?.nome?.toLowerCase() || '';
        return origemNome.includes('vtex') || destinoNome.includes('vtex');
      }).length || 0;

      // 5. Contar feedbacks
      const { count: feedbackCount, error: feedbackError } = await supabase
        .from('vtex_feedback_oportunidades')
        .select('*', { count: 'exact', head: true });

      setDebugData({
        isOnline: navigator.onLine,
        userAuth: user,
        dbConnection: !dbError,
        totalOportunidades: totalOpp || 0,
        vtexOportunidades: vtexCount,
        totalFeedbacks: feedbackCount || 0,
        rlsPolicies: [],
        lastCheck: new Date()
      });

      console.log('[VTEX Debug] Diagnósticos concluídos:', {
        userAuth: !!user,
        dbConnection: !dbError,
        totalOpp: totalOpp || 0,
        vtexCount,
        feedbackCount: feedbackCount || 0,
        errors: { authError, dbError, oppError, allOppError, feedbackError }
      });

    } catch (error) {
      console.error('[VTEX Debug] Erro nos diagnósticos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      runDiagnostics();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Painel de Diagnóstico VTEX
          <Button
            variant="ghost"
            size="sm"
            onClick={runDiagnostics}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conexão */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Conexão Internet:</span>
          <Badge variant={debugData.isOnline ? "default" : "destructive"} className="text-xs">
            {debugData.isOnline ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Online
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Autenticação */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Usuário Autenticado:</span>
          <Badge variant={debugData.userAuth ? "default" : "destructive"} className="text-xs">
            {debugData.userAuth ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                {debugData.userAuth.email}
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Não autenticado
              </>
            )}
          </Badge>
        </div>

        {/* Banco de Dados */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Conexão BD:</span>
          <Badge variant={debugData.dbConnection ? "default" : "destructive"} className="text-xs">
            {debugData.dbConnection ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Erro
              </>
            )}
          </Badge>
        </div>

        {/* Dados */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold">{debugData.totalOportunidades}</div>
            <div className="text-muted-foreground">Total Opp</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{debugData.vtexOportunidades}</div>
            <div className="text-muted-foreground">VTEX Opp</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{debugData.totalFeedbacks}</div>
            <div className="text-muted-foreground">Feedbacks</div>
          </div>
        </div>

        {debugData.lastCheck && (
          <div className="text-xs text-muted-foreground text-center">
            Última verificação: {debugData.lastCheck.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
