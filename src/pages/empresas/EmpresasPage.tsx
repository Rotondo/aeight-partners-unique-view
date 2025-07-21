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

// Type for owner partner options
type ParceiroProprietario = {
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
};

const EmpresasPage: React.FC = () => {
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

  // New state for owner partner filter
  const [parceiroProprietarioFilter, setParceiroProprietarioFilter] = useState<string>("");
  const [parceirosProprietarios, setParceirosProprietarios] = useState<ParceiroProprietario[]>([]);

  useEffect(() => {
    fetchEmpresas();
    fetchContatos();
    fetchOportunidades();
    fetchCategorias();
    fetchParceirosProprietarios();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      
      // Query with LEFT JOIN to get owner partner information for client companies
      const { data, error } = await supabase
        .from("empresas")
        .select(`
          *,
          empresa_clientes!empresa_clientes_empresa_cliente_id_fkey(
            empresa_proprietaria:empresa_proprietaria_id(
              id,
              nome,
              tipo
            )
          )
        `)
        .order("nome");
      
      if (error) throw error;
      
      // Transform the data to include owner partner information
      const transformedData = data.map((empresa: any) => ({
        ...empresa,
        parceiro_proprietario: empresa.empresa_clientes?.[0]?.empresa_proprietaria || null
      }));
      
      setEmpresas(transformedData as Empresa[]);
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

  const fetchParceirosProprietarios = async () => {
    try {
      // Get all companies that are owners (intragrupo or parceiro) and have clients
      const { data, error } = await supabase
        .from("empresas")
        .select(`
          id,
          nome,
          tipo,
          empresa_clientes!empresa_clientes_empresa_proprietaria_id_fkey(id)
        `)
        .in("tipo", ["intragrupo", "parceiro"])
        .order("nome");
      
      if (error) throw error;
      
      // Filter only companies that have clients
      const parceirosComClientes = data
        .filter((empresa: any) => empresa.empresa_clientes && empresa.empresa_clientes.length > 0)
        .map((empresa: any) => ({
          id: empresa.id,
          nome: empresa.nome,
          tipo: empresa.tipo
        }));
      
      setParceirosProprietarios(parceirosComClientes);
    } catch (error) {
      console.error("Erro ao buscar parceiros proprietários:", error);
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

  function getTipoLabel(tipo: EmpresaTipoString): string {
    switch (tipo) {
      case "intragrupo": return "Intragrupo";
      case "parceiro": return "Parceiro";
      case "cliente": return "Cliente";
      default: return tipo;
    }
  }
  function getTipoBadgeColor(tipo: EmpresaTipoString): string {
    switch (tipo) {
      case "intragrupo": return "bg-blue-500";
      case "parceiro": return "bg-green-500";
      case "cliente": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  }
  function getOportunidadesCount(empresaId: string): number {
    return oportunidades.filter(
      (o) => o.empresa_origem_id === empresaId || o.empresa_destino_id === empresaId
    ).length;
  }
  const uniqueEmpresas = Array.from(new Set(empresas.map((e) => e.id))).map((id) => empresas.find((e) => e.id === id)!);
  const totalEmpresas = uniqueEmpresas.length;
  const totalIntragrupo = uniqueEmpresas.filter((e) => e.tipo === "intragrupo").length;
  const totalParceiros = uniqueEmpresas.filter((e) => e.tipo === "parceiro").length;
  const totalClientes = uniqueEmpresas.filter((e) => e.tipo === "cliente").length;
  const pieData = [
    { name: "Intragrupo", value: totalIntragrupo, color: "#8884d8" },
    { name: "Parceiros", value: totalParceiros, color: "#82ca9d" },
    { name: "Clientes", value: totalClientes, color: "#ffc658" },
  ];
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
  const empresasOportunidades = uniqueEmpresas
    .map((empresa) => ({ nome: empresa.nome, oportunidades: getOportunidadesCount(empresa.id) }))
    .sort((a, b) => b.oportunidades - a.oportunidades)
    .slice(0, 10);
  const exportToCSV = () => {
    const headers = ["Nome", "Tipo", "Status", "Oportunidades", "Parceiro Proprietário", "Descrição"];
    const rows = filteredEmpresas.map((empresa) => [
      empresa.nome,
      getTipoLabel(empresa.tipo),
      empresa.status ? "Ativo" : "Inativo",
      getOportunidadesCount(empresa.id),
      empresa.parceiro_proprietario?.nome || "-",
      empresa.descricao?.replace(/(\r\n|\n|\r)/gm, " ") || "",
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "empresas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmpresas = empresas
    .filter((empresa) => {
      const matchesSearch =
        empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (empresa.descricao && empresa.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = tipoFilter && tipoFilter !== "all" ? empresa.tipo === tipoFilter : true;
      const matchesTab =
        currentTab === "todas"
          ? true
          : currentTab === "intragrupo"
          ? empresa.tipo === "intragrupo"
          : currentTab === "parceiros"
          ? empresa.tipo === "parceiro"
          : empresa.tipo === "cliente";
      
      // New filter for owner partner (only applies to client companies)
      const matchesOwnerPartner = 
        !parceiroProprietarioFilter || 
        parceiroProprietarioFilter === "all" ||
        (empresa.tipo === "cliente" && empresa.parceiro_proprietario?.id === parceiroProprietarioFilter);
      
      return matchesSearch && matchesType && matchesTab && matchesOwnerPartner;
    })
    .sort((a, b) => {
      let vA: any;
      let vB: any;
      if (sortColumn === "oportunidades") {
        vA = getOportunidadesCount(a.id);
        vB = getOportunidadesCount(b.id);
      } else if (sortColumn === "parceiro_proprietario") {
        vA = a.parceiro_proprietario?.nome || "";
        vB = b.parceiro_proprietario?.nome || "";
      } else {
        vA = a[sortColumn as keyof Empresa];
        vB = b[sortColumn as keyof Empresa];
        if (typeof vA === "string" && typeof vB === "string") {
          vA = vA.toLowerCase();
          vB = vB.toLowerCase();
        }
      }
      if (vA === undefined) vA = "";
      if (vB === undefined) vB = "";
      if (vA < vB) return sortAsc ? -1 : 1;
      if (vA > vB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };
  const handleView = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setModalAberto(true);
  };
  const handleDelete = async (empresa: Empresa) => {
    if (!window.confirm(`Deseja realmente excluir a empresa "${empresa.nome}"?`)) return;
    try {
      setLoading(true);
      const { error } = await supabase.from("empresas").delete().eq("id", empresa.id);
      if (error) throw error;
      toast({ title: "Excluído", description: `Empresa "${empresa.nome}" excluída com sucesso.`, variant: "default" });
      fetchEmpresas();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a empresa.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empresas</h1>
          <p className="text-muted-foreground">Gerencie empresas do grupo e parceiros estratégicos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => fetchEmpresas()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Empresas (Únicas)</p>
                <h2 className="text-3xl font-bold">
                  <PrivateData type="asterisk">{totalEmpresas}</PrivateData>
                </h2>
              </div>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Intragrupo</p>
                <h2 className="text-3xl font-bold">
                  <PrivateData type="asterisk">{totalIntragrupo}</PrivateData>
                </h2>
              </div>
              <Building2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Parceiros</p>
                <h2 className="text-3xl font-bold">
                  <PrivateData type="asterisk">{totalParceiros}</PrivateData>
                </h2>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                <h2 className="text-3xl font-bold">
                  <PrivateData type="asterisk">{totalClientes}</PrivateData>
                </h2>
              </div>
              <Users className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Proporção de empresas por categoria (contagem única)</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} empresas`, "Quantidade"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Empresas por Oportunidades</CardTitle>
            <CardDescription>Top 10 empresas com mais oportunidades</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={empresasOportunidades} layout="vertical" margin={{ left: 40, right: 10, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="nome" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar dataKey="oportunidades" fill="#8884d8" name="Oportunidades">
                  {empresasOportunidades.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            Gerenciamento e visualização de todas as empresas cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="intragrupo">Intragrupo</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                </SelectContent>
              </Select>
              
              {/* New owner partner filter - only show when cliente is selected */}
              {(tipoFilter === "cliente" || currentTab === "clientes") && (
                <Select value={parceiroProprietarioFilter} onValueChange={setParceiroProprietarioFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Parceiro Proprietário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os parceiros</SelectItem>
                    {parceirosProprietarios.map((parceiro) => (
                      <SelectItem key={parceiro.id} value={parceiro.id}>
                        {parceiro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Tabs defaultValue="todas" value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
                <TabsTrigger value="parceiros">Parceiros</TabsTrigger>
                <TabsTrigger value="clientes">Clientes</TabsTrigger>
              </TabsList>
              <TabsContent value="todas" className="mt-0">
                <EmpresasTable
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getOportunidadesCount={getOportunidadesCount}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortAsc={sortAsc}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </TabsContent>
              <TabsContent value="intragrupo" className="mt-0">
                <EmpresasTable
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getOportunidadesCount={getOportunidadesCount}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortAsc={sortAsc}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </TabsContent>
              <TabsContent value="parceiros" className="mt-0">
                <EmpresasTable
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getOportunidadesCount={getOportunidadesCount}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortAsc={sortAsc}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </TabsContent>
              <TabsContent value="clientes" className="mt-0">
                <EmpresasTable
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getOportunidadesCount={getOportunidadesCount}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortAsc={sortAsc}
                  onEdit={startEditing}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Empresa:{' '}
              <PrivateData type="company">
                {selectedEmpresa?.nome}
              </PrivateData>
            </DialogTitle>
          </DialogHeader>
          {selectedEmpresa && (
            <div className="space-y-2">
              <div>
                <strong>Nome:</strong>{' '}
                <PrivateData type="company">
                  {selectedEmpresa.nome}
                </PrivateData>
              </div>
              <div>
                <strong>Tipo:</strong> {getTipoLabel(selectedEmpresa.tipo)}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge variant={selectedEmpresa.status ? "default" : "destructive"}>
                  {selectedEmpresa.status ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div>
                <strong>Oportunidades:</strong>{' '}
                <PrivateData type="asterisk">
                  {getOportunidadesCount(selectedEmpresa.id)}
                </PrivateData>
              </div>
              {selectedEmpresa.parceiro_proprietario && (
                <div>
                  <strong>Parceiro Proprietário:</strong>{' '}
                  <PrivateData type="company">
                    {selectedEmpresa.parceiro_proprietario.nome}
                  </PrivateData>
                </div>
              )}
              <div>
                <strong>Descrição:</strong> {selectedEmpresa.descricao || "-"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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

interface EmpresasTableProps {
  empresas: Empresa[];
  loading: boolean;
  getTipoLabel: (tipo: EmpresaTipoString) => string;
  getTipoBadgeColor: (tipo: EmpresaTipoString) => string;
  getOportunidadesCount: (empresaId: string) => number;
  onSort: (column: string) => void;
  sortColumn: string;
  sortAsc: boolean;
  onEdit: (empresa: Empresa) => void;
  onDelete: (empresa: Empresa) => void;
  onView: (empresa: Empresa) => void;
}

const EmpresasTable = ({
  empresas,
  loading,
  getTipoLabel,
  getTipoBadgeColor,
  getOportunidadesCount,
  onSort,
  sortColumn,
  sortAsc,
  onEdit,
  onDelete,
  onView,
}: EmpresasTableProps) => {
  const renderSortIcon = (col: string) =>
    sortColumn === col ? (
      sortAsc ? (
        <span className="ml-1">&#9650;</span>
      ) : (
        <span className="ml-1">&#9660;</span>
      )
    ) : null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => onSort("nome")}>Nome {renderSortIcon("nome")}</TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("tipo")}>Tipo {renderSortIcon("tipo")}</TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("status")}>Status {renderSortIcon("status")}</TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("oportunidades")}>Oportunidades {renderSortIcon("oportunidades")}</TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("parceiro_proprietario")}>Parceiro Proprietário {renderSortIcon("parceiro_proprietario")}</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">Carregando...</TableCell>
          </TableRow>
        ) : empresas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center">Nenhuma empresa encontrada</TableCell>
          </TableRow>
        ) : (
          empresas.map((empresa) => (
            <TableRow key={empresa.id}>
              <TableCell className="font-medium">
                <PrivateData type="company">{empresa.nome}</PrivateData>
              </TableCell>
              <TableCell>
                <Badge className={getTipoBadgeColor(empresa.tipo)}>{getTipoLabel(empresa.tipo)}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={empresa.status ? "default" : "destructive"}>{empresa.status ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
              <TableCell>
                <PrivateData type="asterisk">{getOportunidadesCount(empresa.id)}</PrivateData>
              </TableCell>
              <TableCell>
                {empresa.parceiro_proprietario ? (
                  <PrivateData type="company">{empresa.parceiro_proprietario.nome}</PrivateData>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">{empresa.descricao || "-"}</TableCell>
              <TableCell>
                <Button size="icon" variant="ghost" title="Visualizar" onClick={() => onView(empresa)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" title="Editar" onClick={() => onEdit(empresa)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" title="Excluir" onClick={() => onDelete(empresa)}><Trash className="h-4 w-4 text-red-600" /></Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmpresasPage;
