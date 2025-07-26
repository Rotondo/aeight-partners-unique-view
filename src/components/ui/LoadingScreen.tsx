
import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface LoadingScreenProps {
  timeout?: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  timeout = 3000, // Reduzido para 3 segundos na ETAPA 1
  message = "Carregando..." 
}) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Math.ceil(timeout / 1000));

  useEffect(() => {
    console.log(`[LoadingScreen] ETAPA 1 - Iniciado com timeout de ${timeout}ms`);
    
    // Contador regressivo
    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          clearInterval(countdownInterval);
        }
        return newTime;
      });
    }, 1000);

    // Timer para mostrar opções de timeout
    const timer = setTimeout(() => {
      console.log('[LoadingScreen] ETAPA 1 - Timeout atingido');
      setShowTimeout(true);
      clearInterval(countdownInterval);
    }, timeout);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [timeout]);

  const handleForceLogin = () => {
    console.log('[LoadingScreen] ETAPA 1 - Forçando redirecionamento para login');
    window.location.href = '/login';
  };

  const handleReload = () => {
    console.log('[LoadingScreen] ETAPA 1 - Recarregando página');
    window.location.reload();
  };

  if (showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 shadow-lg text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">
            ETAPA 1 - Timeout de Autenticação
          </h2>
          <div className="text-muted-foreground space-y-2">
            <p>A autenticação está demorando mais que o esperado.</p>
            <p className="text-sm">
              Modo de teste ativo - timeout reduzido para 3 segundos.
            </p>
          </div>
          <div className="space-y-2">
            <Button onClick={handleReload} className="w-full" variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button onClick={handleForceLogin} className="w-full" variant="outline">
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <RefreshCw className="h-12 w-12 text-primary mx-auto animate-spin" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">
            ETAPA 1 - Teste rápido ({timeLeft}s restantes)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
