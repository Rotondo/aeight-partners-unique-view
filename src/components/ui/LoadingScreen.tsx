
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LoadingScreenProps {
  timeout?: number; // Timeout em ms para mostrar opções de recuperação
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ timeout = 15000 }) => {
  const [showRecovery, setShowRecovery] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Atualizar tempo de carregamento
    const interval = setInterval(() => {
      setLoadingTime(Date.now() - startTime);
    }, 1000);

    // Mostrar opções de recuperação após timeout
    const timer = setTimeout(() => {
      setShowRecovery(true);
      console.warn('[LoadingScreen] Timeout atingido, mostrando opções de recuperação');
    }, timeout);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [timeout]);

  const handleForceReload = () => {
    console.log('[LoadingScreen] Forçando recarregamento...');
    window.location.reload();
  };

  const handleClearCacheAndReload = async () => {
    console.log('[LoadingScreen] Limpando cache e recarregando...');
    
    try {
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
      
      // Limpar localStorage também
      localStorage.clear();
      sessionStorage.clear();
      
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
          <div className="space-y-4 mt-6 p-4 border rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">
              O carregamento está demorando mais que o esperado.
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleForceReload}
                variant="outline"
                size="sm"
              >
                Recarregar Página
              </Button>
              
              <Button 
                onClick={handleClearCacheAndReload}
                variant="outline"
                size="sm"
              >
                Limpar Cache e Recarregar
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Se o problema persistir, verifique sua conexão com a internet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { LoadingScreen };
export default LoadingScreen;
