
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";

type User = Database["public"]["Tables"]["usuarios"]["Row"];
type UserRole = "admin" | "user" | "manager";

interface UsuariosListProps {
  empresaId: string | null;
}

export const UsuariosList: React.FC<UsuariosListProps> = ({ empresaId }) => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState<UserRole>("user");
  const [ativo, setAtivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, [empresaId]);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("usuarios").select("*").order("nome");

      if (empresaId) {
        query = query.eq("empresa_id", empresaId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setUsuarios(data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (usuario: User) => {
    setSelectedUser(usuario);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setPapel(usuario.papel);
    setAtivo(usuario.ativo);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    // NOVO: Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "E-mail inválido.",
        variant: "destructive",
      });
      return;
    }
    // NOVO: Validação de nome
    if (!nome || !nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    // NOVO: Validação de papel
    if (!papel || !["admin", "user"].includes(papel)) {
      toast({
        title: "Erro",
        description: "Papel inválido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("usuarios")
        .update({
          nome,
          email,
          papel,
          ativo,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });

      fetchUsuarios();
      handleCloseDialog();
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAtivo = (usuario: User) => {
    toast({
      title: "Confirmação",
      description: `Tem certeza que deseja ${
        usuario.ativo ? "desativar" : "ativar"
      } o usuário "${usuario.nome}"?`,
      variant: "destructive", // Changed from "warning" to "destructive"
    });

    // Implement logic to toggle 'ativo' status
    confirmToggleAtivo(usuario);
  };

  const confirmToggleAtivo = async (usuario: User) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do usuário atualizado com sucesso!",
      });

      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (usuario: User) => {
    toast({
      title: "Confirmação",
      description: `Tem certeza que deseja excluir o usuário "${usuario.nome}"?`,
      variant: "destructive", // Changed from "warning" to "destructive"
    });

    // Implement delete logic
    confirmDelete(usuario);
  };

  const confirmDelete = async (usuario: User) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", usuario.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Buscar usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Carregando...
              </TableCell>
            </TableRow>
          ) : filteredUsuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredUsuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.papel}</TableCell>
                <TableCell>
                  {usuario.ativo ? (
                    <UserCheck className="text-green-500 inline-block align-middle" />
                  ) : (
                    <UserX className="text-red-500 inline-block align-middle" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(usuario)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleAtivo(usuario)}
                  >
                    {usuario.ativo ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(usuario)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias e clique em salvar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                type="text"
                id="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Papel
              </Label>
              <Select 
                value={papel} 
                onValueChange={(value: UserRole) => setPapel(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ativo" className="text-right">
                Ativo
              </Label>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" onClick={handleCloseDialog}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
