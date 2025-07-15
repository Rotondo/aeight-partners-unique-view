import React, { useState, useEffect } from "react";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, RefreshCw, Edit, Trash, Eye, Download } from "lucide-react";
import { Empresa, EmpresaTipoString } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivateData } from "@/components/privacy/PrivateData";

// Categoria type
 type Categoria = { id: string; nome: string };

const EmpresasPage: React.FC = () => {
  // ... estados já existentes ...
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contatos, setContatos] = useState<any[]>([]);
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("todas");
  const [sortColumn, setSortColumn] = useState<string>("nome");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { toast } = useToast();

  // --- Estados para edição ---
  const [isEditingEmpresa, setIsEditingEmpresa] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<EmpresaTipoString>("parceiro");
  const [status, setStatus] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<string | undefined>(undefined);

  // ... funções já existentes ...
  // (mantém fetchEmpresas, fetchContatos, fetchOportunidades, etc)

  useEffect(() => {
    fetchEmpresas();
    fetchContatos();
    fetchOportunidades();
    fetchCategorias();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");
      if (error) throw error;
      setEmpresas(data as Empresa[]);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from("categorias")
      .select("id, nome")
      .order("nome");
    if (!error && data) setCategorias(data);
  };

  const fetchEmpresaCategoria = async (empresaId: string) => {
    const { data, error } = await supabase
      .from("empresa_categoria")
      .select("categoria_id")
      .eq("empresa_id", empresaId)
      .single();
    if (!error && data && data.categoria_id) {
      setCategoriaId(data.categoria_id);
    } else {
      setCategoriaId(undefined);
    }
  };

  const fetchContatos = async () => {
    try {
      const { data, error } = await supabase.from("contatos").select("*");
      if (error) throw error;
      setContatos(data);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    }
  };

  const fetchOportunidades = async () => {
    try {
      const { data, error } = await supabase.from("oportunidades").select("*");
      if (error) throw error;
      setOportunidades(data);
    } catch (error) {
      console.error("Erro ao buscar oportunidades:", error);
    }
  };

  // --- Funções do modal de edição ---
  const startEditing = (empresa: Empresa) => {
    setNome(empresa.nome);
    setDescricao(empresa.descricao || "");
    setTipo(empresa.tipo);
    setStatus(empresa.status);
    setIsEditingEmpresa(empresa.id);
    fetchEmpresaCategoria(empresa.id);
  };

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setTipo("parceiro");
    setStatus(true);
    setCategoriaId(undefined);
  };

  const handleEditEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingEmpresa) return;
    try {
      const { error } = await supabase
        .from("empresas")
        .update({ nome, descricao, tipo, status })
        .eq("id", isEditingEmpresa);
      if (error) throw error;
      // Atualizar categoria
      await supabase.from("empresa_categoria").delete().eq("empresa_id", isEditingEmpresa);
      if (categoriaId) {
        await supabase.from("empresa_categoria").insert({ empresa_id: isEditingEmpresa, categoria_id: categoriaId });
      }
      toast({ title: "Sucesso", description: "Empresa atualizada com sucesso!" });
      fetchEmpresas();
      resetForm();
      setIsEditingEmpresa(null);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar a empresa.", variant: "destructive" });
    }
  };

  // ... resto do código da página (gráficos, filtros, tabela, etc) ...

  // --- Substituir o onEdit do botão Editar na tabela: ---
  // onEdit={startEditing}

  // --- Adicionar o Dialog de edição no JSX ---

  return (
    <div className="space-y-6">
      {/* ... todo o conteúdo já existente ... */}

      {/* Modal de edição de empresa */}
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
                value={categoriaId || undefined}
                onValueChange={(value) => setCategoriaId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
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

export default EmpresasPage;
