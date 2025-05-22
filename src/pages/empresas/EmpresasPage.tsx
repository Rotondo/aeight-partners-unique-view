
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
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
import { Building2, Users, BarChart3, RefreshCw } from "lucide-react";
import { Empresa, TipoEmpresa, Contato, Oportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const EmpresasPage: React.FC = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<string>("todas");
  const { toast } = useToast();

  // Derived state
  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (empresa.descricao && empresa.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = tipoFilter ? empresa.tipo === tipoFilter : true;
    
    const matchesTab = currentTab === "todas" 
                      ? true 
                      : currentTab === "intragrupo" 
                        ? empresa.tipo === "intragrupo"
                        : currentTab === "parceiros"
                          ? empresa.tipo === "parceiro"
                          : empresa.tipo === "cliente";
    
    return matchesSearch && matchesType && matchesTab;
  });

  // Stats
  const totalEmpresas = empresas.length;
  const totalIntragrupo = empresas.filter(e => e.tipo === "intragrupo").length;
  const totalParceiros = empresas.filter(e => e.tipo === "parceiro").length;
  const totalClientes = empresas.filter(e => e.tipo === "cliente").length;

  const pieData = [
    { name: 'Intragrupo', value: totalIntragrupo, color: '#8884d8' },
    { name: 'Parceiros', value: totalParceiros, color: '#82ca9d' },
    { name: 'Clientes', value: totalClientes, color: '#ffc658' }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

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
      console.log("Empresas carregadas:", data);
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
      const { data, error } = await supabase
        .from("contatos")
        .select("*");

      if (error) throw error;
      setContatos(data as Contato[]);
    } catch (error) {
      console.error("Erro ao buscar contatos:", error);
    }
  };

  const fetchOportunidades = async () => {
    try {
      const { data, error } = await supabase
        .from("oportunidades")
        .select("*");

      if (error) throw error;
      setOportunidades(data as Oportunidade[]);
    } catch (error) {
      console.error("Erro ao buscar oportunidades:", error);
    }
  };

  // Helper functions
  const getTipoLabel = (tipo: TipoEmpresa): string => {
    switch (tipo) {
      case "intragrupo": return "Intragrupo";
      case "parceiro": return "Parceiro";
      case "cliente": return "Cliente";
      default: return tipo;
    }
  };

  const getTipoBadgeColor = (tipo: TipoEmpresa): string => {
    switch (tipo) {
      case "intragrupo": return "bg-blue-500";
      case "parceiro": return "bg-green-500";
      case "cliente": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const getContatosCount = (empresaId: string): number => {
    return contatos.filter(c => c.empresa_id === empresaId).length;
  };

  const getOportunidadesCount = (empresaId: string): number => {
    return oportunidades.filter(o => 
      o.empresa_origem_id === empresaId || o.empresa_destino_id === empresaId
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={() => fetchEmpresas()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
                <h2 className="text-3xl font-bold">{totalEmpresas}</h2>
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
                <h2 className="text-3xl font-bold">{totalIntragrupo}</h2>
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
                <h2 className="text-3xl font-bold">{totalParceiros}</h2>
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
                <h2 className="text-3xl font-bold">{totalClientes}</h2>
              </div>
              <Users className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Proporção de empresas por categoria</CardDescription>
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
                <Tooltip formatter={(value) => [`${value} empresas`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Empresas ativas e inativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ativas</span>
                <span className="text-sm font-medium">{empresas.filter(e => e.status).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${empresas.length ? (empresas.filter(e => e.status).length / empresas.length) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inativas</span>
                <span className="text-sm font-medium">{empresas.filter(e => !e.status).length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-500 h-2.5 rounded-full" 
                  style={{ width: `${empresas.length ? (empresas.filter(e => !e.status).length / empresas.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
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
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
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
                  getContatosCount={getContatosCount}
                  getOportunidadesCount={getOportunidadesCount}
                />
              </TabsContent>
              
              <TabsContent value="intragrupo" className="mt-0">
                <EmpresasTable 
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getContatosCount={getContatosCount}
                  getOportunidadesCount={getOportunidadesCount}
                />
              </TabsContent>
              
              <TabsContent value="parceiros" className="mt-0">
                <EmpresasTable 
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getContatosCount={getContatosCount}
                  getOportunidadesCount={getOportunidadesCount}
                />
              </TabsContent>
              
              <TabsContent value="clientes" className="mt-0">
                <EmpresasTable 
                  empresas={filteredEmpresas}
                  loading={loading}
                  getTipoLabel={getTipoLabel}
                  getTipoBadgeColor={getTipoBadgeColor}
                  getContatosCount={getContatosCount}
                  getOportunidadesCount={getOportunidadesCount}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface EmpresasTableProps {
  empresas: Empresa[];
  loading: boolean;
  getTipoLabel: (tipo: TipoEmpresa) => string;
  getTipoBadgeColor: (tipo: TipoEmpresa) => string;
  getContatosCount: (empresaId: string) => number;
  getOportunidadesCount: (empresaId: string) => number;
}

const EmpresasTable = ({ 
  empresas, 
  loading,
  getTipoLabel,
  getTipoBadgeColor,
  getContatosCount,
  getOportunidadesCount
}: EmpresasTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contatos</TableHead>
          <TableHead>Oportunidades</TableHead>
          <TableHead>Descrição</TableHead>
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
          empresas.map(empresa => (
            <TableRow key={empresa.id}>
              <TableCell className="font-medium">{empresa.nome}</TableCell>
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
              <TableCell>{getContatosCount(empresa.id)}</TableCell>
              <TableCell>{getOportunidadesCount(empresa.id)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {empresa.descricao || "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmpresasPage;
