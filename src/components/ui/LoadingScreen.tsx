
import React from 'react';

interface LoadingScreenProps {
  timeout?: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  timeout = 30000,
  message = "Carregando..." 
}) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutMessage(true);
      console.warn('[LoadingScreen] Timeout atingido, mostrando opções de recovery');
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  if (showTimeoutMessage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold text-destructive">
            Carregamento Demorado
          </h2>
          <p className="text-muted-foreground">
            A aplicação está demorando mais que o esperado para carregar.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Recarregar Página
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
