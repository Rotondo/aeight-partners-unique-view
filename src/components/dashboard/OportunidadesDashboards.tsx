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
  getStatusDistribution,
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
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';

// Cores visuais para os gráficos
const BAR_COLOR_RECEBIDAS = '#2563eb'; // azul forte (Recebidas)
const BAR_COLOR_ENVIADAS = '#ef4444';  // vermelho forte (Enviadas)
const BAR_COLOR_SALDO = '#10b981';     // verde (Saldo)
const COLORS = [
  BAR_COLOR_RECEBIDAS,
  BAR_COLOR_ENVIADAS,
  BAR_COLOR_SALDO,
  '#8884d8',
  '#82ca9d',
];
const STATUS_COLORS = {
  em_contato: '#FFBB28',
  negociando: '#0088FE',
  ganho: '#00C49F',
  perdido: '#FF8042',
};

const quartersOptions = [
  { value: 'Q1', label: 'Q1 (jan-mar)' },
  { value: 'Q2', label: 'Q2 (abr-jun)' },
  { value: 'Q3', label: 'Q3 (jul-set)' },
  { value: 'Q4', label: 'Q4 (out-dez)' },
];

function getQuarter(date: Date) {
  const month = date.getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}
function getStatusLabel(status: string) {
  switch (status) {
    case 'em_contato':
      return 'Em Contato';
    case 'negociando':
      return 'Negociando';
    case 'ganho':
      return 'Ganho';
    case 'perdido':
      return 'Perdido';
    default:
      return status;
  }
}

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
  const [periodo, setPeriodo] = useState('mes');
  const [quarters, setQuarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);

  const { toast } = useToast();

  useEffect(() => {
    fetchEmpresas();
    fetchData();
    // eslint-disable-next-line
  }, [filters, periodo, quarters]);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome');

      if (error) throw error;

      const typedData: Empresa[] = data.map((item) => ({
        id: item.id,
        nome: item.nome,
        tipo: item.tipo as TipoEmpresa,
      }));

      setEmpresas(typedData);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas.',
        variant: 'destructive',
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
        fetchStatusDistribution(),
      ]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatrizIntragrupo = async () => {
    try {
      const statusFilter = filters.status
        ? (filters.status as StatusOportunidade)
        : null;

      const data = await getMatrizIntragrupo(
        filters.dataInicio,
        filters.dataFim,
        filters.empresaId || null,
        statusFilter,
        periodo === 'quarter' ? quarters : undefined,
      );
      setMatrizIntragrupo(data as MatrizData[]);
    } catch (error) {
      console.error('Erro ao buscar matriz intragrupo:', error);
      setMatrizIntragrupo([]);
    }
  };

  const fetchMatrizParcerias = async () => {
    try {
      const statusFilter = filters.status
        ? (filters.status as StatusOportunidade)
        : null;

      const data = await getMatrizParcerias(
        filters.dataInicio,
        filters.dataFim,
        filters.empresaId || null,
        statusFilter,
        periodo === 'quarter' ? quarters : undefined,
      );
      setMatrizParcerias(data as MatrizData[]);
    } catch (error) {
      console.error('Erro ao buscar matriz parcerias:', error);
      setMatrizParcerias([]);
    }
  };

  const fetchQualidade = async () => {
    try {
      const data = await getQualidadeIndicacoes(
        filters.dataInicio,
        filters.dataFim,
        filters.empresaId || null,
        periodo === 'quarter' ? quarters : undefined,
      );
      setQualidadeData(data as QualidadeData[]);
    } catch (error) {
      console.error('Erro ao buscar qualidade das indicações:', error);
      setQualidadeData([]);
    }
  };

  const fetchBalanco = async () => {
    try {
      const statusFilter = filters.status
        ? (filters.status as StatusOportunidade)
        : null;

      const data = await getBalancoGrupoParcerias(
        filters.dataInicio,
        filters.dataFim,
        filters.empresaId || null,
        statusFilter,
        periodo === 'quarter' ? quarters : undefined,
      );
      setBalancoData(data as BalancoData[]);
    } catch (error) {
      console.error('Erro ao buscar balanço:', error);
      setBalancoData([]);
    }
  };

  const fetchRankingEnviadas = async () => {
    try {
      const statusFilter = filters.status
        ? (filters.status as StatusOportunidade)
        : null;

      const data = await getRankingParceirosEnviadas(
        filters.dataInicio,
        filters.dataFim,
        statusFilter,
        periodo === 'quarter' ? quarters : undefined,
      );
      setRankingEnviadas(data as RankingData[]);
    } catch (error) {
      console.error('Erro ao buscar ranking de parceiros:', error);
      setRankingEnviadas([]);
    }
  };

  const fetchRankingRecebidas = async () => {
    try {
      const statusFilter = filters.status
        ? (filters.status as StatusOportunidade)
        : null;

      const data = await getRankingParceirosRecebidas(
        filters.dataInicio,
        filters.dataFim,
        statusFilter,
        periodo === 'quarter' ? quarters : undefined,
      );
      setRankingRecebidas(data as RankingData[]);
    } catch (error) {
      console.error('Erro ao buscar ranking de parceiros:', error);
      setRankingRecebidas([]);
    }
  };

  const fetchStatusDistribution = async () => {
    try {
      const data = await getStatusDistribution(
        filters.dataInicio,
        filters.dataFim,
        filters.empresaId || null,
        periodo === 'quarter' ? quarters : undefined,
      );
      setStatusData(data as StatusData[]);
    } catch (error) {
      console.error('Erro ao buscar distribuição de status:', error);
      setStatusData([]);
    }
  };

  // Matriz em tabela com totais e opacidade nos zeros
  function renderMatrizTable(rows: any[], colKey: string, label: string) {
    if (!rows.length) return <div className="text-center">Nenhum dado</div>;
    const cols = Object.keys(rows[0]).filter((c) => c !== colKey);
    const colTotals: Record<string, number> = {};
    cols.forEach((c) => {
      colTotals[c] = rows.reduce((acc, row) => acc + (row[c] !== '-' ? row[c] : 0), 0);
    });
    const grandTotal = Object.values(colTotals).reduce((a, b) => a + b, 0);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">{label}</th>
              {cols.map((c) => (
                <th className="border p-1" key={c}>
                  {c}
                </th>
              ))}
              <th className="border p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              let rowTotal = 0;
              return (
                <tr key={idx}>
                  <td className="border p-1 font-bold">{row[colKey]}</td>
                  {cols.map((c) => {
                    let value = row[c];
                    if (value === '-')
                      return (
                        <td className="border p-1 text-center opacity-60" key={c}>
                          -
                        </td>
                      );
                    rowTotal += value;
                    return (
                      <td
                        className={`border p-1 text-center ${value === 0 ? 'opacity-40' : ''}`}
                        key={c}
                      >
                        {value}
                      </td>
                    );
                  })}
                  <td className="border p-1 text-center font-bold">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border p-1 font-bold">Total</td>
              {cols.map((c) => (
                <td
                  className={`border p-1 text-center font-bold ${colTotals[c] === 0 ? 'opacity-40' : ''}`}
                  key={c}
                >
                  {colTotals[c]}
                </td>
              ))}
              <td className="border p-1 text-center font-bold">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  // Gráfico divergente para matriz intragrupo
  function renderMatrizDivergenteBarChart(matrizRows: any[]) {
    if (!matrizRows.length) return <div className="text-center text-xs">Nenhum dado para gráfico</div>;
    const empresasNomes = matrizRows.map((row) => row.origem);

    const dados = empresasNomes.map((nome) => {
      let recebidas = 0;
      let enviadas = 0;
      matrizRows.forEach((row) => {
        if (row.origem === nome) {
          Object.entries(row).forEach(([key, value]) => {
            if (key !== 'origem' && value !== '-' && key !== nome) enviadas += value as number;
          });
        } else {
          if (row[nome] !== undefined && row[nome] !== '-' && row.origem !== nome) {
            recebidas += row[nome] as number;
          }
        }
      });
      const saldo = recebidas - enviadas;
      return {
        empresa: nome,
        recebidas,
        enviadas: -enviadas,
        saldo,
      };
    });

    const maxAbs = Math.max(
      5,
      ...dados.map((d) => Math.abs(d.recebidas)),
      ...dados.map((d) => Math.abs(d.enviadas)),
      ...dados.map((d) => Math.abs(d.saldo)),
    );

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
            <strong>{label}</strong>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {payload.map((entry: any, idx: number) => (
                <li key={idx} style={{ color: entry.color }}>
                  {entry.name}: {Math.abs(entry.value)}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      return null;
    };

    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" tick={{ fontWeight: 600 }} />
          <YAxis domain={[-maxAbs, maxAbs]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 12, fontWeight: 700 }}
            formatter={(value, entry) => {
              if (value === 'recebidas')
                return <span style={{ color: BAR_COLOR_RECEBIDAS }}>Recebidas</span>;
              if (value === 'enviadas')
                return <span style={{ color: BAR_COLOR_ENVIADAS }}>Enviadas</span>;
              if (value === 'saldo')
                return <span style={{ color: BAR_COLOR_SALDO }}>Saldo</span>;
              return value;
            }}
          />
          <ReferenceLine y={0} stroke="#222" strokeWidth={2.5} />
          <Bar dataKey="recebidas" name="Recebidas" fill={BAR_COLOR_RECEBIDAS} barSize={20} />
          <Bar dataKey="enviadas" name="Enviadas" fill={BAR_COLOR_ENVIADAS} barSize={20} />
          <Bar dataKey="saldo" name="Saldo" fill={BAR_COLOR_SALDO} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Outros gráficos (qualidade, rankings, balanço, status) - mantidos do original
  function renderQualidadeBarChart(data: QualidadeData[]) {
    if (!data.length) return <div className="text-center text-xs">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="origem" angle={-45} textAnchor="end" interval={0} height={80} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" name="Total" stackId="status" fill={STATUS_COLORS.em_contato}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderRankingBarChart(ranking: RankingData[], label: string, key: keyof RankingData = 'indicacoes') {
    if (!ranking.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={ranking}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" />
          <YAxis />
          <Tooltip />
          <Bar dataKey={key} name={label} fill={COLORS[1]}>
            <LabelList dataKey={key} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderBalancoBarChart(balanco: BalancoData[]) {
    if (!balanco.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={balanco}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tipo" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" name="Quantidade" fill={COLORS[2]}>
            <LabelList dataKey="valor" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderStatusPieChart(statusDistribuicao: StatusData[]) {
    if (!statusDistribuicao.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={statusDistribuicao}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill={COLORS[3]}
            dataKey="total"
            nameKey="status"
            label={({ name, percent }) => `${getStatusLabel(name)} ${(percent * 100).toFixed(0)}%`}
          >
            {statusDistribuicao.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value}`, getStatusLabel(props.payload.status)]} />
          <Legend formatter={getStatusLabel} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // Treemap matriz (mantido do original)
  function renderTreemapMatriz(data: MatrizData[]) {
    if (!data.length) return <div className="text-center">Nenhum dado</div>;
    const transformForTreemap = (data: MatrizData[]) =>
      data.map((item) => ({
        name: `${item.origem} → ${item.destino}`,
        size: item.total,
        origem: item.origem,
        destino: item.destino,
      }));

    const CustomTreemapContent = (props: any) => {
      const { x, y, width, height, index, name, size } = props;
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
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={transformForTreemap(data)}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={<CustomTreemapContent />}
        />
      </ResponsiveContainer>
    );
  }

  // Filtros quarters
  function renderQuarterFilter() {
    return (
      <div className="w-full md:w-auto">
        <Label htmlFor="quarter">Quarter</Label>
        <Select
          value={quarters.join(',')}
          onValueChange={(v) =>
            setQuarters(v ? v.split(',') : [])
          }
          multiple
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione quarter(s)" />
          </SelectTrigger>
          <SelectContent>
            {quartersOptions.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground mt-1">
          Você pode selecionar um ou mais quarters
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Label htmlFor="dataInicio">Data Inicial</Label>
          <DatePicker
            date={filters.dataInicio}
            setDate={(date) => setFilters((prev) => ({ ...prev, dataInicio: date }))}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="dataFim">Data Final</Label>
          <DatePicker
            date={filters.dataFim}
            setDate={(date) => setFilters((prev) => ({ ...prev, dataFim: date }))}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="empresaId">Empresa</Label>
          <Select
            value={filters.empresaId === '' ? 'all' : filters.empresaId}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, empresaId: value === 'all' ? '' : value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status === '' ? 'all' : filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))
            }
          >
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
        <div className="w-full md:w-auto">
          <Label htmlFor="periodo">Período</Label>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mensal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {periodo === 'quarter' && renderQuarterFilter()}
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
                <>
                  {renderMatrizTable(matrizIntragrupo, 'origem', 'Origem \\ Destino')}
                  <div className="mt-6">{renderMatrizDivergenteBarChart(matrizIntragrupo)}</div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center">Nenhum dado encontrado</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Qualidade das Indicações por Status (Intragrupo)</CardTitle>
              <CardDescription>
                Distribuição dos status das indicações para cada empresa do grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : qualidadeData.length > 0 ? (
                <div className="h-96">{renderQualidadeBarChart(qualidadeData)}</div>
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
                <>
                  {renderMatrizTable(matrizParcerias, 'parceiro', 'Parceiro \\ Intra')}
                  <div className="mt-6">{renderTreemapMatriz(matrizParcerias)}</div>
                </>
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
                  <div className="h-80">{renderRankingBarChart(rankingEnviadas, 'Enviadas')}</div>
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
                  <div className="h-80">{renderRankingBarChart(rankingRecebidas, 'Recebidas')}</div>
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
                <div className="h-80">{renderBalancoBarChart(balancoData)}</div>
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
                <div className="h-80">{renderStatusPieChart(statusData)}</div>
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
