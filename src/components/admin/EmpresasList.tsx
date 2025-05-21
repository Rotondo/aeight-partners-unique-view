import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empresa, EmpresaTipoString, TipoEmpresa } from "@/types";
import { useToast } from "@/hooks/use-toast";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const EmpresasList: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmpresa, setIsAddingEmpresa] = useState(false);
  const [isEditingEmpresa, setIsEditingEmpresa] = useState<string | null>(null);
  
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<EmpresaTipoString>("parceiro");
  const [status, setStatus] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (error) throw error;
      
      // Convert the raw data to match the Empresa type
      const newEmpresas = data.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        tipo: item.tipo as TipoEmpresa,
        status: item.status,
        created_at: item.created_at
      }));
      
      setEmpresas(newEmpresas);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("empresas")
        .insert([
          { 
            nome, 
            descricao, 
            tipo, 
            status 
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa adicionada com sucesso!",
      });
      
      setEmpresas([...empresas, {
        id: data[0].id,
        nome,
        descricao,
        tipo,
        status,
        created_at: data[0].created_at
      }]);
      
      resetForm();
      setIsAddingEmpresa(false);
    } catch (error) {
      console.error("Erro ao adicionar empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleEditEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingEmpresa) return;

    try {
      const { error } = await supabase
        .from("empresas")
        .update({ 
          nome, 
          descricao, 
          tipo, 
          status 
        })
        .eq("id", isEditingEmpresa);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!",
      });
      
      setEmpresas(
        empresas.map((emp) =>
          emp.id === isEditingEmpresa
            ? { ...emp, nome, descricao, tipo, status }
            : emp
        )
      );
      
      resetForm();
      setIsEditingEmpresa(null);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const { error } = await supabase
        .from("empresas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso!",
      });
      
      setEmpresas(empresas.filter((empresa) => empresa.id !== id));
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a empresa. Verifique se ela está sendo referenciada em outros registros.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (empresa: Empresa) => {
    setNome(empresa.nome);
    setDescricao(empresa.descricao || "");
    setTipo(empresa.tipo);
    setStatus(empresa.status);
    setIsEditingEmpresa(empresa.id);
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTipo("parceiro");
    setStatus(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Empresas</h2>
        <Button onClick={() => setIsAddingEmpresa(true)}>Nova Empresa</Button>
      </div>

      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>{empresa.nome}</TableCell>
                <TableCell>{empresa.tipo}</TableCell>
                <TableCell>{empresa.descricao}</TableCell>
                <TableCell>{empresa.status ? "Ativo" : "Inativo"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(empresa)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEmpresa(empresa.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Dialog para adicionar empresa */}
      <Dialog open={isAddingEmpresa} onOpenChange={setIsAddingEmpresa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEmpresa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select 
                value={tipo} 
                onValueChange={(value) => setTipo(value as EmpresaTipoString)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intragrupo">Intragrupo</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={status}
                onCheckedChange={(checked) => setStatus(checked as boolean)}
              />
              <Label htmlFor="status">Ativo</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingEmpresa(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar empresa */}
      <Dialog open={!!isEditingEmpresa} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setIsEditingEmpresa(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEmpresa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Select 
                value={tipo} 
                onValueChange={(value) => setTipo(value as EmpresaTipoString)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intragrupo">Intragrupo</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-status"
                checked={status}
                onCheckedChange={(checked) => setStatus(checked as boolean)}
              />
              <Label htmlFor="edit-status">Ativo</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditingEmpresa(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
