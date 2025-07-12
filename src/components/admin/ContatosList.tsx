import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empresa, TipoEmpresa } from "@/types";
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

interface Contato {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  empresa_id: string;
  empresa?: {
    nome: string;
  };
}

export const ContatosList: React.FC = () => {
  console.log('Admin ContatosList: Componente carregado');
  
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingContato, setIsAddingContato] = useState(false);
  const [isEditingContato, setIsEditingContato] = useState<string | null>(null);
  
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    console.log('Admin ContatosList: useEffect executado');
    fetchContatos();
    fetchEmpresas();
  }, []);

  const fetchContatos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contatos")
        .select(`
          *,
          empresa:empresas(nome)
        `)
        .order("nome");

      if (error) throw error;
      setContatos(data as Contato[]);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos.",
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

  const handleAddContato = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("contatos")
        .insert([
          { 
            nome, 
            telefone, 
            email, 
            empresa_id: empresaId 
          }
        ])
        .select(`
          *,
          empresa:empresas(nome)
        `);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso!",
      });
      
      setContatos([...contatos, data[0] as Contato]);
      resetForm();
      setIsAddingContato(false);
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o contato.",
        variant: "destructive",
      });
    }
  };

  const handleEditContato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingContato) return;

    try {
      const { data, error } = await supabase
        .from("contatos")
        .update({ 
          nome, 
          telefone, 
          email, 
          empresa_id: empresaId 
        })
        .eq("id", isEditingContato)
        .select(`
          *,
          empresa:empresas(nome)
        `);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso!",
      });
      
      setContatos(
        contatos.map((cont) =>
          cont.id === isEditingContato
            ? data[0] as Contato
            : cont
        )
      );
      
      resetForm();
      setIsEditingContato(null);
    } catch (error) {
      console.error("Erro ao atualizar contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o contato.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContato = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;

    try {
      const { error } = await supabase
        .from("contatos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Contato excluído com sucesso!",
      });
      
      setContatos(contatos.filter((contato) => contato.id !== id));
    } catch (error) {
      console.error("Erro ao excluir contato:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o contato.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (contato: Contato) => {
    setNome(contato.nome);
    setTelefone(contato.telefone || "");
    setEmail(contato.email || "");
    setEmpresaId(contato.empresa_id);
    setIsEditingContato(contato.id);
  };

  const resetForm = () => {
    setNome("");
    setTelefone("");
    setEmail("");
    setEmpresaId("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contatos</h2>
        <Button onClick={() => setIsAddingContato(true)}>Novo Contato</Button>
      </div>

      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contatos.map((contato) => (
              <TableRow key={contato.id}>
                <TableCell>{contato.nome}</TableCell>
                <TableCell>{contato.telefone}</TableCell>
                <TableCell>{contato.email}</TableCell>
                <TableCell>{contato.empresa?.nome}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(contato)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteContato(contato.id)}
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

      {/* Dialog para adicionar contato */}
      <Dialog open={isAddingContato} onOpenChange={setIsAddingContato}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContato} className="space-y-4">
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
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresaId">Empresa</Label>
              <Select 
                value={empresaId} 
                onValueChange={(value) => setEmpresaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddingContato(false);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar contato */}
      <Dialog open={!!isEditingContato} onOpenChange={(open) => {
        if (!open) {
          resetForm();
          setIsEditingContato(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditContato} className="space-y-4">
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
              <Label htmlFor="edit-telefone">Telefone</Label>
              <Input
                id="edit-telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-empresaId">Empresa</Label>
              <Select 
                value={empresaId} 
                onValueChange={(value) => setEmpresaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditingContato(null);
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
