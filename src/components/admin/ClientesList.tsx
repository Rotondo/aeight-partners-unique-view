import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Empresa } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type TipoEmpresa = "cliente" | "parceiro" | "intragrupo";

export const ClientesList: React.FC = () => {
  const [clientes, setClientes] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "cliente" as TipoEmpresa,
  });
  const { toast } = useToast();

  // Novo filtro: tipo
  const [tipoFiltro, setTipoFiltro] = useState<TipoEmpresa | "all">("all");

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      let query = supabase.from("empresas").select("*").order("nome");
      if (tipoFiltro !== "all") {
        query = query.eq("tipo", tipoFiltro);
      }
      const { data, error } = await query;
      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refetch quando tipoFiltro muda
  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoFiltro]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    try {
      if (editingCliente) {
        const { error } = await supabase
          .from("empresas")
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            tipo: formData.tipo,
          })
          .eq("id", editingCliente.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Empresa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("empresas")
          .insert({
            nome: formData.nome,
            descricao: formData.descricao,
            tipo: formData.tipo,
            status: true,
          });

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Empresa criada com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingCliente(null);
      setFormData({ nome: "", descricao: "", tipo: "cliente" });
      fetchClientes();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente: Empresa) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      descricao: cliente.descricao || "",
      tipo: (cliente.tipo as TipoEmpresa) || "cliente",
    });
    setIsDialogOpen(true);
  };

  const handleNewCliente = () => {
    setEditingCliente(null);
    setFormData({ nome: "", descricao: "", tipo: "cliente" });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Empresas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCliente}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? "Editar Empresa" : "Nova Empresa"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição da empresa"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(tipo) => setFormData({ ...formData, tipo: tipo as TipoEmpresa })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente (base Aeight ou parceiro)</SelectItem>
                    <SelectItem value="parceiro">Parceiro</SelectItem>
                    <SelectItem value="intragrupo">Empresa intragrupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!formData.nome.trim()}>
                  {editingCliente ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={tipoFiltro} onValueChange={(tipo) => setTipoFiltro(tipo as TipoEmpresa | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="parceiro">Parceiro</SelectItem>
            <SelectItem value="intragrupo">Empresa intragrupo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Criação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.nome}</TableCell>
                <TableCell>{cliente.descricao || "-"}</TableCell>
                <TableCell>
                  {cliente.tipo === "cliente"
                    ? "Cliente"
                    : cliente.tipo === "parceiro"
                    ? "Parceiro"
                    : cliente.tipo === "intragrupo"
                    ? "Empresa intragrupo"
                    : cliente.tipo}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    cliente.status 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {cliente.status ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell>
                  {cliente.created_at ? formatDate(cliente.created_at) : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {filteredClientes.length === 0 && !loading && (
        <div className="text-center p-8 text-muted-foreground">
          {searchTerm ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada."}
        </div>
      )}
    </div>
  );
};
