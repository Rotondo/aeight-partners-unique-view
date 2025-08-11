import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, ChevronLeft, ExternalLink } from "lucide-react";
import { WishlistStatus, WishlistItem } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useWishlistItemMutations } from "@/hooks/useWishlistMutations/wishlistItem";
import WishlistSolicitacaoModal from "@/components/wishlist/WishlistSolicitacaoModal";
import WishlistFormModal from "@/components/wishlist/WishlistFormModal";
import WishlistFluxoAprimorado from "@/components/wishlist/WishlistFluxoAprimorado";
import FiltroWishlistItens from "@/components/wishlist/FiltroWishlistItens";
import WishlistItemsTable from "@/components/wishlist/WishlistItemsTable";
import WishlistStats from "@/components/wishlist/WishlistStats";
import { WishlistOportunidadeIntegration } from "@/components/wishlist/WishlistOportunidadeIntegration";
import { WishlistOportunidadeModal } from "@/components/wishlist/WishlistOportunidadeModal";
import { filterWishlistItems, sortWishlistItems } from "@/utils/wishlistUtils";

const CONSOLE_PREFIX = "[WishlistItensPage]";

const WishlistItensPage: React.FC = () => {
  const {
    wishlistItems,
    loading: loadingItems,
    fetchWishlistItems,
    addWishlistItem,
    updateWishlistItem,
  } = useWishlist();

  const { deleteWishlistItem } = useWishlistItemMutations(fetchWishlistItems);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | "all">("all");
  const [origemFilter, setOrigemFilter] = useState<string>("all");
  const [destinoFilter, setDestinoFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [fluxoAprimoradoOpen, setFluxoAprimoradoOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  // New state for opportunity modal
  const [oportunidadeModalOpen, setOportunidadeModalOpen] = useState(false);
  const [selectedItemForOportunidade, setSelectedItemForOportunidade] = useState<WishlistItem | null>(null);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredItems = filterWishlistItems(
    wishlistItems, 
    searchTerm, 
    statusFilter, 
    origemFilter, 
    destinoFilter
  );
  
  const sortedItems = sortWishlistItems(filteredItems, sortField, sortDirection);

  const handleAprovar = async (item: WishlistItem) => {
    setActionLoadingId(item.id);
    try {
      await updateWishlistItem(item.id, { status: "aprovado" });
      toast({
        title: "✅ Solicitação aprovada",
        description: "O item foi aprovado e uma apresentação foi criada automaticamente no pipeline.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/wishlist/apresentacoes")}>
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver Pipeline
          </Button>
        ),
      });
    } catch (err) {
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o item.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejeitar = async (item: WishlistItem) => {
    setActionLoadingId(item.id);
    try {
      await updateWishlistItem(item.id, { status: "rejeitado" });
      toast({
        title: "Solicitação rejeitada",
        description: "O item foi rejeitado.",
      });
    } catch (err) {
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o item.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerOportunidade = (item: WishlistItem) => {
    setSelectedItemForOportunidade(item);
    setOportunidadeModalOpen(true);
  };

  const handleItemDeleted = (itemId: string) => {
    if (editingItem?.id === itemId) {
      setEditingItem(null);
    }
    fetchWishlistItems();
  };

  const handleItemSaved = () => {
    fetchWishlistItems();
  };

  useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Estado inicial`, {
      wishlistItems,
      sortedItems,
    });
  }, [wishlistItems, sortedItems]);

  if (loadingItems) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/wishlist")} className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wishlist Itens</h1>
            <p className="text-muted-foreground">
              Gerencie solicitações de interesse e apresentações
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Button
            variant="outline"
            onClick={() => navigate("/oportunidades")}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Oportunidades
          </Button>
          <Button
            onClick={() => setFluxoAprimoradoOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            data-testid="button-fluxo-aprimorado"
          >
            <Plus className="mr-2 h-4 w-4" />
            Fluxo Aprimorado
          </Button>
          <Button
            variant="outline"
            onClick={() => setNovoModalOpen(true)}
            data-testid="button-nova-solicitacao"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setEditingItem(null);
              setFormModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Solicitação Manual
          </Button>
        </div>
      </div>

      <WishlistOportunidadeIntegration showDetailedFlow={true} />

      <FiltroWishlistItens
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        origemFilter={origemFilter}
        onOrigemChange={setOrigemFilter}
        destinoFilter={destinoFilter}
        onDestinoChange={setDestinoFilter}
        items={wishlistItems}
      />

      <WishlistStats items={wishlistItems} />

      <WishlistItemsTable
        items={sortedItems}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
        onEditar={(item) => {
          setEditingItem(item);
          setFormModalOpen(true);
        }}
        onVerOportunidade={handleVerOportunidade}
        actionLoadingId={actionLoadingId}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      <WishlistFluxoAprimorado
        isOpen={fluxoAprimoradoOpen}
        onClose={() => setFluxoAprimoradoOpen(false)}
      />
      
      <WishlistSolicitacaoModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
      />
      
      <WishlistFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        editingItem={editingItem}
        onItemSaved={handleItemSaved}
        onItemDeleted={handleItemDeleted}
      />

      <WishlistOportunidadeModal
        isOpen={oportunidadeModalOpen}
        onClose={() => {
          setOportunidadeModalOpen(false);
          setSelectedItemForOportunidade(null);
        }}
        wishlistItem={selectedItemForOportunidade}
      />
    </div>
  );
};

export default WishlistItensPage;
