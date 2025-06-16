import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  Plus,
  Search,
  Presentation,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Pencil,
  Trash2,
  CornerUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  StatusApresentacao,
  TipoApresentacao,
  WishlistApresentacao,
  WishlistItem,
} from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

// Types for empresa select
type EmpresaOption = {
  id: string;
  nome: string;
  tipo: string;
};

const ApresentacoesPage: React.FC = () => {
  const {
    apresentacoes,
    loading: loadingApresentacoes,
    fetchApresentacoes,
    addApresentacao,
    updateApresentacao,
    convertToOportunidade,
    fetchWishlistItems,
    wishlistItems,
  } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusApresentacao | "all">(
    "all"
  );

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingApresentacao, setEditingApresentacao] =
    useState<WishlistApresentacao | null>(null);

  // Form state
  const [empresasFacilitadoras, setEmpresasFacilitadoras] = useState<
    EmpresaOption[]
  >([]);
  const [empresaFacilitadora, setEmpresaFacilitadora] = useState<string>("");
  const [wishlistItem, setWishlistItem] = useState<string>("");
  const [tipoApresentacao, setTipoApresentacao] = useState<TipoApresentacao | "">("");
  const [statusApresentacao, setStatusApresentacao] = useState<StatusApresentacao | "agendada">("agendada");
  const [dataApresentacao, setDataApresentacao] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [converteuOportunidade, setConverteuOportunidade] = useState(false);

  // Conversão
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [apresentacaoToConvert, setApresentacaoToConvert] = useState<WishlistApresentacao | null>(null);
  const [conversaoNome, setConversaoNome] = useState("");
  const [conversaoValor, setConversaoValor] = useState("");
  const [conversaoLoading, setConversaoLoading] = useState(false);

  // Edição e exclusão
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [apresentacaoToEdit, setApresentacaoToEdit] = useState<WishlistApresentacao | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apresentacaoToDelete, setApresentacaoToDelete] = useState<WishlistApresentacao | null>(null);

  // Marcar como realizada
  const [markRealizadaDialogOpen, setMarkRealizadaDialogOpen] = useState(false);
  const [apresentacaoToMarkRealizada, setApresentacaoToMarkRealizada] = useState<WishlistApresentacao | null>(null);

  // Carrega empresas facilitadoras para o formulário
  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,tipo")
        .order("nome");
      if (!error && data) {
        setEmpresasFacilitadoras(
          data.filter(
            (e: EmpresaOption) =>
              e.tipo === "parceiro" || e.tipo === "intragrupo"
          )
        );
      }
    };
    if (modalOpen) fetchEmpresas();
  }, [modalOpen]);

  // Reset modal fields
  const resetModal = () => {
    setEmpresaFacilitadora("");
    setWishlistItem("");
    setTipoApresentacao("");
    setStatusApresentacao("agendada");
    setDataApresentacao("");
    setFeedback("");
    setConverteuOportunidade(false);
    setEditingApresentacao(null);
  };

  // Preencher formulário ao editar
  useEffect(() => {
    if (editingApresentacao) {
      setEmpresaFacilitadora(editingApresentacao.empresa_facilitadora_id);
      setWishlistItem(editingApresentacao.wishlist_item_id);
      setTipoApresentacao(editingApresentacao.tipo_apresentacao);
      setStatusApresentacao(editingApresentacao.status_apresentacao);
      setDataApresentacao(editingApresentacao.data_apresentacao);
      setFeedback(editingApresentacao.feedback || "");
      setConverteuOportunidade(!!editingApresentacao.converteu_oportunidade);
    } else {
      resetModal();
    }
  }, [editingApresentacao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    if (!empresaFacilitadora || !wishlistItem || !tipoApresentacao || !statusApresentacao || !dataApresentacao) {
      setModalLoading(false);
      return;
    }
    if (editingApresentacao) {
      await updateApresentacao(editingApresentacao.id, {
        empresa_facilitadora_id: empresaFacilitadora,
        wishlist_item_id: wishlistItem,
        tipo_apresentacao: tipoApresentacao as TipoApresentacao,
        status_apresentacao: statusApresentacao as StatusApresentacao,
        data_apresentacao: dataApresentacao,
        feedback,
        converteu_oportunidade: converteuOportunidade,
      });
      toast({ title: "Sucesso", description: "Apresentação atualizada." });
    } else {
      await addApresentacao({
        empresa_facilitadora_id: empresaFacilitadora,
        wishlist_item_id: wishlistItem,
        tipo_apresentacao: tipoApresentacao as TipoApresentacao,
        status_apresentacao: statusApresentacao as StatusApresentacao,
        data_apresentacao: dataApresentacao,
        feedback,
        converteu_oportunidade: converteuOportunidade,
      });
      toast({ title: "Sucesso", description: "Apresentação registrada." });
    }
    setModalLoading(false);
    setModalOpen(false);
    resetModal();
    fetchApresentacoes();
    fetchWishlistItems();
  };

  // Apenas wishlist items não convertidos e aprovados/em_andamento
  const wishlistItemsDisponiveis: WishlistItem[] = wishlistItems.filter(
    (item) =>
      ["aprovado", "em_andamento"].includes(item.status) &&
      !apresentacoes.some(
        (a) => a.wishlist_item_id === item.id && a.status_apresentacao !== "cancelada"
      )
  );

  const filteredApresentacoes = apresentacoes.filter((apresentacao) => {
    const matchesSearch =
      apresentacao.empresa_facilitadora?.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      apresentacao.wishlist_item?.empresa_interessada?.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      apresentacao.wishlist_item?.empresa_desejada?.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      apresentacao.status_apresentacao === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: StatusApresentacao) => {
    switch (status) {
      case "agendada":
        return "outline";
      case "realizada":
        return "default";
      case "cancelada":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: StatusApresentacao) => {
    switch (status) {
      case "agendada":
        return "Agendada";
      case "realizada":
        return "Realizada";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getTipoLabel = (tipo: TipoApresentacao) => {
    switch (tipo) {
      case "email":
        return "Email";
      case "reuniao":
        return "Reunião";
      case "evento":
        return "Evento";
      case "digital":
        return "Digital";
      case "outro":
        return "Outro";
      default:
        return tipo;
    }
  };

  // Conversão em oportunidade
  const handleConvertToOportunidade = async () => {
    if (!apresentacaoToConvert) return;
    setConversaoLoading(true);
    try {
      await convertToOportunidade(
        apresentacaoToConvert.wishlist_item_id,
        {
          nome_lead: conversaoNome,
          valor: Number(conversaoValor),
          empresa_origem_id: apresentacaoToConvert.wishlist_item?.empresa_interessada_id,
          empresa_destino_id: apresentacaoToConvert.wishlist_item?.empresa_desejada_id,
        }
      );
      toast({ title: "Convertido em oportunidade!" });
      setConvertDialogOpen(false);
      setConversaoNome("");
      setConversaoValor("");
    } catch (err: any) {
      toast({
        title: "Erro na conversão",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
    }
    setConversaoLoading(false);
    setApresentacaoToConvert(null);
  };

  // Marcar como realizada
  const handleMarkRealizada = async () => {
    if (!apresentacaoToMarkRealizada) return;
    await updateApresentacao(apresentacaoToMarkRealizada.id, {
      status_apresentacao: "realizada",
    });
    toast({ title: "Apresentação marcada como realizada." });
    setMarkRealizadaDialogOpen(false);
    setApresentacaoToMarkRealizada(null);
    fetchApresentacoes();
  };

  // Excluir apresentação
  const handleDelete = async () => {
    if (!apresentacaoToDelete) return;
    // Simulação: você pode implementar a exclusão real conforme políticas de negócio
    toast({ title: "Exclusão não implementada", description: "Exclusão lógica pode ser implementada aqui." });
    setDeleteDialogOpen(false);
    setApresentacaoToDelete(null);
  };

  if (loadingApresentacoes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Carregando apresentações...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apresentações</h1>
          <p className="text-muted-foreground">
            Acompanhe apresentações e facilitações realizadas
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
              setModalOpen(true);
              setEditingApresentacao(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar Apresentação
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingApresentacao
                  ? "Editar Apresentação"
                  : "Registrar Nova Apresentação"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Facilitador</label>
                <Select
                  value={empresaFacilitadora}
                  onValueChange={setEmpresaFacilitadora}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa facilitadora" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasFacilitadoras.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Solicitação/Wishlist
                </label>
                <Select
                  value={wishlistItem}
                  onValueChange={setWishlistItem}
                  disabled={!!editingApresentacao}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a solicitação" />
                  </SelectTrigger>
                  <SelectContent>
                    {wishlistItemsDisponiveis.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.empresa_interessada?.nome} →{" "}
                        {item.empresa_desejada?.nome} (
                        {item.empresa_proprietaria?.nome})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Só aparecem solicitações aprovadas ou em andamento e ainda não apresentadas.
                </p>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Tipo de Apresentação
                </label>
                <Select
                  value={tipoApresentacao}
                  onValueChange={(v) =>
                    setTipoApresentacao(v as TipoApresentacao)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Status da Apresentação
                </label>
                <Select
                  value={statusApresentacao}
                  onValueChange={(v) =>
                    setStatusApresentacao(v as StatusApresentacao)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium mb-1">Data e Hora</label>
                <Input
                  type="datetime-local"
                  value={dataApresentacao}
                  onChange={(e) => setDataApresentacao(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Feedback (opcional)
                </label>
                <Input
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Feedback da apresentação"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="converteu_oportunidade"
                  checked={converteuOportunidade}
                  onChange={(e) => setConverteuOportunidade(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="converteu_oportunidade" className="text-sm">
                  Convertida em Oportunidade
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    modalLoading ||
                    !empresaFacilitadora ||
                    !wishlistItem ||
                    !tipoApresentacao ||
                    !statusApresentacao ||
                    !dataApresentacao
                  }
                >
                  {modalLoading && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  {editingApresentacao ? "Salvar Alterações" : "Registrar Apresentação"}
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
          onValueChange={(value: StatusApresentacao | "all") =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="agendada">Agendada</SelectItem>
            <SelectItem value="realizada">Realizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apresentacoes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                apresentacoes.filter((a) => a.status_apresentacao === "realizada")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                apresentacoes.filter((a) => a.status_apresentacao === "agendada")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <Badge variant="default">
              {
                apresentacoes.filter((a) => a.converteu_oportunidade).length
              }
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                apresentacoes.filter((a) => a.converteu_oportunidade).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Apresentações */}
      <div className="grid gap-4">
        {filteredApresentacoes.map((apresentacao) => (
          <Card key={apresentacao.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {apresentacao.wishlist_item?.empresa_interessada?.nome} →{" "}
                    {apresentacao.wishlist_item?.empresa_desejada?.nome}
                  </CardTitle>
                  <CardDescription>
                    Facilitado por: {apresentacao.empresa_facilitadora?.nome}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusColor(apresentacao.status_apresentacao)}>
                    {getStatusLabel(apresentacao.status_apresentacao)}
                  </Badge>
                  <Badge variant="outline">
                    {getTipoLabel(apresentacao.tipo_apresentacao)}
                  </Badge>
                  {apresentacao.converteu_oportunidade && (
                    <Badge variant="default">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Convertido
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(
                    new Date(apresentacao.data_apresentacao),
                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </div>
                {apresentacao.feedback && (
                  <div>
                    <p className="text-sm font-medium">Feedback:</p>
                    <p className="text-sm text-muted-foreground">
                      {apresentacao.feedback}
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2 flex-wrap">
                  {apresentacao.status_apresentacao === "realizada" &&
                    !apresentacao.converteu_oportunidade && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setApresentacaoToConvert(apresentacao);
                          setConvertDialogOpen(true);
                          setConversaoNome(
                            apresentacao.wishlist_item?.empresa_desejada?.nome ||
                              ""
                          );
                        }}
                        title="Converter em Oportunidade"
                      >
                        <CornerUpRight className="mr-1 h-4 w-4 text-green-600" />
                        Converter em Oportunidade
                      </Button>
                    )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingApresentacao(apresentacao);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Editar
                  </Button>
                  {apresentacao.status_apresentacao === "agendada" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setApresentacaoToMarkRealizada(apresentacao);
                        setMarkRealizadaDialogOpen(true);
                      }}
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Marcar como Realizada
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setApresentacaoToDelete(apresentacao);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
                <div className="flex text-xs justify-between pt-1 text-muted-foreground">
                  <span>
                    Criada em:{" "}
                    {apresentacao.created_at
                      ? format(
                          new Date(apresentacao.created_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )
                      : "--"}
                  </span>
                  <span>
                    Atualizada em:{" "}
                    {apresentacao.updated_at
                      ? format(
                          new Date(apresentacao.updated_at),
                          "dd/MM/yyyy HH:mm",
                          { locale: ptBR }
                        )
                      : "--"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredApresentacoes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Presentation className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma apresentação encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Registre a primeira apresentação"}
              </p>
              <Button
                onClick={() => {
                  setModalOpen(true);
                  setEditingApresentacao(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Apresentação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Converter em oportunidade */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Converter em Oportunidade</DialogTitle>
            <DialogDescription>
              Preencha os dados para converter esta apresentação em oportunidade.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome do lead"
              value={conversaoNome}
              onChange={(e) => setConversaoNome(e.target.value)}
              required
            />
            <Input
              placeholder="Valor (R$)"
              type="number"
              value={conversaoValor}
              onChange={(e) => setConversaoValor(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConvertDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConvertToOportunidade}
              disabled={!conversaoNome || !conversaoValor || conversaoLoading}
            >
              {conversaoLoading && (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              Converter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Marcar como Realizada */}
      <ConfirmDialog
        open={markRealizadaDialogOpen}
        onOpenChange={setMarkRealizadaDialogOpen}
        title="Marcar como Realizada"
        description="Deseja marcar esta apresentação como realizada?"
        onConfirm={handleMarkRealizada}
        confirmText="Marcar"
        cancelText="Cancelar"
      />
      {/* Excluir apresentação */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Apresentação"
        description="Tem certeza que deseja excluir esta apresentação? A exclusão lógica pode ser implementada aqui."
        onConfirm={handleDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default ApresentacoesPage;