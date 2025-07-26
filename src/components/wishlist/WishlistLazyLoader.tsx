import React, { useEffect, useState } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface WishlistLazyLoaderProps {
  children: React.ReactNode;
  showLoadingState?: boolean;
}

export const WishlistLazyLoader: React.FC<WishlistLazyLoaderProps> = ({ 
  children, 
  showLoadingState = true 
}) => {
  const { loading, error, isLoaded, loadData } = useWishlist();
  const [hasTriedLoading, setHasTriedLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded && !hasTriedLoading) {
      console.log('[WishlistLazyLoader] Carregando dados da wishlist sob demanda...');
      setHasTriedLoading(true);
      loadData();
    }
  }, [isLoaded, loadData, hasTriedLoading]);

  if (loading && showLoadingState) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !isLoaded) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Erro ao Carregar Dados</CardTitle>
          <CardDescription>
            Não foi possível carregar os dados da wishlist. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => {
              setHasTriedLoading(false);
              loadData();
            }}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se os dados foram carregados ou não há loading state, renderiza os children
  return <>{children}</>;
};