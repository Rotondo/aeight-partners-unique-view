
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';

export const AgendaSyncGoogle: React.FC = () => {
  const { syncGoogleCalendar } = useAgenda();
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleConnect = async () => {
    try {
      // TODO: Implementar autenticação OAuth2 do Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsConnected(true);
      setLastSync(new Date());
    } catch (error) {
      console.error('Erro ao conectar com Google:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncGoogleCalendar();
      setLastSync(new Date());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Google Calendar</CardTitle>
            <CardDescription>Sincronize com sua agenda do Google</CardDescription>
          </div>
          
          {isConnected ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline">
              <AlertCircle className="h-3 w-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {!isConnected ? (
            <Button onClick={handleConnect} className="w-full">
              Conectar ao Google
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="w-full"
                variant="outline"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sincronizar Agora
              </Button>
              
              {lastSync && (
                <p className="text-xs text-muted-foreground text-center">
                  Última sincronização: {lastSync.toLocaleString('pt-BR')}
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
