import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empresa, TipoEmpresa, Usuario } from "@/types";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface UsuarioComEmpresa extends Usuario {
  empresa?: {
    nome: string;
  };
}

export const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioComEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingUsuario, setIsAddingUsuario] = useState(false);
  const [isEditingUsuario, setIsEditingUsuario] = useState<string | null>(null);
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<"admin" | "user" | "manager">("user");
  const [empresaId, setEmpresaId] = useState<string | undefined>(undefined);
  const [ativo, setAtivo] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select(`
          *,
          empresa:empresas(nome)
        `)
        .order("nome");

      if (error) throw error;
      setUsuarios(data as UsuarioComEmpresa[]);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (error) throw error;
      
      // Convert the raw data to match the Empresa type
      const typedData: Empresa[] = data.map(item => ({
        ...item,
        tipo: item.tipo as TipoEmpresa
      }));
      
      setEmpresas(typedData);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  const handleAddUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            papel,
            empresa_id: empresaId
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Erro ao criar usuário na autenticação");
      }

      // Then create the user in the public schema
      const { data, error } = await supabase
        .from("usuarios")
        .insert([
          { 
            id: authData.user.id,
            nome, 
            email, 
            papel, 
            empresa_id: empresaId, 
            ativo 
          }
        ])
        .select(`
          *,
          empresa:empresas(nome)
        `);

      if (error) {
        // If the user insert fails, we should try to delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário adicionado com sucesso!",
      });
      
      setUsuarios([...usuarios, data[0] as UsuarioComEmpresa]);
      resetForm();
      setIsAddingUsuario(false);
    } catch (error) {
      console.error("Erro ao adicionar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleEditUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingUsuario) return;

    try {
      let updates: any = { 
        nome, 
        papel, 
        empresa_id: empresaId, 
        ativo 
      };

      const { data, error } = await supabase
        .from("usuarios")
        .update(updates)
        .eq("id", isEditingUsuario)
        .select(`
          *,
          empresa:empresas(nome)
        `);

      if (error) throw error;

      // If password was provided, update it as well
      if (senha) {
        try {
          const { error: authError } = await supabase.auth.admin.updateUserById(
            isEditingUsuario,
            { password: senha }
          );
          if (authError) throw authError;
        } catch (authError) {
          console.error("Erro ao atualizar senha:", authError);
          toast({
            title: "Aviso",
            description: "Usuário atualizado, mas não foi possível alterar a senha.",
            variant: "warning"
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      
      setUsuarios(
        usuarios.map((user) =>
          user.id === isEditingUsuario
            ? data[0] as UsuarioComEmpresa
            : user
        )
      );
      
      resetForm();
      setIsEditingUsuario(null);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      // First delete from public schema
      const { error: publicError } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (publicError) throw publicError;

      // Then delete from auth
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
          console.error("Erro ao excluir usuário da autenticação:", authError);
          toast({
            title: "Aviso",
            description: "Usuário excluído do sistema, mas pode haver resíduos na autenticação.",
            variant: "warning"
          });
        }
      } catch (authError) {
        console.error("Erro ao excluir usuário da autenticação:", authError);
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
      
      setUsuarios(usuarios.filter((usuario) => usuario.id !== id));
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (usuario: UsuarioComEmpresa) => {
    setNome(usuario.nome);
    setEmail(usuario.email);
    setSenha("");
    setPapel(usuario.papel);
    setEmpresaId(usuario.empresa_id);
    setAtivo(usuario.ativo);
    setIsEditingUsuario(usuario.id);
  };

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setPapel("user");
    setEmpresaId(undefined);
    setAtivo(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usuários</h2>
        <Button onClick={() => setIsAddingUsuario(true)}>Novo Usuário</Button>
      </div>

      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.papel}</TableCell>
                <TableCell>{usuario.empresa?.nome}</TableCell>
                <TableCell>{usuario.ativo ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(usuario)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUsuario(usuario.id)}
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

      {/* Dialog para adicionar usuário */}
      <Dialog open={isAddingUsuario} onOpenChange={setIsAddingUsuario}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUsuario} className="space-y-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="papel">Papel</Label>
              <Select 
                value={papel} 
                onValueChange={(value) => setPapel(value as "admin" | "user" | "manager")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa</Label>
              <Select 
                value={empresaId || ""} 
                onValueChange={(value) => setEmpresaId(value === "" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={ativo}
                onCheckedChange={(checked) => setAtivo(checked as boolean)}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingUsuario(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuário */}
      <Dialog open={!!isEditingUsuario} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setIsEditingUsuario(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUsuario} className="space-y-4">
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-senha">Senha</Label>
              <Input
                id="edit-senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Nova senha (deixe em branco para manter a atual)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-papel">Papel</Label>
              <Select 
                value={papel} 
                onValueChange={(value) => setPapel(value as "admin" | "user" | "manager")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-empresaId">Empresa</Label>
              <Select 
                value={empresaId || ""} 
                onValueChange={(value) => setEmpresaId(value === "" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-ativo"
                checked={ativo}
                onCheckedChange={(checked) => setAtivo(checked as boolean)}
              />
              <Label htmlFor="edit-ativo">Ativo</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditingUsuario(null);
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
