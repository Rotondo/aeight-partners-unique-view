
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { supabase } from "@/lib/supabase";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: "novo" | "editar";
  editRelacionamentoId: string | null;
  parceirosSelecionados: string[];
  setParceirosSelecionados: (parceiros: string[]) => void;
  empresaCliente: string;
  setEmpresaCliente: (empresa: string) => void;
  observacoes: string;
  setObservacoes: (obs: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  modalLoading: boolean;
  empresasClientesOptions: EmpresaOption[];
  setEmpresasClientesOptions: (empresas: EmpresaOption[]) => void;
  empresasParceiros: EmpresaOption[];
  parceirosJaVinculadosAoCliente: (clienteId: string) => string[];
}

const ClienteFormModal: React.FC<ClienteFormModalProps> = ({
  isOpen,
  onClose,
  modalType,
  parceirosSelecionados,
  setParceirosSelecionados,
  empresaCliente,
  setEmpresaCliente,
  observacoes,
  setObservacoes,
  onSubmit,
  modalLoading,
  empresasClientesOptions,
  setEmpresasClientesOptions,
  empresasParceiros,
  parceirosJaVinculadosAoCliente,
}) => {
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState("");

  const handleCriarNovoCliente = async () => {
    if (!novoClienteNome.trim()) return;
    setCriandoNovoCliente(true);
    
    const existe = empresasClientesOptions.find(
      (c) =>
        c.nome.trim().toLowerCase() === novoClienteNome.trim().toLowerCase()
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
        .select("id")
        .single();
        
      if (!error && data) {
        clienteId = data.id;
        setEmpresasClientesOptions([
          ...empresasClientesOptions,
          { id: data.id, nome: novoClienteNome.trim(), tipo: "cliente" },
        ]);
      }
    }
    
    if (clienteId) setEmpresaCliente(clienteId);
    setNovoClienteNome("");
    setCriandoNovoCliente(false);
  };

  const parceirosDisponiveis = empresaCliente
    ? empresasParceiros.filter(
        (parceiro) =>
          !parceirosJaVinculadosAoCliente(empresaCliente).includes(parceiro.id) ||
          parceirosSelecionados.includes(parceiro.id)
      )
    : empresasParceiros;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modalType === "editar"
              ? "Editar Relacionamento"
              : "Novo Relacionamento Parceiro-Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Parceiro(s) / Proprietário(s)
            </label>
            <MultiSelect
              options={parceirosDisponiveis.map((p) => ({
                value: p.id,
                label: p.nome,
              }))}
              values={parceirosSelecionados}
              onChange={setParceirosSelecionados}
              disabled={modalType === "editar"}
              placeholder="Selecione um ou mais parceiros proprietários"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Cliente</label>
            <select
              value={empresaCliente}
              onChange={(e) => setEmpresaCliente(e.target.value)}
              disabled={modalType === "editar"}
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="" disabled>
                Selecione cliente
              </option>
              {empresasClientesOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                </option>
              ))}
            </select>
            <div className="flex mt-2 gap-2">
              <Input
                placeholder="Novo cliente"
                value={novoClienteNome}
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
              O cliente será criado e vinculado à base Aeight.
            </p>
          </div>
          <div>
            <label className="block font-medium mb-1">
              Observações (opcional)
            </label>
            <Input
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre o relacionamento"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                modalLoading ||
                parceirosSelecionados.length === 0 ||
                !empresaCliente
              }
            >
              {modalLoading && (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              )}
              {modalType === "editar"
                ? "Salvar Alterações"
                : "Criar Relacionamento(s)"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormModal;
