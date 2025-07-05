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
import { Plus, Loader2, Trash2, Star } from "lucide-react";
import { WishlistItem } from "@/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { toSafeString, toSafeNumber } from "@/utils/wishlistUtils";

type EmpresaOption = {
  id: string;
  nome: string;
  tipo: string;
};

interface WishlistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: WishlistItem | null;
  onItemSaved: () => void;
  onItemDeleted: (itemId: string) => void;
}

const WishlistFormModal: React.FC<WishlistFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onItemSaved,
  onItemDeleted,
}) => {
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  // Buscar empresas para o formulário
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

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
      resetForm();
    }
  }, [editingItem]);

  useEffect(() => {
    if (empresaDesejada) {
      const clienteNome = empresasClientes.find(c => c.id === empresaDesejada)?.nome || "";
      setEmpresaDesejadaNome(clienteNome);
    } else {
      setEmpresaDesejadaNome("");
    }
  }, [empresaDesejada, empresasClientes]);

  const resetForm = () => {
    setEmpresaInteressada("");
    setEmpresaDesejada("");
    setEmpresaDesejadaNome("");
    setEmpresaProprietaria("");
    setPrioridade(3);
    setMotivo("");
    setObservacoes("");
    setNovoClienteNome("");
    setFormError(null);
  };

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
        const { error } = await supabase
          .from("wishlist_items")
          .update({
            empresa_interessada_id: empresaInteressada,
            empresa_desejada_id: empresaDesejada,
            empresa_proprietaria_id: empresaProprietaria,
            prioridade,
            motivo,
            observacoes,
          })
          .eq("id", editingItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("wishlist_items")
          .insert({
            empresa_interessada_id: empresaInteressada,
            empresa_desejada_id: empresaDesejada,
            empresa_proprietaria_id: empresaProprietaria,
            prioridade,
            motivo,
            observacoes,
            status: "pendente",
            data_solicitacao: new Date().toISOString(),
          });
        
        if (error) throw error;
      }

      onClose();
      onItemSaved();
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
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    if (!window.confirm("Tem certeza que deseja excluir este item da wishlist?")) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", editingItem.id);
      
      if (error) throw error;
      
      onItemDeleted(editingItem.id);
      onClose();
      toast({
        title: "Item excluído",
        description: "O item foi removido da wishlist.",
      });
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

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  {empresaDesejada ? empresaDesejadaNome : undefined}
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
                onClick={handleDelete}
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
  );
};

export default WishlistFormModal;