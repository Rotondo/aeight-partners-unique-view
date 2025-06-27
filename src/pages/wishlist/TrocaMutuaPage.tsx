
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { ArrowLeftRight } from "lucide-react";

const TrocaMutuaPage: React.FC = () => {
  const { loading } = useWishlist();

  // TODO: Implementar busca de dados de negociações mútuas do backend
  // Por enquanto, mantendo apenas a estrutura visual
  const negociacoesAtivas: never[] = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando negociações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Sistema de Troca Mútua
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie negociações de clientes e interesses mútuos com parceiros
          </p>
        </div>
      </div>

      {/* Negociações Ativas */}
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma negociação disponível</h3>
            <p className="text-muted-foreground">
              Os dados de troca mútua serão carregados do backend quando disponíveis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrocaMutuaPage;
