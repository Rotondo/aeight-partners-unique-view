
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-6" />
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Página não encontrada
        </p>
        <p className="text-muted-foreground mb-8">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
