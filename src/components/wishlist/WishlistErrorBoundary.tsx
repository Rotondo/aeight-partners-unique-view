import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button"; // Supondo que Button aceite onClick e children

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class WishlistErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error, errorInfo: null }; // errorInfo não é definido aqui
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios de erro
    console.error("[WishlistErrorBoundary] Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleRetry = () => {
    // Tenta recarregar a página ou o componente problemático.
    // Uma forma simples é recarregar a localização atual,
    // mas pode ser mais sofisticado dependendo da necessidade.
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Poderia também tentar window.location.reload(); se for mais apropriado
    // ou chamar uma função específica para resetar o estado do wishlist, se aplicável.
  };

  public render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-4">
            Algo deu errado no módulo Wishlist.
          </h2>
          <p className="text-muted-foreground mb-2">
            Pedimos desculpas pelo inconveniente. Tente recarregar a seção.
          </p>
          {this.state.error && (
            <details className="mb-4 p-2 bg-destructive/10 rounded text-left text-sm">
              <summary className="cursor-pointer font-medium">Detalhes do Erro</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.error.toString()}
                {this.state.errorInfo && <br />}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
          <Button onClick={this.handleRetry} variant="outline">
            Tentar Novamente
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="link"
            className="ml-2"
          >
            Voltar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WishlistErrorBoundary;
