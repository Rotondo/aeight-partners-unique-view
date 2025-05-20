
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Categoria } from "@/types";
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

export const CategoriasList: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Partial<Categoria>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (categoria?: Categoria) => {
    if (categoria) {
      setCurrentCategoria(categoria);
      setIsEditing(true);
    } else {
      setCurrentCategoria({});
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentCategoria({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCategoria.nome) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentCategoria.id) {
        const { error } = await supabase
          .from('categorias')
          .update({ 
            nome: currentCategoria.nome,
            descricao: currentCategoria.descricao 
          })
          .eq('id', currentCategoria.id);
          
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('categorias')
          .insert({ 
            nome: currentCategoria.nome,
            descricao: currentCategoria.descricao 
          });
          
        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso!",
        });
      }
      
      handleCloseForm();
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a categoria.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
      fetchCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria. Verifique se há registros associados.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categorias</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !categorias.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Nenhuma categoria cadastrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.nome}</TableCell>
                  <TableCell>{categoria.descricao || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleOpenForm(categoria)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Confirmar exclusão"
                        description="Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita."
                        onConfirm={() => handleDelete(categoria.id)}
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
        )}
      </CardContent>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={currentCategoria.nome || ""}
                onChange={(e) => setCurrentCategoria({...currentCategoria, nome: e.target.value})}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={currentCategoria.descricao || ""}
                onChange={(e) => setCurrentCategoria({...currentCategoria, descricao: e.target.value})}
                placeholder="Descrição da categoria"
              />
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
