
import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, Wifi } from "lucide-react";

interface LoadingScreenProps {
  timeout?: number; // Timeout em ms para mostrar opções de recuperação
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ timeout = 15000 }) => {
  // Add safety check for React initialization
  if (!React || typeof React.useState !== 'function') {
    console.error('[LoadingScreen] React is not properly initialized');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const [showRecovery, setShowRecovery] = React.useState(false);
  const [loadingTime, setLoadingTime] = React.useState(0);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const startTime = Date.now();
    
    // Monitor de conexão
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Atualizar tempo de carregamento
    const interval = setInterval(() => {
      setLoadingTime(Date.now() - startTime);
    }, 1000);

    // Mostrar opções de recuperação após timeout
    const timer = setTimeout(() => {
      setShowRecovery(true);
      console.warn('[LoadingScreen] Timeout atingido, mostrando opções de recuperação');
      console.log('[LoadingScreen] Debug Info:', {
        url: window.location.href,
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        retryCount,
        loadingTime: Date.now() - startTime
      });
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [timeout, retryCount]);

  const handleForceReload = () => {
    setRetryCount(prev => prev + 1);
    console.log('[LoadingScreen] Forçando recarregamento... Tentativa:', retryCount + 1);
    window.location.reload();
  };

  const handleClearCacheAndReload = async () => {
    setRetryCount(prev => prev + 1);
    console.log('[LoadingScreen] Limpando cache e recarregando... Tentativa:', retryCount + 1);
    
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      // Limpar localStorage também (mas preservar configurações importantes)
      const supabaseSession = localStorage.getItem('sb-amuadbftctnmckncgeua-auth-token');
      localStorage.clear();
      sessionStorage.clear();
      
      // Restaurar sessão se existir
      if (supabaseSession) {
        localStorage.setItem('sb-amuadbftctnmckncgeua-auth-token', supabaseSession);
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4 max-w-md text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        
        <div className="space-y-2">
          <span className="text-lg text-muted-foreground">Carregando...</span>
          <div className="text-sm text-muted-foreground">
            {Math.round(loadingTime / 1000)}s
          </div>
        </div>

        {showRecovery && (
          <div className="space-y-4 mt-6 p-4 border rounded-lg bg-muted/50 max-w-sm">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Problema Detectado</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              O carregamento está demorando mais que o esperado.
              {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Wifi className={`h-3 w-3 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
              <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                {isOnline ? 'Conectado' : 'Sem conexão'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleForceReload}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Recarregar Página
              </Button>
              
              <Button 
                onClick={handleClearCacheAndReload}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Limpar Cache e Recarregar
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Verifique sua conexão com a internet</div>
              <div>• Tente recarregar a página</div>
              {retryCount > 2 && <div className="text-amber-600">• Se persiste, contate o suporte</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
