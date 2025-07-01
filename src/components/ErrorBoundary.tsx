import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null; // Tipo mais específico
  errorInfo: React.ErrorInfo | null; // Tipo mais específico
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> { // Tipo mais específico para o retorno e parâmetro
    return { hasError: true, error: error }; // errorInfo é definido em componentDidCatch
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { // Tipos mais específicos
    // Log para rastreabilidade global
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);
    this.setState({ errorInfo: errorInfo }); // Definir errorInfo aqui
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold text-red-700">
              Oops! Algo deu errado.
            </h1>
            <p className="mt-2 text-md text-gray-600">
              Lamentamos o inconveniente. Um erro inesperado ocorreu.
              Nossa equipe já foi notificada (se o sistema de logging estiver configurado).
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Você pode tentar recarregar a página ou voltar para a página anterior.
            </p>

            {this.state.error && (
              <div className="mt-6 text-left bg-red-50 p-3 rounded-md">
                <h3 className="text-sm font-semibold text-red-800">Detalhes do Erro:</h3>
                <pre className="mt-1 text-xs text-red-700 whitespace-pre-wrap break-all">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && this.state.errorInfo.componentStack && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-red-600 hover:text-red-700">
                      Stack de Componentes
                    </summary>
                    <pre className="mt-1 text-red-700 whitespace-pre-wrap break-all">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Recarregar Página
              </button>
              <button
                onClick={this.handleGoBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
