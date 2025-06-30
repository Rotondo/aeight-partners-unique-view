import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
  errorInfo: any;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error, errorInfo: null };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log para rastreabilidade global
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "white", background: "#b91c1c", padding: 32, borderRadius: 8, margin: 32 }}>
          <h1>Ocorreu um erro inesperado nesta página.</h1>
          <pre style={{ color: "yellow" }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo && (
            <details style={{ whiteSpace: "pre-wrap", color: "#fbbf24" }}>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
