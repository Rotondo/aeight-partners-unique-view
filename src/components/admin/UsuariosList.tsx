import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Usuario, Empresa } from "@/types";
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
  DialogDescription,
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

export const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  
  const [currentUsuario, setCurrentUsuario] = useState<Partial<Usuario>>({
    nome: "",
    email: "",
    papel: "user",
    empresa_id: "",
    ativo: true
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsuarios(usuarios);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      setFilteredUsuarios(
        usuarios.filter(
          usuario =>
            usuario.nome.toLowerCase().includes(lowercasedTerm) ||
            usuario.email.toLowerCase().includes(lowercasedTerm) ||
            usuario.papel.toLowerCase().includes(lowercasedTerm) ||
            (usuario.empresa_id && empresas.find(e => e.id === usuario.empresa_id)?.nome.toLowerCase().includes(lowercasedTerm))
        )
      );
    }
  }, [searchTerm, usuarios, empresas]);

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
      
      // Buscar usuários
      const { data: usuariosData, error: usuariosError } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');
      
      if (usuariosError) throw usuariosError;
      setUsuarios(usuariosData || []);
      setFilteredUsuarios(usuariosData || []);
      
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

  const handleOpenForm = (usuario?: Usuario) => {
    if (usuario) {
      setCurrentUsuario(usuario);
      setIsEditing(true);
    } else {
      setCurrentUsuario({
        nome: "",
        email: "",
        papel: "user",
        empresa_id: "",
        ativo: true
      });
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentUsuario({
      nome: "",
      email: "",
      papel: "user",
      empresa_id: "",
      ativo: true
    });
    setIsEditing(false);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUsuario.nome || !currentUsuario.email) {
      toast({
        title: "Erro",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(currentUsuario.email)) {
      toast({
        title: "Erro",
        description: "Email inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && currentUsuario.id) {
        // Atualizar usuário
        const { error } = await supabase
          .from('usuarios')
          .update({ 
            nome: currentUsuario.nome,
            email: currentUsuario.email,
            papel: currentUsuario.papel,
            empresa_id: currentUsuario.empresa_id || null,
            ativo: currentUsuario.ativo
          })
          .eq('id', currentUsuario.id);
          
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        // Criar usuário
        // Nota: Na prática, precisaríamos chamar uma API para criar o usuário no sistema de autenticação
        // e então criar o registro na tabela usuarios
        toast({
          title: "Informação",
          description: "A criação de novos usuários deve ser feita através do cadastro de autenticação.",
        });
        
        // Na implementação real, isso seria substituído por uma chamada à API de criação de usuário
        // seguida pela criação do registro na tabela usuarios
      }
      
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Na prática, precisaríamos também excluir o usuário no sistema de autenticação
      const { error } = await supabase
        .from('usuarios')
        .update({ ativo: false })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Erro ao desativar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar o usuário.",
        variant: "destructive",
      });
    }
  };

  const getEmpresaNome = (empresaId?: string | null) => {
    if (!empresaId) return "-";
    const empresa = empresas.find(e => e.id === empresaId);
    return empresa ? empresa.nome : "-";
  };

  const getPapelBadge = (papel: string) => {
    switch (papel) {
      case 'admin':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500">Gerente</Badge>;
      case 'user':
        return <Badge>Usuário</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuários</CardTitle>
        <Button variant="default" size="sm" onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar usuário..."
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
        ) : !filteredUsuarios.length ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{getPapelBadge(usuario.papel)}</TableCell>
                    <TableCell>{getEmpresaNome(usuario.empresa_id)}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? "default" : "outline"} className={!usuario.ativo ? "text-muted-foreground" : ""}>
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleOpenForm(usuario)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title={usuario.ativo ? "Confirmar desativação" : "Confirmar ativação"}
                          description={
                            usuario.ativo 
                              ? "Tem certeza que deseja desativar este usuário?" 
                              : "Tem certeza que deseja ativar este usuário?"
                          }
                          onConfirm={() => {
                            if (usuario.ativo) {
                              handleDelete(usuario.id);
                            } else {
                              // Reativar usuário
                              supabase
                                .from('usuarios')
                                .update({ ativo: true })
                                .eq('id', usuario.id)
                                .then(() => {
                                  toast({
                                    title: "Sucesso",
                                    description: "Usuário ativado com sucesso!",
                                  });
                                  fetchData();
                                })
                                .catch((error) => {
                                  console.error('Erro ao ativar usuário:', error);
                                  toast({
                                    title: "Erro",
                                    description: "Não foi possível ativar o usuário.",
                                    variant: "destructive",
                                  });
                                });
                            }
                          }}
                          confirmText={usuario.ativo ? "Desativar" : "Ativar"}
                        >
                          <Button 
                            variant={usuario.ativo ? "destructive" : "default"} 
                            size="icon"
                          >
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
              {isEditing ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edite os dados do usuário."
                : "Preencha os dados para cadastrar um novo usuário."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={currentUsuario.nome || ""}
                onChange={(e) => setCurrentUsuario({...currentUsuario, nome: e.target.value})}
                placeholder="Nome do usuário"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUsuario.email || ""}
                onChange={(e) => setCurrentUsuario({...currentUsuario, email: e.target.value})}
                placeholder="Email do usuário"
                disabled={isEditing} // Não permitir edição de email para usuários existentes
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado para usuários existentes.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="papel">Papel</Label>
              <Select
                value={currentUsuario.papel || "user"}
                onValueChange={(value: "admin" | "user" | "manager") => 
                  setCurrentUsuario({...currentUsuario, papel: value})
                }
              >
                <SelectTrigger placeholder="Selecione o papel" />
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="empresa_id">Empresa</Label>
              {empresas.length > 0 ? (
                <Select
                  value={currentUsuario.empresa_id || undefined}
                  onValueChange={(value) => 
                    setCurrentUsuario({...currentUsuario, empresa_id: value || null})
                  }
                >
                  <SelectTrigger placeholder="Selecione a empresa" />
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Carregando empresas...
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={!!currentUsuario.ativo}
                onCheckedChange={(checked) => 
                  setCurrentUsuario({...currentUsuario, ativo: checked})
                }
              />
              <Label htmlFor="ativo">Ativo</Label>
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
