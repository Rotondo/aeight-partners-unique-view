import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { ChevronLeft, Loader2 } from "lucide-react";
import { WishlistStatus, WishlistItem } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useWishlistItemMutations } from "@/hooks/useWishlistMutations/wishlistItem";
import WishlistSolicitacaoModal from "@/components/wishlist/WishlistSolicitacaoModal";
import FiltroWishlistItens from "@/components/wishlist/FiltroWishlistItens";
import ListaWishlistItens from "@/components/wishlist/ListaWishlistItens";
import { CrmService } from "@/services/CrmService";

const CONSOLE_PREFIX = "[WishlistItensPage]";

const WishlistItensPage: React.FC = () => {
  const {
    wishlistItems,
    loading: loadingItems,
    fetchWishlistItems,
    updateWishlistItem,
  } = useWishlist();

  // Mutations
  const { deleteWishlistItem } = useWishlistItemMutations(fetchWishlistItems);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | "all">("all");
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch wishlist items when component mounts
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  // Aprovar item com integração CRM
  const handleAprovar = async (item: WishlistItem) => {
    setActionLoadingId(item.id);
    try {
      await updateWishlistItem(item.id, { status: "aprovado" });
      
      // Integração CRM: Criar ação de follow-up para apresentação
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          const crmAction = {
            description: `Facilitar apresentação aprovada: ${item.empresa_interessada?.nome} → ${item.empresa_desejada?.nome}`,
            communication_method: 'email' as const,
            status: 'pending' as const,
            partner_id: item.empresa_proprietaria_id,
            content: `Solicitação aprovada. Motivo: ${item.motivo}`,
            next_step_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
            next_steps: 'Facilitar apresentação entre as empresas'
          };

          await CrmService.createAcao(crmAction, userId);
        }
      } catch (crmError) {
        console.warn('Erro ao criar ação CRM (não crítico):', crmError);
      }

      toast({
        title: "Solicitação aprovada",
        description: "O item foi aprovado com sucesso.",
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

  // Rejeitar item
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

  // Editar item - redirecionar para o modal
  const handleEditar = (item: WishlistItem) => {
    // Para simplificar, vamos apenas mostrar um toast por enquanto
    // No futuro, podemos implementar edição inline ou modal dedicado
    toast({
      title: "Edição em desenvolvimento",
      description: "Funcionalidade de edição será implementada em breve.",
    });
  };

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
      
      {/* Header */}
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
      </div>

      {/* Filtros */}
      <FiltroWishlistItens
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onNovoClick={() => setNovoModalOpen(true)}
      />

      {/* Lista de Itens */}
      <ListaWishlistItens
        items={wishlistItems}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
        onEditar={handleEditar}
        onNovoClick={() => setNovoModalOpen(true)}
        actionLoadingId={actionLoadingId}
      />

      {/* Modal para Nova Solicitação */}
      <WishlistSolicitacaoModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
      />
    </div>
  );
};

export default WishlistItensPage;