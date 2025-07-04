import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, ChevronLeft, Loader2, Trash2, Star } from "lucide-react";
import { WishlistStatus, WishlistItem } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useWishlistItemMutations } from "@/hooks/useWishlistMutations/wishlistItem";
import WishlistSolicitacaoModal from "@/components/wishlist/WishlistSolicitacaoModal";
import FiltroWishlistItens from "@/components/wishlist/FiltroWishlistItens";
import ListaWishlistItens from "@/components/wishlist/ListaWishlistItens";
import WishlistStats from "@/components/wishlist/WishlistStats";
import { filterWishlistItems, toSafeString, toSafeNumber } from "@/utils/wishlistUtils";

type EmpresaOption = {
  id: string;
  nome: string;
  tipo: string;
};

const CONSOLE_PREFIX = "[WishlistItensPage]";

// IMPORTANTE: src/pages/wishlist/WishlistItemsPage.tsx foi refatorado em componentes menores.
// Agora utiliza FiltroWishlistItens, ListaWishlistItens, WishlistStats, e WishlistItemCard

function getClienteNomePorId(id: string, clientes: EmpresaOption[]) {
  return clientes.find((c) => c.id === id)?.nome || "";
}

const WishlistItensPage: React.FC = () => {
  const {
    wishlistItems,
    loading: loadingItems,
    fetchWishlistItems,
    addWishlistItem,
    updateWishlistItem,
  } = useWishlist();

  // Mutations
  const { deleteWishlistItem } = useWishlistItemMutations(fetchWishlistItems);

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | "all">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [novoModalOpen, setNovoModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [empresas, setEmpresas] = useState<EmpresaOption[]>([]);
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaOption[]>([]);
  const [empresasParceiros, setEmpresasParceiros] = useState<EmpresaOption[]>([]);
  const [empresaInteressada, setEmpresaInteressada] = useState<string>("");
  const [empresaDesejada, setEmpresaDesejada] = useState<string>("");
  const [empresaDesejadaNome, setEmpresaDesejadaNome] = useState<string>("");
  const [empresaProprietaria, setEmpresaProprietaria] = useState<string>("");
  const [prioridade, setPrioridade] = useState<number>(3);
  const [motivo, setMotivo] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState<string>("");

  // Exclusão
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Aprovação/Rejeição
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Buscar empresas para o formulário
  useEffect(() => {
    if (!modalOpen) return;
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,tipo")
        .order("nome");
      if (!error && data) {
        setEmpresas(data);
        setEmpresasClientes(data.filter((e: EmpresaOption) => e.tipo === "cliente"));
        setEmpresasParceiros(
          data.filter(
            (e: EmpresaOption) =>
              e.tipo === "parceiro" || e.tipo === "intragrupo"
          )
        );
      } else if (error) {
        toast({
          title: "Erro ao buscar empresas",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    fetchEmpresas();
  }, [modalOpen, toast]);

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingItem) {
      setEmpresaInteressada(toSafeString(editingItem.empresa_interessada_id));
      setEmpresaDesejada(toSafeString(editingItem.empresa_desejada_id));
      setEmpresaProprietaria(toSafeString(editingItem.empresa_proprietaria_id));
      setPrioridade(toSafeNumber(editingItem.prioridade, 3));
      setMotivo(toSafeString(editingItem.motivo));
      setObservacoes(toSafeString(editingItem.observacoes));
      setEmpresaDesejadaNome(editingItem.empresa_desejada?.nome ?? "");
    } else {
      resetModal();
    }
  }, [editingItem]);

  useEffect(() => {
    if (empresaDesejada) {
      setEmpresaDesejadaNome(getClienteNomePorId(empresaDesejada, empresasClientes));
    } else {
      setEmpresaDesejadaNome("");
    }
  }, [empresaDesejada, empresasClientes]);

  const handleCriarNovoCliente = async () => {
    if (!novoClienteNome.trim()) return;
    setCriandoNovoCliente(true);
    const existe = empresasClientes.find(
      (c) => c.nome.trim().toLowerCase() === novoClienteNome.trim().toLowerCase()
    );
    let clienteId = "";
    if (existe) {
      clienteId = existe.id;
    } else {
      const { data, error } = await supabase
        .from("empresas")
        .insert({
          nome: novoClienteNome.trim(),
          tipo: "cliente",
          status: true,
        })
        .select("id, nome, tipo")
        .single();
      if (!error && data) {
        clienteId = data.id;
        setEmpresasClientes((prev) => [
          ...prev,
          { id: data.id, nome: data.nome, tipo: data.tipo },
        ]);
        setEmpresas((prev) => [
          ...prev,
          { id: data.id, nome: data.nome, tipo: data.tipo },
        ]);
      }
    }
    if (clienteId) {
      setTimeout(() => setEmpresaDesejada(clienteId), 0);
    }
    setNovoClienteNome("");
    setCriandoNovoCliente(false);
  };

  const resetModal = () => {
    setEmpresaInteressada("");
    setEmpresaDesejada("");
    setEmpresaDesejadaNome("");
    setEmpresaProprietaria("");
    setPrioridade(3);
    setMotivo("");
    setObservacoes("");
    setNovoClienteNome("");
    setFormError(null);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setModalLoading(true);

    if (!empresaInteressada || !empresaDesejada || !empresaProprietaria) {
      setFormError("Preencha todos os campos obrigatórios.");
      setModalLoading(false);
      return;
    }

    try {
      if (editingItem) {
        await updateWishlistItem(editingItem.id, {
          empresa_interessada_id: empresaInteressada,
          empresa_desejada_id: empresaDesejada,
          empresa_proprietaria_id: empresaProprietaria,
          prioridade,
          motivo,
          observacoes,
        });
      } else {
        await addWishlistItem({
          empresa_interessada_id: empresaInteressada,
          empresa_desejada_id: empresaDesejada,
          empresa_proprietaria_id: empresaProprietaria,
          prioridade,
          motivo,
          observacoes,
          status: "pendente",
          data_solicitacao: new Date().toISOString(),
        });
      }
      setModalOpen(false);
      resetModal();
      fetchWishlistItems();
      toast({
        title: "Sucesso!",
        description: "Solicitação salva com sucesso.",
      });
    } catch (err: any) {
      setFormError("Erro ao salvar. Tente novamente.");
      toast({
        title: "Erro ao salvar",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.error(`${CONSOLE_PREFIX} Erro ao salvar wishlist item:`, err);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Filtrar itens usando a função utilitária
  const filteredItens = filterWishlistItems(wishlistItems, searchTerm, statusFilter);

  // Aprovar item
  const handleAprovar = async (item: WishlistItem) => {
    setActionLoadingId(item.id);
    try {
      await updateWishlistItem(item.id, { status: "aprovado" });
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

  // Deletar item
  const handleDelete = async (item: WishlistItem) => {
    if (!window.confirm("Tem certeza que deseja excluir este item da wishlist?")) return;
    setDeleteLoading(true);
    try {
      await deleteWishlistItem(item.id);
      toast({
        title: "Item excluído",
        description: "O item foi removido da wishlist.",
      });
      if (editingItem?.id === item.id) {
        setModalOpen(false);
        setEditingItem(null);
      }
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Estado inicial`, {
      wishlistItems,
      empresas,
      empresasClientes,
      empresasParceiros,
      filteredItens,
    });
  }, [wishlistItems, empresas, empresasClientes, empresasParceiros, filteredItens]);

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
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Dialog
            open={modalOpen}
            onOpenChange={(o) => {
              setModalOpen(o);
              if (!o) resetModal();
            }}
          >
            <Button
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
                setModalOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Solicitação Manual
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem
                    ? "Editar Solicitação de Wishlist"
                    : "Nova Solicitação de Wishlist"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os campos e clique em{" "}
                  {editingItem ? "Salvar Alterações" : "Criar Solicitação"}.
                </DialogDescription>
              </DialogHeader>
              {formError && (
                <div className="text-red-600 text-sm mb-2">{formError}</div>
              )}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                autoComplete="off"
              >
                <div>
                  <label className="block font-medium mb-1">
                    Quem está solicitando?
                  </label>
                  <Select
                    value={empresaInteressada || ""}
                    onValueChange={setEmpresaInteressada}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione empresa (parceiro/intragrupo)" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasParceiros.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Cliente ou Lead desejado
                  </label>
                  <Select
                    value={empresaDesejada || ""}
                    onValueChange={setEmpresaDesejada}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione cliente/lead">
                        {empresaDesejada
                          ? empresaDesejadaNome ||
                            getClienteNomePorId(empresaDesejada, empresasClientes)
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {empresasClientes.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex mt-2 gap-2">
                    <Input
                      placeholder="Novo cliente/lead"
                      value={novoClienteNome || ""}
                      onChange={(e) => setNovoClienteNome(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCriarNovoCliente();
                        }
                      }}
                      disabled={criandoNovoCliente}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCriarNovoCliente}
                      disabled={criandoNovoCliente || !novoClienteNome.trim()}
                    >
                      {criandoNovoCliente && (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      )}
                      Adicionar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    O cliente/lead será criado e vinculado à base Aeight.
                  </p>
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Dono do relacionamento (parceiro ou intragrupo)
                  </label>
                  <Select
                    value={empresaProprietaria || ""}
                    onValueChange={setEmpresaProprietaria}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione proprietário" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresasParceiros.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Prioridade</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        aria-label={`Prioridade ${star}`}
                        onClick={() => setPrioridade(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            prioridade >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Motivo</label>
                  <Input
                    value={motivo || ""}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Descreva o motivo da solicitação"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">
                    Observações (opcional)
                  </label>
                  <Input
                    value={observacoes || ""}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações adicionais"
                  />
                </div>
                <div className="flex justify-between gap-2">
                  {editingItem && (
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex items-center"
                      onClick={() => handleDelete(editingItem)}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Excluir
                    </Button>
                  )}
                  <div className="flex-1 flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        modalLoading ||
                        !empresaInteressada ||
                        !empresaDesejada ||
                        !empresaProprietaria
                      }
                    >
                      {modalLoading && (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      )}
                      {editingItem ? "Salvar Alterações" : "Criar Solicitação"}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <FiltroWishlistItens
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Stats */}
      <WishlistStats items={wishlistItems} />

      {/* Lista de Itens */}
      <ListaWishlistItens
        items={filteredItens}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
        onEditar={(item) => {
          setEditingItem(item);
          setModalOpen(true);
        }}
        onNovaSolicitacao={() => setNovoModalOpen(true)}
        actionLoadingId={actionLoadingId}
        searchTerm={searchTerm}
        hasStatusFilter={statusFilter !== "all"}
      />

      {/* Novo Modal Aprimorado */}
      <WishlistSolicitacaoModal
        isOpen={novoModalOpen}
        onClose={() => setNovoModalOpen(false)}
      />
    </div>
  );
};

export default WishlistItensPage;
