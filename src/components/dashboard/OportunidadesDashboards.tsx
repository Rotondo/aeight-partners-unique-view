import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TipoEmpresa, MatrizData, QualidadeData, BalancoData, RankingData, StatusData, StatusOportunidade } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import {
  getMatrizIntragrupo,
  getMatrizParcerias,
  getQualidadeIndicacoes,
  getBalancoGrupoParcerias,
  getRankingParceirosEnviadas,
  getRankingParceirosRecebidas,
  getStatusDistribution
} from '@/lib/dbFunctions';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList,
  Treemap,
  LineChart,
  Line
} from 'recharts';

// Types
interface Empresa {
  id: string;
  nome: string;
  tipo: TipoEmpresa;
}

interface FilterState {
  dataInicio: Date | null;
  dataFim: Date | null;
  empresaId: string;
  status: string;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  'em_contato': '#FFBB28',   // Yellow
  'negociando': '#0088FE',   // Blue
  'ganho': '#00C49F',        // Green
  'perdido': '#FF8042',      // Orange
};

export const OportunidadesDashboards: React.FC = () => {
  const [matrizIntragrupo, setMatrizIntragrupo] = useState<MatrizData[]>([]);
  const [matrizParcerias, setMatrizParcerias] = useState<MatrizData[]>([]);
  const [qualidadeData, setQualidadeData] = useState<QualidadeData[]>([]);
  const [balancoData, setBalancoData] = useState<BalancoData[]>([]);
  const [rankingEnviadas, setRankingEnviadas] = useState<RankingData[]>([]);
  const [rankingRecebidas, setRankingRecebidas] = useState<RankingData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dataInicio: subMonths(new Date(), 6),
    dataFim: new Date(),
    empresaId: '',
    status: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
    fetchData();
  }, [filters]);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("nome");

      if (error) throw error;
      
      // Convert the raw data to match the Empresa type
      const typedData: Empresa[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
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

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMatrizIntragrupo(),
        fetchMatrizParcerias(),
        fetchQualidade(),
        fetchBalanco(),
        fetchRankingEnviadas(),
        fetchRankingRecebidas(),
        fetchStatusDistribution()
      ]);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrizIntragrupo = async () => {
    try {
      // Convert string to StatusOportunidade type or null
      const statusFilter = filters.status ? filters.status as StatusOportunidade : null;
      
      const data = await getMatrizIntragrupo(
        filters.dataInicio, 
        filters.dataFim, 
        filters.empresaId || null, 
        statusFilter
      );
      setMatrizIntragrupo(data as MatrizData[]);
    } catch (error) {
      console.error("Erro ao buscar matriz intragrupo:", error);
      setMatrizIntragrupo([]);
    }
  };

  const fetchMatrizParcerias = async () => {
    try {
      // Convert string to StatusOportunidade type or null
      const statusFilter = filters.status ? filters.status as StatusOportunidade : null;
      
      const data = await getMatrizParcerias(
        filters.dataInicio, 
        filters.dataFim, 
        filters.empresaId || null, 
        statusFilter
      );
      setMatrizParcerias(data as MatrizData[]);
    } catch (error) {
      console.error("Erro ao buscar matriz parcerias:", error);
      setMatrizParcerias([]);
    }
  };

  const fetchQualidade = async () => {
    try {
      const data = await getQualidadeIndicacoes(
        filters.dataInicio, 
        filters.dataFim, 
        filters.empresaId || null
      );
      setQualidadeData(data as QualidadeData[]);
    } catch (error) {
      console.error("Erro ao buscar qualidade das indicações:", error);
      setQualidadeData([]);
    }
  };

  const fetchBalanco = async () => {
    try {
      // Convert string to StatusOportunidade type or null
      const statusFilter = filters.status ? filters.status as StatusOportunidade : null;
      
      const data = await getBalancoGrupoParcerias(
        filters.dataInicio, 
        filters.dataFim, 
        filters.empresaId || null, 
        statusFilter
      );
      setBalancoData(data as BalancoData[]);
    } catch (error) {
      console.error("Erro ao buscar balanço:", error);
      setBalancoData([]);
    }
  };

  const fetchRankingEnviadas = async () => {
    try {
      // Convert string to StatusOportunidade type or null
      const statusFilter = filters.status ? filters.status as StatusOportunidade : null;
      
      const data = await getRankingParceirosEnviadas(
        filters.dataInicio, 
        filters.dataFim, 
        statusFilter
      );
      setRankingEnviadas(data as RankingData[]);
    } catch (error) {
      console.error("Erro ao buscar ranking de parceiros:", error);
      setRankingEnviadas([]);
    }
  };

  const fetchRankingRecebidas = async () => {
    try {
      // Convert string to StatusOportunidade type or null
      const statusFilter = filters.status ? filters.status as StatusOportunidade : null;
      
      const data = await getRankingParceirosRecebidas(
        filters.dataInicio, 
        filters.dataFim, 
        statusFilter
      );
      setRankingRecebidas(data as RankingData[]);
    } catch (error) {
      console.error("Erro ao buscar ranking de parceiros:", error);
      setRankingRecebidas([]);
    }
  };

  const fetchStatusDistribution = async () => {
    try {
      const data = await getStatusDistribution(
        filters.dataInicio, 
        filters.dataFim, 
        filters.empresaId || null
      );
      setStatusData(data as StatusData[]);
    } catch (error) {
      console.error("Erro ao buscar distribuição de status:", error);
      setStatusData([]);
    }
  };

  // Get a readable status name
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'em_contato': return 'Em Contato';
      case 'negociando': return 'Negociando';
      case 'ganho': return 'Ganho';
      case 'perdido': return 'Perdido';
      default: return status;
    }
  };

  // Transform to matrix format for heatmap visualization
  const transformForMatrix = (data: MatrizData[]) => {
    // Extract all unique companies
    const uniqueCompanies = Array.from(
      new Set(data.flatMap(item => [item.origem, item.destino]))
    ).sort();

    // Create the matrix data structure
    return uniqueCompanies.map(origem => {
      const row: any = { name: origem };
      uniqueCompanies.forEach(destino => {
        const match = data.find(item => item.origem === origem && item.destino === destino);
        row[destino] = match ? match.total : 0;
      });
      return row;
    });
  };

  // Transform data for treemap visualization of the heatmap
  const transformForTreemap = (data: MatrizData[]) => {
    return data.map(item => ({
      name: `${item.origem} → ${item.destino}`,
      size: item.total,
      origem: item.origem,
      destino: item.destino
    }));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-semibold">{`${payload[0].payload.name}`}</p>
          <p>{`Total: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const StatusesTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-semibold">{getStatusLabel(payload[0].name)}</p>
          <p>{`Total: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom content for Treemap
  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, index, payload, name, size } = props;
    if (width < 70 || height < 25) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={16}
        >
          {size}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Label htmlFor="dataInicio">Data Inicial</Label>
          <DatePicker 
            date={filters.dataInicio}
            setDate={(date) => setFilters(prev => ({ ...prev, dataInicio: date }))}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="dataFim">Data Final</Label>
          <DatePicker 
            date={filters.dataFim}
            setDate={(date) => setFilters(prev => ({ ...prev, dataFim: date }))}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="empresaId">Empresa</Label>
          <Select 
            value={filters.empresaId === "" ? "all" : filters.empresaId}
            onValueChange={(value) => setFilters(prev => ({ ...prev, empresaId: value === "all" ? "" : value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={filters.status === "" ? "all" : filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === "all" ? "" : value }))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="em_contato">Em Contato</SelectItem>
              <SelectItem value="negociando">Negociando</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="intragrupo">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="intragrupo">Intragrupo</TabsTrigger>
          <TabsTrigger value="parcerias">Parcerias</TabsTrigger>
          <TabsTrigger value="geral">Geral</TabsTrigger>
        </TabsList>
        
        <TabsContent value="intragrupo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
              <CardDescription>Visualização de quem indica para quem dentro do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : matrizIntragrupo.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={transformForTreemap(matrizIntragrupo)}
                      dataKey="size"
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      {transformForTreemap(matrizIntragrupo).map((entry, index) => (
                        <Treemap
                          key={`cell-${index}`}
                          dataKey="size"
                          stroke="#fff"
                          fill={COLORS[index % COLORS.length]}
                          content={<CustomTreemapContent />}
                        />
                      ))}
                      <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualidade das Indicações por Status (Intragrupo)</CardTitle>
              <CardDescription>Distribuição dos status das indicações para cada empresa do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : qualidadeData.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={qualidadeData.filter(d => d.origem.includes('Intragrupo') || d.destino.includes('Intragrupo'))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="origem" angle={-45} textAnchor="end" interval={0} height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" stackId="status" fill={STATUS_COLORS.em_contato || "#FFBB28"}>
                        {qualidadeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parcerias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
              <CardDescription>Visualização das indicações envolvendo parceiros externos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : matrizParcerias.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={transformForTreemap(matrizParcerias)}
                      dataKey="size"
                      stroke="#fff"
                      fill="#8884d8"
                    >
                      {transformForTreemap(matrizParcerias).map((entry, index) => (
                        <Treemap
                          key={`cell-${index}`}
                          dataKey="size"
                          stroke="#fff"
                          fill={COLORS[index % COLORS.length]}
                          content={<CustomTreemapContent />}
                        />
                      ))}
                      <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Parceiros que Enviam</CardTitle>
                <CardDescription>Parceiros que mais enviam indicações para o grupo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">Carregando...</div>
                ) : rankingEnviadas.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rankingEnviadas}
                        margin={{ top: 20, right: 30, left: 20, bottom: 110 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="parceiro" angle={-45} textAnchor="end" interval={0} height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="indicacoes" name="Indicações Enviadas" fill="#0088FE">
                          <LabelList dataKey="indicacoes" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Parceiros que Recebem</CardTitle>
                <CardDescription>Parceiros que mais recebem indicações do grupo</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">Carregando...</div>
                ) : rankingRecebidas.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rankingRecebidas}
                        margin={{ top: 20, right: 30, left: 20, bottom: 110 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="parceiro" angle={-45} textAnchor="end" interval={0} height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="indicacoes" name="Indicações Recebidas" fill="#00C49F">
                          <LabelList dataKey="indicacoes" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Balanço Grupo ↔ Parcerias</CardTitle>
              <CardDescription>Comparação entre indicações enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : balancoData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={balancoData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barSize={100}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="tipo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="valor" name="Quantidade" fill="#8884d8">
                        <LabelList dataKey="valor" position="top" />
                        {balancoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#0088FE" : "#00C49F"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Status de todas as oportunidades</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : statusData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                        nameKey="status"
                        label={({ name, percent }) => `${getStatusLabel(name)} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<StatusesTooltip />} />
                      <Legend formatter={(value) => getStatusLabel(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
