import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import { WishlistItem } from "@/types";
import WishlistItemCard from "./WishlistItemCard";

interface ListaWishlistItensProps {
  items: WishlistItem[];
  searchTerm: string;
  statusFilter: string;
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  onNovoClick: () => void;
  actionLoadingId: string | null;
}

const ListaWishlistItens: React.FC<ListaWishlistItensProps> = ({
  items,
  searchTerm,
  statusFilter,
  onAprovar,
  onRejeitar,
  onEditar,
  onNovoClick,
  actionLoadingId,
}) => {
  // Filtrar itens
  const filteredItems = items.filter((item) => {
    const matchesSearch = searchTerm === "" || 
      item.empresa_interessada?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empresa_desejada?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empresa_proprietaria?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.motivo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (filteredItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum item encontrado
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Adicione o primeiro item à wishlist"}
          </p>
          <Button onClick={onNovoClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          onAprovar={onAprovar}
          onRejeitar={onRejeitar}
          onEditar={onEditar}
          isActionLoading={actionLoadingId === item.id}
        />
      ))}
    </div>
  );
};

export default ListaWishlistItens;