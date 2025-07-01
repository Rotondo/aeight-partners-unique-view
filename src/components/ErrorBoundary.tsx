
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: any;
  isBlankScreen: boolean;
  retryCount: number;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private blankScreenTimer: NodeJS.Timeout | null = null;
  private performanceTimer: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null, 
      isBlankScreen: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error, errorInfo: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);
    this.setState({ errorInfo });

    // Log estruturado para debugging
    this.logError('component_error', { error, errorInfo });
  }

  componentDidMount() {
    // Detector de tela branca
    this.startBlankScreenDetection();
    
    // Monitor de performance
    this.startPerformanceMonitoring();

    // Listener para erros não capturados
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    if (this.blankScreenTimer) clearTimeout(this.blankScreenTimer);
    if (this.performanceTimer) clearTimeout(this.performanceTimer);
    
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private startBlankScreenDetection = () => {
    // Detecta se a tela está branca após 5 segundos
    this.blankScreenTimer = setTimeout(() => {
      const body = document.body;
      const hasContent = body && (
        body.children.length > 1 || 
        body.textContent?.trim().length > 0 ||
        body.querySelector('[data-testid], [class*="container"], main, section')
      );

      if (!hasContent && !this.state.hasError) {
        console.warn('[ErrorBoundary] Tela branca detectada');
        this.setState({ isBlankScreen: true });
        this.logError('blank_screen_detected', { timestamp: Date.now() });
      }
    }, 5000);
  };

  private startPerformanceMonitoring = () => {
    this.performanceTimer = setTimeout(() => {
      const loadTime = performance.now();
      this.logError('performance_metric', { 
        loadTime: Math.round(loadTime),
        timestamp: Date.now()
      });
    }, 1000);
  };

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('[ErrorBoundary] Erro global:', event.error);
    this.logError('global_error', { 
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('[ErrorBoundary] Promise rejeitada:', event.reason);
    this.logError('unhandled_rejection', { reason: event.reason });
  };

  private logError = (type: string, data: any) => {
    const logEntry = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...data
    };
    
    console.error(`[ErrorBoundary] ${type}:`, logEntry);
    
    // Salvar no localStorage para debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      existingLogs.push(logEntry);
      // Manter apenas os últimos 10 logs
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('error_logs', JSON.stringify(recentLogs));
    } catch (e) {
      console.warn('Não foi possível salvar log de erro');
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isBlankScreen: false,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleForceReload = () => {
    this.logError('force_reload_triggered', { retryCount: this.state.retryCount });
    
    // Limpar cache se possível
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      }).finally(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  private clearErrorLogs = () => {
    localStorage.removeItem('error_logs');
    alert('Logs de erro limpos');
  };

  render() {
    if (this.state.hasError || this.state.isBlankScreen) {
      return (
        <div className="min-h-screen bg-background p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {this.state.isBlankScreen ? 'Tela Branca Detectada' : 'Erro na Aplicação'}
              </AlertTitle>
              <AlertDescription>
                {this.state.isBlankScreen 
                  ? 'A aplicação não carregou corretamente. Tente as opções abaixo.'
                  : 'Ocorreu um erro inesperado. Você pode tentar recuperar a aplicação.'
                }
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-3">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente ({this.state.retryCount})
              </Button>
              
              <Button onClick={this.handleForceReload} variant="destructive">
                Forçar Recarregamento
              </Button>

              <Button 
                onClick={() => window.history.back()} 
                variant="ghost"
              >
                Voltar
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="space-y-2">
                <Button 
                  onClick={this.clearErrorLogs} 
                  variant="ghost" 
                  size="sm"
                >
                  Limpar Logs de Erro
                </Button>
                
                {this.state.error && (
                  <details className="p-4 bg-muted rounded text-sm">
                    <summary className="cursor-pointer font-medium">
                      Detalhes do Erro (Dev)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap break-all">
                      {this.state.error.toString()}
                      {this.state.errorInfo && (
                        <>
                          <br /><br />
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
