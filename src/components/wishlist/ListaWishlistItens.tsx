import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { WishlistItem } from "@/types";
import WishlistItemCard from "./WishlistItemCard";

interface ListaWishlistItensProps {
  items: WishlistItem[];
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  onNovaSolicitacao: () => void;
  actionLoadingId: string | null;
  searchTerm: string;
  hasStatusFilter: boolean;
}

const ListaWishlistItens: React.FC<ListaWishlistItensProps> = ({
  items,
  onAprovar,
  onRejeitar,
  onEditar,
  onNovaSolicitacao,
  actionLoadingId,
  searchTerm,
  hasStatusFilter,
}) => {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm || hasStatusFilter
              ? "Tente ajustar os filtros de busca"
              : "Adicione o primeiro item à wishlist"}
          </p>
          <Button onClick={onNovaSolicitacao}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onAprovar={onAprovar}
          onRejeitar={onRejeitar}
          onEditar={onEditar}
          actionLoadingId={actionLoadingId}
        />
      ))}
    </div>
  );
};

export default ListaWishlistItens;