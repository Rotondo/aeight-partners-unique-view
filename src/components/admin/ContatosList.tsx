
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Contato, Empresa } from "@/types";
import { Plus, Edit, Trash2, Search } from "lucide-react";
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

export const ContatosList: React.FC = () => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredContatos, setFilteredContatos] = useState<Contato[]>([]);
  
  const [currentContato, setCurrentContato] = useState<Partial<Contato>>({
    nome: "",
    email: "",
    telefone: "",
    empresa_id: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredContatos(contatos);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredContatos(
        contatos.filter(
          contato =>
            contato.nome.toLowerCase().includes(lowercasedTerm) ||
            contato.email.toLowerCase().includes(lowercasedTerm) ||
            contato.telefone.toLowerCase().includes(lowercasedTerm) ||
            empresas.find(e => e.id === contato.empresa_id)?.nome.toLowerCase().includes(lowercasedTerm)
        )
      );
    }
  }, [searchTerm, contatos, empresas]);

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
      
      // Buscar contatos
      const { data: contatosData, error: contatosError } = await supabase
        .from('contatos')
        .select('*')
        .order('nome');
      
      if (contatosError) throw contatosError;
      setContatos(contatosData || []);
      setFilteredContatos(contatosData || []);
      
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

  const handleOpenForm = (contato?: Contato) => {
    if (contato) {
      setCurrentContato(contato);
      setIsEditing(true);
    } else {
      setCurrentContato({
        nome: "",
        email: "",
        telefone: "",
        empresa_id: ""
      });
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentContato({
      nome: "",
      email: "",
      telefone: "",
      empresa_id: ""
    });
    setIsEditing(false);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentContato.nome || !currentContato.email || !currentContato.telefone || !currentContato.empresa_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(currentContato.email)) {
      toast({
        title: "Erro",
        description: "Email inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentContato.id) {
        // Atualizar contato
        const { error } = await supabase
          .from('contatos')
          .update({ 
            nome: currentContato.nome,
            email: currentContato.email,
            telefone: currentContato.telefone,
            empresa_id: currentContato.empresa_id
          })
          .eq('id', currentContato.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Contato atualizado com sucesso!",
        });
      } else {
        // Criar contato
        const { error } = await supabase
          .from('contatos')
          .insert({ 
            nome: currentContato.nome,
            email: currentContato.email,
            telefone: currentContato.telefone,
            empresa_id: currentContato.empresa_id
          });
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Contato criado com sucesso!",
        });
      }
      
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o contato.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contatos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato.",
        variant: "destructive",
      });
    }
  };

  const getEmpresaNome = (empresaId: string) => {
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : "-";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contatos</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Contato
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contato..."
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
        ) : !filteredContatos.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum contato encontrado." : "Nenhum contato cadastrado."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContatos.map((contato) => (
                  <TableRow key={contato.id}>
                    <TableCell className="font-medium">{contato.nome}</TableCell>
                    <TableCell>{contato.email}</TableCell>
                    <TableCell>{contato.telefone}</TableCell>
                    <TableCell>{getEmpresaNome(contato.empresa_id)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenForm(contato)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Confirmar exclusão"
                          description="Tem certeza que deseja excluir este contato?"
                          onConfirm={() => handleDelete(contato.id)}
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
              {isEditing ? "Editar Contato" : "Novo Contato"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa</Label>
              <Select
                value={currentContato.empresa_id}
                onValueChange={(value) => 
                  setCurrentContato({...currentContato, empresa_id: value})
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
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={currentContato.nome || ""}
                onChange={(e) => setCurrentContato({...currentContato, nome: e.target.value})}
                placeholder="Nome do contato"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentContato.email || ""}
                onChange={(e) => setCurrentContato({...currentContato, email: e.target.value})}
                placeholder="Email do contato"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={currentContato.telefone || ""}
                onChange={(e) => setCurrentContato({...currentContato, telefone: e.target.value})}
                placeholder="Telefone do contato"
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
