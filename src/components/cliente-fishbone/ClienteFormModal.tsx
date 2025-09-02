import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}
interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresasIntragrupo: EmpresaOption[];
  onClienteCriado: (cliente: { id: string; nome: string; empresa: EmpresaOption }) => void;
}

const ClienteFormModal: React.FC<ClienteFormModalProps> = ({
  isOpen,
  onClose,
  empresasIntragrupo,
  onClienteCriado,
}) => {
  const [clienteNome, setClienteNome] = useState("");
  const [empresaId, setEmpresaId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleCriarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!clienteNome.trim() || !empresaId) {
      setErro("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      // Cria cliente na tabela empresas
      const { data, error } = await supabase
        .from("empresas")
        .insert({
          nome: clienteNome.trim(),
          tipo: "cliente",
          status: true,
        })
        .select("id, nome")
        .single();

      if (error || !data?.id) {
        setErro("Erro ao criar cliente.");
        return;
      }

      // Vincula cliente à empresa intragrupo no relacionamento
      await supabase
        .from("empresa_clientes")
        .insert({
          empresa_cliente_id: data.id,
          empresa_proprietaria_id: empresaId,
          status: true,
          data_relacionamento: new Date().toISOString(),
        });

      // Retorna para o parent
      const empresaObj = empresasIntragrupo.find((e) => e.id === empresaId) || null;
      onClienteCriado({ id: data.id, nome: data.nome, empresa: empresaObj });
      setClienteNome("");
      setEmpresaId("");
      onClose();
    } catch (err) {
      setErro("Erro ao criar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCriarCliente} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nome do Cliente</label>
            <Input
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Empresa Intragrupo</label>
            <Select value={empresaId} onValueChange={setEmpresaId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresasIntragrupo.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {erro && (
            <div className="text-xs text-red-500">{erro}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !clienteNome.trim() || !empresaId}>
              {loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Criar Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormModal;