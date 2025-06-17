
import React, { useState, useEffect } from "react";
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
import { PrivateData } from "@/components/privacy/PrivateData";

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

  // Funções de apoio
  function getTipoLabel(tipo: EmpresaTipoString): string {
    switch (tipo) {
      case "intragrupo":
        return "Intragrupo";
      case "parceiro":
        return "Parceiro";
      case "cliente":
        return "Cliente";
      default:
        return tipo;
    }
  }
  function getTipoBadgeColor(tipo: EmpresaTipoString): string {
    switch (tipo) {
      case "intragrupo":
        return "bg-blue-500";
      case "parceiro":
        return "bg-green-500";
      case "cliente":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  }
  function getOportunidadesCount(empresaId: string): number {
    return oportunidades.filter(
      (o) =>
        o.empresa_origem_id === empresaId ||
        o.empresa_destino_id === empresaId
    ).length;
  }

  // Garantia de contadores únicos nas estatísticas
  const uniqueEmpresas = Array.from(
    new Set(empresas.map((e) => e.id))
  ).map((id) => empresas.find((e) => e.id === id)!);

  // Stats
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

  // Gráfico de barras: empresas por oportunidades (top 10)
  const empresasOportunidades = uniqueEmpresas
    .map((empresa) => ({
      nome: empresa.nome,
      oportunidades: getOportunidadesCount(empresa.id),
    }))
    .sort((a, b) => b.oportunidades - a.oportunidades)
    .slice(0, 10);

  useEffect(() => {
    fetchEmpresas();
    fetchContatos();
    fetchOportunidades();
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

  // Exportação para CSV
  const exportToCSV = () => {
    const headers = [
      "Nome",
      "Tipo",
      "Status",
      "Oportunidades",
      "Descrição",
    ];
    const rows = filteredEmpresas.map((empresa) => [
      empresa.nome,
      getTipoLabel(empresa.tipo),
      empresa.status ? "Ativo" : "Inativo",
      getOportunidadesCount(empresa.id),
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

  // Editar empresa (exemplo: pode abrir modal de edição)
  const handleEdit = (empresa: Empresa) => {
    toast({
      title: "Funcionalidade de edição",
      description: `Aqui abriria o modal de edição para ${empresa.nome}.`,
      variant: "default",
    });
  };

  // Excluir empresa
  const handleDelete = async (empresa: Empresa) => {
    if (!window.confirm(`Deseja realmente excluir a empresa "${empresa.nome}"?`))
      return;
    try {
      setLoading(true);
      const { error } = await supabase
        .from("empresas")
        .delete()
        .eq("id", empresa.id);
      if (error) throw error;
      toast({
        title: "Excluído",
        description: `Empresa "${empresa.nome}" excluída com sucesso.`,
        variant: "default",
      });
      fetchEmpresas();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a empresa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Visualizar detalhes completos em modal
  const handleView = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setModalAberto(true);
  };

  // --- Filtragem e ordenação ---
  const filteredEmpresas = empresas
    .filter((empresa) => {
      const matchesSearch =
        empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (empresa.descricao &&
          empresa.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType =
        tipoFilter && tipoFilter !== "all" ? empresa.tipo === tipoFilter : true;

      const matchesTab =
        currentTab === "todas"
          ? true
          : currentTab === "intragrupo"
          ? empresa.tipo === "intragrupo"
          : currentTab === "parceiros"
          ? empresa.tipo === "parceiro"
          : empresa.tipo === "cliente";

      return matchesSearch && matchesType && matchesTab;
    })
    .sort((a, b) => {
      let vA: any;
      let vB: any;
      if (sortColumn === "oportunidades") {
        vA = getOportunidadesCount(a.id);
        vB = getOportunidadesCount(b.id);
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

  // Ordenação ao clicar cabeçalho
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empresas</h1>
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
                  <PrivateData type="asterisk">
                    {totalEmpresas}
                  </PrivateData>
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
                  <PrivateData type="asterisk">
                    {totalIntragrupo}
                  </PrivateData>
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
                  <PrivateData type="asterisk">
                    {totalParceiros}
                  </PrivateData>
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
                  <PrivateData type="asterisk">
                    {totalClientes}
                  </PrivateData>
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
                  onEdit={handleEdit}
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
                  onEdit={handleEdit}
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
                  onEdit={handleEdit}
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
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
                <strong>Status:</strong>{" "}
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
              <div>
                <strong>Descrição:</strong> {selectedEmpresa.descricao || "-"}
              </div>
            </div>
          )}
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
          <TableHead className="cursor-pointer" onClick={() => onSort("nome")}>
            Nome {renderSortIcon("nome")}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("tipo")}>
            Tipo {renderSortIcon("tipo")}
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => onSort("status")}>
            Status {renderSortIcon("status")}
          </TableHead>
          <TableHead
            className="cursor-pointer"
            onClick={() => onSort("oportunidades")}
          >
            Oportunidades {renderSortIcon("oportunidades")}
          </TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              Carregando...
            </TableCell>
          </TableRow>
        ) : empresas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              Nenhuma empresa encontrada
            </TableCell>
          </TableRow>
        ) : (
          empresas.map((empresa) => (
            <TableRow key={empresa.id}>
              <TableCell className="font-medium">
                <PrivateData type="company">
                  {empresa.nome}
                </PrivateData>
              </TableCell>
              <TableCell>
                <Badge className={getTipoBadgeColor(empresa.tipo)}>
                  {getTipoLabel(empresa.tipo)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={empresa.status ? "default" : "destructive"}>
                  {empresa.status ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <PrivateData type="asterisk">
                  {getOportunidadesCount(empresa.id)}
                </PrivateData>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {empresa.descricao || "-"}
              </TableCell>
              <TableCell>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Visualizar"
                  onClick={() => onView(empresa)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Editar"
                  onClick={() => onEdit(empresa)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  title="Excluir"
                  onClick={() => onDelete(empresa)}
                >
                  <Trash className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmpresasPage;
