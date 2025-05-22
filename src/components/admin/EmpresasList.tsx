import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// NOVO: tipo para categoria
type Categoria = {
  id: string;
  nome: string;
};

export const EmpresasList: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEmpresa, setIsAddingEmpresa] = useState(false);
  const [isEditingEmpresa, setIsEditingEmpresa] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<EmpresaTipoString>("parceiro");
  const [status, setStatus] = useState(true);

  // NOVO: categoria selecionada
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
    fetchCategorias();
  }, []);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (error) throw error;

      setEmpresas(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // NOVO: buscar categorias
  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome")
      .order("nome");
    if (!error && data) setCategorias(data);
  };

  // NOVO: buscar categoria já vinculada (ao editar)
  const fetchEmpresaCategoria = async (empresaId: string) => {
    const { data, error } = await supabase
      .from("empresa_categoria")
      .select("categoria_id")
      .eq("empresa_id", empresaId)
      .single();
    if (!error && data) {
      setCategoriaId(data.categoria_id);
    } else {
      setCategoriaId(null);
    }
  };

  // Adicionar empresa
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
            status,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // NOVO: vincular categoria
      if (categoriaId) {
        await supabase
          .from("empresa_categoria")
          .insert({ empresa_id: data.id, categoria_id: categoriaId });
      }

      toast({
        title: "Sucesso",
        description: "Empresa adicionada com sucesso!",
      });
      setEmpresas([...empresas, data]);
      resetForm();
      setIsAddingEmpresa(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a empresa.",
        variant: "destructive",
      });
    }
  };

  // Editar empresa
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
          status,
        })
        .eq("id", isEditingEmpresa);

      if (error) throw error;

      // NOVO: atualizar categoria
      if (categoriaId) {
        // remove vínculos antigos
        await supabase
          .from("empresa_categoria")
          .delete()
          .eq("empresa_id", isEditingEmpresa);
        // insere novo
        await supabase
          .from("empresa_categoria")
          .insert({ empresa_id: isEditingEmpresa, categoria_id: categoriaId });
      } else {
        // remove vínculos se nenhum selecionado
        await supabase
          .from("empresa_categoria")
          .delete()
          .eq("empresa_id", isEditingEmpresa);
      }

      toast({
        title: "Sucesso",
        description: "Empresa atualizada com sucesso!",
      });
      fetchEmpresas();
      resetForm();
      setIsEditingEmpresa(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a empresa.",
        variant: "destructive",
      });
    }
  };

  // Excluir empresa
  const handleDeleteEmpresa = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;
    try {
      const { error } = await supabase.from("empresas").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso!",
      });
      setEmpresas(empresas.filter((empresa) => empresa.id !== id));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a empresa. Verifique se ela está sendo referenciada em outros registros.",
        variant: "destructive",
      });
    }
  };

  // Iniciar edição
  const startEditing = (empresa: Empresa) => {
    setNome(empresa.nome);
    setDescricao(empresa.descricao || "");
    setTipo(empresa.tipo);
    setStatus(empresa.status);
    setIsEditingEmpresa(empresa.id);
    fetchEmpresaCategoria(empresa.id);
  };

  // Resetar formulário
  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTipo("parceiro");
    setStatus(true);
    setCategoriaId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Empresas</h2>
        <Button onClick={() => { resetForm(); setIsAddingEmpresa(true); }}>Nova Empresa</Button>
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
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(value) => setTipo(value as EmpresaTipoString)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="integrupo">Integrupo</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={categoriaId || ""}
                onValueChange={(value) => setCategoriaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Checkbox
                id="status"
                checked={status}
                onCheckedChange={(checked) => setStatus(!!checked)}
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
      <Dialog open={!!isEditingEmpresa} onOpenChange={(v) => { if (!v) { setIsEditingEmpresa(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEmpresa} className="space-y-4">
            <div>
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-descricao">Descrição</Label>
              <Input
                id="edit-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-tipo">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(value) => setTipo(value as EmpresaTipoString)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="integrupo">Integrupo</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-categoria">Categoria</Label>
              <Select
                value={categoriaId || ""}
                onValueChange={(value) => setCategoriaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Checkbox
                id="edit-status"
                checked={status}
                onCheckedChange={(checked) => setStatus(!!checked)}
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
