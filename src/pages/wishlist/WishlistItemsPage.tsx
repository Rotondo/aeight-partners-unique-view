import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, Search, Heart, Calendar, Star, Loader2, CheckCircle, XCircle, Handshake } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WishlistStatus, WishlistItem } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type EmpresaOption = {
  id: string;
  nome: string;
  tipo: string;
};

function toSafeString(val: unknown): string {
  return typeof val === "string" ? val : val == null ? "" : String(val);
}
function toSafeNumber(val: unknown, fallback = 3): number {
  return typeof val === "number" && !isNaN(val) ? val : fallback;
}

function getClienteNomePorId(id: string, clientes: EmpresaOption[]) {
  return clientes.find((c) => c.id === id)?.nome || "";
}

const statusActions: Record<WishlistStatus, { approve?: boolean; reject?: boolean; facilitate?: boolean }> = {
  pendente: { approve: true, reject: true, facilitate: false },
  em_andamento: { approve: false, reject: false, facilitate: true },
  aprovado: { approve: false, reject: false, facilitate: true },
  rejeitado: {},
  convertido: {},
};

const WishlistItemsPage: React.FC = () => {
  const {
    wishlistItems,
    loading: loadingItems,
    fetchWishlistItems,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
  } = useWishlist();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | "all">("all");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Aprovar/rejeitar state
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [itemToApprove, setItemToApprove] = useState<WishlistItem | null>(null);
  const [itemToReject, setItemToReject] = useState<WishlistItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionLoading, setRejectionLoading] = useState(false);

  // Facilitar
  const [facilitateDialogOpen, setFacilitateDialogOpen] = useState(false);
  const [itemToFacilitate, setItemToFacilitate] = useState<WishlistItem | null>(null);

  // Form state
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
  }, [modalOpen]);

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
    // eslint-disable-next-line
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
        console.error("Erro ao salvar wishlist item:", err);
      }
    } finally {
      setModalLoading(false);
    }
  };

  // Aprovação
  const handleApprove = async () => {
    if (!itemToApprove) return;
    setApproveDialogOpen(false);
    try {
      await updateWishlistItem(itemToApprove.id, {
        status: "aprovado",
        data_resposta: new Date().toISOString(),
      });
      toast({
        title: "Solicitação aprovada!",
        description: "A solicitação foi aprovada com sucesso.",
      });
      fetchWishlistItems();
    } catch (err: any) {
      toast({
        title: "Erro ao aprovar",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
    }
    setItemToApprove(null);
  };

  // Rejeição
  const handleReject = async () => {
    if (!itemToReject) return;
    setRejectionLoading(true);
    try {
      await updateWishlistItem(itemToReject.id, {
        status: "rejeitado",
        data_resposta: new Date().toISOString(),
        observacoes: rejectionReason,
      });
      toast({
        title: "Solicitação rejeitada!",
        description: "A solicitação foi rejeitada.",
      });
      fetchWishlistItems();
    } catch (err: any) {
      toast({
        title: "Erro ao rejeitar",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
    }
    setRejectionLoading(false);
    setRejectDialogOpen(false);
    setItemToReject(null);
    setRejectionReason("");
  };

  // Facilitar apresentação
  const handleFacilitate = async () => {
    setFacilitateDialogOpen(false);
    toast({
      title: "Fluxo de facilitação",
      description: "Redirecione para o fluxo de facilitação de apresentação.",
    });
    setItemToFacilitate(null);
  };

  // Excluir item
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteWishlistItem(itemToDelete.id);
      toast({
        title: "Item excluído",
        description: "Solicitação removida da wishlist.",
      });
      fetchWishlistItems();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Defensive .map for wishlistItems and filteredItems
  const safeWishlistItems = Array.isArray(wishlistItems) ? wishlistItems : [];
  const filteredItems = safeWishlistItems.filter((item) => {
    const matchesSearch =
      (item.empresa_interessada?.nome || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.empresa_desejada?.nome || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item.empresa_proprietaria?.nome || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: WishlistStatus) => {
    switch (status) {
      case "pendente":
        return "secondary";
      case "em_andamento":
        return "outline";
      case "aprovado":
        return "default";
      case "rejeitado":
        return "destructive";
      case "convertido":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: WishlistStatus) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_andamento":
        return "Em Andamento";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      case "convertido":
        return "Convertido";
      default:
        return status;
    }
  };

  const getPriorityStars = (prioridade: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < prioridade ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist Items</h1>
          <p className="text-muted-foreground">
            Gerencie solicitações de interesse e apresentações
          </p>
        </div>
        <Dialog
          open={modalOpen}
          onOpenChange={(o) => {
            setModalOpen(o);
            if (!o) resetModal();
          }}
        >
          <Button
            onClick={() => {
              setEditingItem(null);
              setModalOpen(true);
            }}
            data-testid="button-nova-solicitacao"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
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
                    {(empresasParceiros ?? []).map((e) => (
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
                    {(empresasClientes ?? []).map((e) => (
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
                    {(empresasParceiros ?? []).map((e) => (
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
              <div className="flex justify-end">
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
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: WishlistStatus | "all") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeWishlistItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Badge variant="secondary">
              {safeWishlistItems.filter((i) => i.status === "pendente").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeWishlistItems.filter((i) => i.status === "pendente").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <Badge variant="default">
              {safeWishlistItems.filter((i) => i.status === "aprovado").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeWishlistItems.filter((i) => i.status === "aprovado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <Badge variant="default">
              {safeWishlistItems.filter((i) => i.status === "convertido").length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeWishlistItems.filter((i) => i.status === "convertido").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Items */}
      <div className="grid gap-4">
        {(filteredItems ?? []).map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {(item.empresa_interessada?.nome || "—")} →{" "}
                    {(item.empresa_desejada?.nome || "—")}
                  </CardTitle>
                  <CardDescription>
                    Proprietário: {(item.empresa_proprietaria?.nome || "—")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  <div className="flex items-center">
                    {getPriorityStars(toSafeNumber(item.prioridade, 3))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Solicitado em{" "}
                  {item.data_solicitacao
                    ? format(
                        new Date(item.data_solicitacao),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )
                    : ""}
                </div>
                {item.motivo && (
                  <div>
                    <p className="text-sm font-medium">Motivo:</p>
                    <p className="text-sm text-muted-foreground">
                      {item.motivo}
                    </p>
                  </div>
                )}
                {item.observacoes && (
                  <div>
                    <p className="text-sm font-medium">Observações:</p>
                    <p className="text-sm text-muted-foreground">
                      {item.observacoes}
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  {item.status === "pendente" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemToApprove(item);
                          setApproveDialogOpen(true);
                        }}
                        title="Aprovar solicitação"
                      >
                        <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemToReject(item);
                          setRejectDialogOpen(true);
                        }}
                        title="Rejeitar solicitação"
                      >
                        <XCircle className="mr-1 h-4 w-4 text-destructive" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {(item.status === "aprovado" || item.status === "em_andamento") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setItemToFacilitate(item);
                        setFacilitateDialogOpen(true);
                      }}
                      title="Facilitar Apresentação"
                    >
                      <Handshake className="mr-1 h-4 w-4 text-blue-600" />
                      Facilitar Apresentação
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingItem(item);
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteDialogOpen(true);
                    }}
                    title="Excluir item"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(filteredItems ?? []).length === 0 && (
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
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Aprovar Dialog */}
      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Aprovar Solicitação"
        description="Deseja realmente aprovar esta solicitação de wishlist?"
        onConfirm={handleApprove}
        confirmText="Aprovar"
        cancelText="Cancelar"
      />
      {/* Rejeitar Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Deseja realmente rejeitar esta solicitação? Informe o motivo da rejeição.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Motivo da rejeição"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectionLoading || !rejectionReason.trim()}
            >
              {rejectionLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Rejeitar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Facilitar Dialog */}
      <ConfirmDialog
        open={facilitateDialogOpen}
        onOpenChange={setFacilitateDialogOpen}
        title="Facilitar Apresentação"
        description="Você será direcionado para o fluxo de facilitação de apresentação deste item. Deseja prosseguir?"
        onConfirm={handleFacilitate}
        confirmText="Prosseguir"
        cancelText="Cancelar"
      />
      {/* Excluir Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Solicitação"
        description="Tem certeza que deseja excluir esta solicitação? Esta ação não poderá ser desfeita."
        onConfirm={handleDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default WishlistItemsPage;
