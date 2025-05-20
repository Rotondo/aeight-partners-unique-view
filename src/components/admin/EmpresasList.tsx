
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Categoria, Empresa, TipoEmpresa } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const EmpresasList: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [empresasCategorias, setEmpresasCategorias] = useState<Record<string, string[]>>({});
  
  const [currentEmpresa, setCurrentEmpresa] = useState<Partial<Empresa>>({
    nome: "",
    descricao: "",
    tipo: "parceiro",
    status: true
  });
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');
      
      if (empresasError) throw empresasError;
      setEmpresas(empresasData || []);
      
      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);
      
      // Buscar relacionamentos empresa-categoria
      const { data: relData, error: relError } = await supabase
        .from('empresa_categoria')
        .select('*');
      
      if (relError) throw relError;
      
      // Criar mapa de empresa => categorias
      const categoriasMap: Record<string, string[]> = {};
      if (relData) {
        relData.forEach(rel => {
          if (!categoriasMap[rel.empresa_id]) {
            categoriasMap[rel.empresa_id] = [];
          }
          categoriasMap[rel.empresa_id].push(rel.categoria_id);
        });
      }
      setEmpresasCategorias(categoriasMap);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (empresa?: Empresa) => {
    if (empresa) {
      setCurrentEmpresa(empresa);
      setSelectedCategorias(empresasCategorias[empresa.id] || []);
      setIsEditing(true);
    } else {
      setCurrentEmpresa({
        nome: "",
        descricao: "",
        tipo: "parceiro",
        status: true
      });
      setSelectedCategorias([]);
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentEmpresa({
      nome: "",
      descricao: "",
      tipo: "parceiro",
      status: true
    });
    setSelectedCategorias([]);
    setIsEditing(false);
  };

  const handleCategoriaToggle = (categoriaId: string) => {
    setSelectedCategorias(prev => 
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEmpresa.nome) {
      toast({
        title: "Erro",
        description: "Nome da empresa é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      let empresaId: string;
      
      if (isEditing && currentEmpresa.id) {
        // Atualizar empresa
        const { error } = await supabase
          .from('empresas')
          .update({ 
            nome: currentEmpresa.nome,
            descricao: currentEmpresa.descricao,
            tipo: currentEmpresa.tipo,
            status: currentEmpresa.status
          })
          .eq('id', currentEmpresa.id);
          
        if (error) throw error;
        empresaId = currentEmpresa.id;
        
        // Remover todas as categorias existentes
        const { error: delError } = await supabase
          .from('empresa_categoria')
          .delete()
          .eq('empresa_id', empresaId);
          
        if (delError) throw delError;
        
        toast({
          title: "Sucesso",
          description: "Empresa atualizada com sucesso!",
        });
      } else {
        // Criar empresa
        const { data, error } = await supabase
          .from('empresas')
          .insert({ 
            nome: currentEmpresa.nome,
            descricao: currentEmpresa.descricao,
            tipo: currentEmpresa.tipo,
            status: currentEmpresa.status
          })
          .select('id')
          .single();
          
        if (error) throw error;
        empresaId = data.id;
        
        toast({
          title: "Sucesso",
          description: "Empresa criada com sucesso!",
        });
      }
      
      // Inserir novas categorias
      if (selectedCategorias.length > 0) {
        const categoriasToInsert = selectedCategorias.map(categoriaId => ({
          empresa_id: empresaId,
          categoria_id: categoriaId
        }));
        
        const { error: insError } = await supabase
          .from('empresa_categoria')
          .insert(categoriasToInsert);
          
        if (insError) throw insError;
      }
      
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a empresa.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Excluir relacionamentos primeiro
      await supabase
        .from('empresa_categoria')
        .delete()
        .eq('empresa_id', id);
        
      // Excluir empresa
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a empresa. Verifique se há registros associados.",
        variant: "destructive",
      });
    }
  };

  const getTipoBadge = (tipo: TipoEmpresa) => {
    switch (tipo) {
      case 'intragrupo':
        return <Badge className="bg-blue-500">Intragrupo</Badge>;
      case 'parceiro':
        return <Badge className="bg-green-500">Parceiro</Badge>;
      case 'cliente':
        return <Badge className="bg-orange-500">Cliente</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getCategorias = (empresaId: string) => {
    const catIds = empresasCategorias[empresaId] || [];
    if (catIds.length === 0) return "-";
    
    return catIds.map(catId => {
      const categoria = categorias.find(c => c.id === catId);
      return categoria ? categoria.nome : "";
    }).filter(Boolean).join(", ");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Empresas</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Empresa
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !empresas.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Nenhuma empresa cadastrada.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {empresas.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">{empresa.nome}</TableCell>
                    <TableCell>{getTipoBadge(empresa.tipo)}</TableCell>
                    <TableCell>{getCategorias(empresa.id)}</TableCell>
                    <TableCell>
                      <Badge variant={empresa.status ? "default" : "outline"}>
                        {empresa.status ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenForm(empresa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Confirmar exclusão"
                          description="Tem certeza que deseja excluir esta empresa? Todos os dados associados também serão excluídos."
                          onConfirm={() => handleDelete(empresa.id)}
                        >
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={currentEmpresa.nome || ""}
                onChange={(e) => setCurrentEmpresa({...currentEmpresa, nome: e.target.value})}
                placeholder="Nome da empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={currentEmpresa.tipo || "parceiro"}
                onValueChange={(value: TipoEmpresa) => 
                  setCurrentEmpresa({...currentEmpresa, tipo: value})
                }
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
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={currentEmpresa.descricao || ""}
                onChange={(e) => setCurrentEmpresa({...currentEmpresa, descricao: e.target.value})}
                placeholder="Descrição da empresa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categorias">Categorias</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCategorias.length > 0 
                      ? `${selectedCategorias.length} categorias selecionadas` 
                      : "Selecionar categorias"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Categorias</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categorias.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm">
                      Nenhuma categoria disponível
                    </div>
                  ) : (
                    categorias.map((categoria) => (
                      <DropdownMenuCheckboxItem
                        key={categoria.id}
                        checked={selectedCategorias.includes(categoria.id)}
                        onCheckedChange={() => handleCategoriaToggle(categoria.id)}
                      >
                        {categoria.nome}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={currentEmpresa.status}
                onCheckedChange={(checked) => 
                  setCurrentEmpresa({...currentEmpresa, status: checked})
                }
              />
              <Label htmlFor="status">Ativo</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
