
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { OnePager, Empresa, Categoria } from "@/types";
import { Plus, Edit, Trash2, Search, ExternalLink } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const OnePagerList: React.FC = () => {
  const [onepagers, setOnepagers] = useState<OnePager[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOnepagers, setFilteredOnepagers] = useState<OnePager[]>([]);
  
  const [currentOnepager, setCurrentOnepager] = useState<Partial<OnePager>>({
    empresa_id: "",
    categoria_id: "",
    url_imagem: "",
    arquivo_upload: "",
    data_upload: new Date().toISOString()
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOnepagers(onepagers);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredOnepagers(
        onepagers.filter(onepager => {
          const empresa = empresas.find(e => e.id === onepager.empresa_id);
          const categoria = categorias.find(c => c.id === onepager.categoria_id);
          return (
            (empresa && empresa.nome.toLowerCase().includes(lowercasedTerm)) ||
            (categoria && categoria.nome.toLowerCase().includes(lowercasedTerm))
          );
        })
      );
    }
  }, [searchTerm, onepagers, empresas, categorias]);

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
      
      // Buscar onepagers
      const { data: onepagersData, error: onepagersError } = await supabase
        .from('onepager')
        .select('*');
      
      if (onepagersError) throw onepagersError;
      setOnepagers(onepagersData || []);
      setFilteredOnepagers(onepagersData || []);
      
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

  const handleOpenForm = (onepager?: OnePager) => {
    if (onepager) {
      setCurrentOnepager(onepager);
      setIsEditing(true);
    } else {
      setCurrentOnepager({
        empresa_id: "",
        categoria_id: "",
        url_imagem: "",
        arquivo_upload: "",
        data_upload: new Date().toISOString()
      });
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentOnepager({
      empresa_id: "",
      categoria_id: "",
      url_imagem: "",
      arquivo_upload: "",
      data_upload: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOnepager.empresa_id || !currentOnepager.categoria_id) {
      toast({
        title: "Erro",
        description: "Empresa e categoria são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!currentOnepager.url_imagem && !currentOnepager.arquivo_upload) {
      toast({
        title: "Erro",
        description: "Você deve informar uma URL de imagem ou fazer upload de um arquivo.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentOnepager.id) {
        // Atualizar onepager
        const { error } = await supabase
          .from('onepager')
          .update({ 
            empresa_id: currentOnepager.empresa_id,
            categoria_id: currentOnepager.categoria_id,
            url_imagem: currentOnepager.url_imagem || null,
            arquivo_upload: currentOnepager.arquivo_upload || null,
            data_upload: new Date().toISOString()
          })
          .eq('id', currentOnepager.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "OnePager atualizado com sucesso!",
        });
      } else {
        // Criar onepager
        const { error } = await supabase
          .from('onepager')
          .insert({ 
            empresa_id: currentOnepager.empresa_id,
            categoria_id: currentOnepager.categoria_id,
            url_imagem: currentOnepager.url_imagem || null,
            arquivo_upload: currentOnepager.arquivo_upload || null,
            data_upload: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "OnePager criado com sucesso!",
        });
      }
      
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar OnePager:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o OnePager.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('onepager')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "OnePager excluído com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir OnePager:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o OnePager.",
        variant: "destructive",
      });
    }
  };

  const getEmpresaNome = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : "-";
  };

  const getCategoriaNome = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nome : "-";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>OnePagers</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo OnePager
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar OnePager..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !filteredOnepagers.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum OnePager encontrado." : "Nenhum OnePager cadastrado."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Upload</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOnepagers.map((onepager) => (
                  <TableRow key={onepager.id}>
                    <TableCell className="font-medium">{getEmpresaNome(onepager.empresa_id)}</TableCell>
                    <TableCell>{getCategoriaNome(onepager.categoria_id)}</TableCell>
                    <TableCell>{onepager.url_imagem ? "URL Externa" : onepager.arquivo_upload ? "Arquivo" : "-"}</TableCell>
                    <TableCell>{formatDate(onepager.data_upload)}</TableCell>
                    <TableCell>
                      {onepager.url_imagem && (
                        <a href={onepager.url_imagem} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
                          Ver <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                      {onepager.arquivo_upload && (
                        <span className="text-muted-foreground">Arquivo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenForm(onepager)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Confirmar exclusão"
                          description="Tem certeza que deseja excluir este OnePager?"
                          onConfirm={() => handleDelete(onepager.id)}
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
              {isEditing ? "Editar OnePager" : "Novo OnePager"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa</Label>
              <Select
                value={currentOnepager.empresa_id}
                onValueChange={(value) => 
                  setCurrentOnepager({...currentOnepager, empresa_id: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoria_id">Categoria</Label>
              <Select
                value={currentOnepager.categoria_id}
                onValueChange={(value) => 
                  setCurrentOnepager({...currentOnepager, categoria_id: value})
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url_imagem">URL da Imagem (opcional)</Label>
              <Input
                id="url_imagem"
                type="url"
                value={currentOnepager.url_imagem || ""}
                onChange={(e) => setCurrentOnepager({...currentOnepager, url_imagem: e.target.value})}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">
                Informe uma URL ou faça upload de um arquivo abaixo
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="arquivo_upload">Upload de Arquivo (opcional)</Label>
              <Input
                id="arquivo_upload"
                type="text"
                value={currentOnepager.arquivo_upload || ""}
                onChange={(e) => setCurrentOnepager({...currentOnepager, arquivo_upload: e.target.value})}
                placeholder="Nome do arquivo"
              />
              <p className="text-xs text-muted-foreground">
                O upload de arquivos seria implementado aqui
              </p>
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
