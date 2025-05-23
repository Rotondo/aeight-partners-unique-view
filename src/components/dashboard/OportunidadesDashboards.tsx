import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, PieChart, Pie, Cell, LabelList, LineChart, Line
} from 'recharts';
import { format, subMonths } from 'date-fns';

// CORES VISUAIS
const BAR_COLOR_RECEBIDAS = '#2563eb';
const BAR_COLOR_ENVIADAS = '#ef4444';
const BAR_COLOR_SALDO = '#10b981';
const STATUS_COLORS = {
  'em_contato': '#FFBB28',
  'negociando': '#0088FE',
  'ganho': '#00C49F',
  'perdido': '#FF8042',
};
const LINE_COLORS = [
  '#2563eb', '#ef4444', '#10b981', '#a21caf', '#eab308', '#0ea5e9', '#b91c1c', '#059669', '#3b82f6', '#f59e42', '#6366f1', '#f43f5e'
];
const COLORS = [BAR_COLOR_RECEBIDAS, BAR_COLOR_ENVIADAS, BAR_COLOR_SALDO, '#8884d8', '#82ca9d'];

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
    case 'em_contato': return 'Em Contato';
    case 'negociando': return 'Negociando';
    case 'ganho': return 'Ganho';
    case 'perdido': return 'Perdido';
    default: return status;
  }
}

function getYear(date: Date) {
  return date.getFullYear();
}

function getMonthYear(date: Date) {
  return format(date, 'MMM/yyyy');
}

export const OportunidadesDashboards: React.FC = () => {
  // Estados de dados
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [matrizIntra, setMatrizIntra] = useState<any[]>([]);
  const [matrizParceiros, setMatrizParceiros] = useState<any[]>([]);
  const [qualidadeData, setQualidadeData] = useState<any[]>([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState<any[]>([]);
  const [rankingEnviadas, setRankingEnviadas] = useState<any[]>([]);
  const [rankingRecebidas, setRankingRecebidas] = useState<any[]>([]);
  const [balanco, setBalanco] = useState<any[]>([]);
  // Filtros
  const [dataInicio, setDataInicio] = useState<Date | null>(subMonths(new Date(), 6));
  const [dataFim, setDataFim] = useState<Date | null>(new Date());
  const [empresaId, setEmpresaId] = useState('');
  const [status, setStatus] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [quarters, setQuarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [quarterYear, setQuarterYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  // NOVO: destaque de empresa no gráfico de linhas
  const [empresaSelecionadaLinha, setEmpresaSelecionadaLinha] = useState<string>('all');

  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [dataInicio, dataFim, empresaId, status, periodo, quarters, quarterYear]);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: empresasDb } = await supabase.from("empresas").select("*").order("nome");
      setEmpresas(empresasDb || []);
      const { data: oportunidadesDb } = await supabase.from("oportunidades").select("*, empresa_origem:empresas!empresa_origem_id(id, nome, tipo), empresa_destino:empresas!empresa_destino_id(id, nome, tipo)");
      // Coletar todos os anos disponíveis para filtro
      const anos = Array.from(new Set((oportunidadesDb || []).map((op: any) => {
        if (!op.data_indicacao) return null;
        return (new Date(op.data_indicacao)).getFullYear();
      }).filter(Boolean))).sort((a, b) => b - a);
      setAvailableYears(anos);

      const oportunidadesFiltradas = (oportunidadesDb || []).filter((op: any) => {
        const dataInd = op.data_indicacao ? new Date(op.data_indicacao) : null;
        let match = true;
        if (dataInicio && dataInd) match = match && dataInd >= dataInicio;
        if (dataFim && dataInd) match = match && dataInd <= dataFim;
        if (empresaId) match = match && (op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId);
        if (status) match = match && op.status === status;
        // Novo filtro: quarter + year
        if (periodo === "quarter" && dataInd) {
          match = match && quarters.includes(getQuarter(dataInd)) && getYear(dataInd) === quarterYear;
        }
        return match;
      });
      setOportunidades(oportunidadesFiltradas);

      // Matriz INTRAGRUPO
      const intra = empresasDb.filter((e: any) => e.tipo === "intragrupo");
      const matrizIntraRows = intra.map((orig: any) => {
        const row: any = { origem: orig.nome };
        intra.forEach((dest: any) => {
          if (orig.id === dest.id) {
            row[dest.nome] = '-';
          } else {
            row[dest.nome] = oportunidadesFiltradas.filter(
              (op: any) =>
                op.empresa_origem_id === orig.id &&
                op.empresa_destino_id === dest.id &&
                op.empresa_origem.tipo === "intragrupo" &&
                op.empresa_destino.tipo === "intragrupo"
            ).length;
          }
        });
        return row;
      });
      setMatrizIntra(matrizIntraRows);

      // Matriz PARCEIROS
      const parceiros = empresasDb.filter((e: any) => e.tipo === "parceiro");
      const matrizParceirosRows = parceiros.map((parc: any) => {
        const row: any = { parceiro: parc.nome };
        intra.forEach((intraE: any) => {
          row[intraE.nome] =
            oportunidadesFiltradas.filter((op: any) =>
              (
                (op.empresa_origem_id === parc.id && op.empresa_destino_id === intraE.id) ||
                (op.empresa_origem_id === intraE.id && op.empresa_destino_id === parc.id)
              ) &&
              (
                op.empresa_origem.tipo === "parceiro" || op.empresa_destino.tipo === "parceiro"
              )
            ).length;
        });
        return row;
      });
      setMatrizParceiros(matrizParceirosRows);

      // Qualidade das indicações (status por empresa)
      const qualidade = intra.map((orig: any) => {
        let total = 0;
        let ganho = 0;
        let perdido = 0;
        oportunidadesFiltradas.forEach((op: any) => {
          if (op.empresa_origem?.nome === orig.nome) {
            total++;
            if (op.status === 'ganho') ganho++;
            if (op.status === 'perdido') perdido++;
          }
        });
        return {
          origem: orig.nome,
          total,
          ganho,
          perdido
        };
      });
      setQualidadeData(qualidade);

      // Status - Geral
      const statusCount: Record<string, number> = {};
      oportunidadesFiltradas.forEach((op: any) => {
        if (!statusCount[op.status]) statusCount[op.status] = 0;
        statusCount[op.status]++;
      });
      setStatusDistribuicao(Object.entries(statusCount).map(([status, total]) => ({ status, total: total as number })));

      // Ranking Enviadas/Recebidas
      const rankingEnv: any = {};
      const rankingRec: any = {};
      oportunidadesFiltradas.forEach((op: any) => {
        if (op.empresa_origem?.nome) {
          if (!rankingEnv[op.empresa_origem.nome]) rankingEnv[op.empresa_origem.nome] = 0;
          rankingEnv[op.empresa_origem.nome]++;
        }
        if (op.empresa_destino?.nome) {
          if (!rankingRec[op.empresa_destino.nome]) rankingRec[op.empresa_destino.nome] = 0;
          rankingRec[op.empresa_destino.nome]++;
        }
      });
      setRankingEnviadas(Object.entries(rankingEnv).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => (b.indicacoes as number) - (a.indicacoes as number)));
      setRankingRecebidas(Object.entries(rankingRec).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => (b.indicacoes as number) - (a.indicacoes as number)));

      // Balanço Grupo x Parceiros
      const balGrupo = oportunidadesFiltradas.filter((op: any) => op.empresa_origem.tipo === "intragrupo" && op.empresa_destino.tipo === "parceiro").length;
      const balParc = oportunidadesFiltradas.filter((op: any) => op.empresa_origem.tipo === "parceiro" && op.empresa_destino.tipo === "intragrupo").length;
      setBalanco([
        { tipo: "Grupo → Parceiros", valor: balGrupo },
        { tipo: "Parceiros → Grupo", valor: balParc }
      ]);
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // TABELA MATRIZ com totalizadores e opacidade nos zeros
  function renderMatrizTable(rows: any[], colKey: string, label: string) {
    if (!rows.length) return <div className="text-center">Nenhum dado</div>;
    const cols = Object.keys(rows[0]).filter(c => c !== colKey);
    const colTotals: any = {};
    cols.forEach(c => {
      colTotals[c] = rows.reduce((acc, row) => acc + (row[c] !== '-' ? row[c] : 0), 0);
    });
    const grandTotal = Object.values(colTotals).reduce((a: any, b: any) => a + b, 0);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">{label}</th>
              {cols.map(c => <th className="border p-1" key={c}>{c}</th>)}
              <th className="border p-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              let rowTotal = 0;
              return (
                <tr key={idx}>
                  <td className="border p-1 font-bold">{row[colKey]}</td>
                  {cols.map(c => {
                    let value = row[c];
                    if (value === '-') return <td className="border p-1 text-center opacity-60" key={c}>-</td>;
                    rowTotal += (value as number);
                    return <td className={`border p-1 text-center ${value === 0 ? 'opacity-40' : ''}`} key={c}>{value}</td>;
                  })}
                  <td className="border p-1 text-center font-bold">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="border p-1 font-bold">Total</td>
              {cols.map(c => (
                <td className={`border p-1 text-center font-bold ${colTotals[c] === 0 ? 'opacity-40' : ''}`} key={c}>{colTotals[c]}</td>
              ))}
              <td className="border p-1 text-center font-bold">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  // GRÁFICO DIVERGENTE INTRAGRUPO
  function renderMatrizDivergenteBarChart(matrizIntraRows: any[]) {
    if (!matrizIntraRows.length) return <div className="text-center text-xs">Nenhum dado para gráfico</div>;
    const empresasNomes = matrizIntraRows.map(row => row.origem);
    const dados = empresasNomes.map(nome => {
      let recebidas = 0;
      let enviadas = 0;
      matrizIntraRows.forEach(row => {
        if (row.origem === nome) {
          Object.entries(row).forEach(([key, value]) => {
            if (key !== "origem" && value !== '-' && key !== nome) enviadas += (value as number);
          });
        } else {
          if (row[nome] !== undefined && row[nome] !== '-' && row.origem !== nome) {
            recebidas += (row[nome] as number);
          }
        }
      });
      const saldo = recebidas - enviadas;
      return {
        empresa: nome,
        recebidas,
        enviadas: -enviadas,
        saldo
      };
    });

    const maxAbs = Math.max(
      5,
      ...dados.map(d => Math.abs(d.recebidas)),
      ...dados.map(d => Math.abs(d.enviadas)),
      ...dados.map(d => Math.abs(d.saldo))
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
        <BarChart data={dados} margin={{top: 20, right: 30, left: 0, bottom: 10}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" tick={{ fontWeight: 600 }} />
          <YAxis domain={[-maxAbs, maxAbs]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ paddingBottom: 12, fontWeight: 700 }}
            formatter={(value: string) => {
              if (value === "recebidas") return <span style={{ color: BAR_COLOR_RECEBIDAS }}>Recebidas</span>;
              if (value === "enviadas") return <span style={{ color: BAR_COLOR_ENVIADAS }}>Enviadas</span>;
              if (value === "saldo") return <span style={{ color: BAR_COLOR_SALDO }}>Saldo</span>;
              return value;
            }}
          />
          <ReferenceLine y={0} stroke="#222" strokeWidth={2.5} />
          <Bar dataKey="recebidas" name="Recebidas" fill={BAR_COLOR_RECEBIDAS} barSize={20}/>
          <Bar dataKey="enviadas" name="Enviadas" fill={BAR_COLOR_ENVIADAS} barSize={20}/>
          <Bar dataKey="saldo" name="Saldo" fill={BAR_COLOR_SALDO} barSize={8}/>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // GRÁFICO DE LINHAS MENSAL INTRAGRUPO COM DESTAQUE
  function renderMatrizLineChart(oportunidades: any[], empresasIntra: any[]) {
    if (!empresasIntra.length || !oportunidades.length) return <div className="text-center text-xs">Nenhum dado para gráfico</div>;

    // Gera lista de meses entre dataInicio e dataFim
    const start = dataInicio ?? new Date();
    const end = dataFim ?? new Date();
    let months: Date[] = [];
    let d = new Date(start.getFullYear(), start.getMonth(), 1);
    while (d <= end) {
      months.push(new Date(d));
      d.setMonth(d.getMonth() + 1);
    }

    // GARANTE ORDEM CRESCENTE (mais antigo primeiro)
    months.sort((a, b) => a.getTime() - b.getTime());

    // Para cada mês, para cada empresa, calcula recebidas e enviadas
    const data: any[] = months.map((monthDate) => {
      const monthYear = getMonthYear(monthDate);
      let entry: any = { month: monthYear };
      empresasIntra.forEach((empresa, idx) => {
        // Recebidas: oportunidades onde destino é a empresa (tipo intragrupo) nesse mês
        entry[`rec_${empresa.nome}`] = oportunidades.filter((op: any) => {
          if (!op.empresa_destino || !op.data_indicacao) return false;
          const opDate = new Date(op.data_indicacao);
          return op.empresa_destino.nome === empresa.nome &&
            op.empresa_destino.tipo === "intragrupo" &&
            opDate.getMonth() === monthDate.getMonth() &&
            opDate.getFullYear() === monthDate.getFullYear();
        }).length;
        // Enviadas: oportunidades onde origem é a empresa (tipo intragrupo) nesse mês (negativo)
        entry[`env_${empresa.nome}`] = -oportunidades.filter((op: any) => {
          if (!op.empresa_origem || !op.data_indicacao) return false;
          const opDate = new Date(op.data_indicacao);
          return op.empresa_origem.nome === empresa.nome &&
            op.empresa_origem.tipo === "intragrupo" &&
            opDate.getMonth() === monthDate.getMonth() &&
            opDate.getFullYear() === monthDate.getFullYear();
        }).length;
      });
      return entry;
    });

    // Seleção para destaque
    return (
      <div>
        <div className="flex mb-2 items-center">
          <Label className="mr-2">Empresa em destaque</Label>
          <Select
            value={empresaSelecionadaLinha}
            onValueChange={v => setEmpresaSelecionadaLinha(v)}
          >
            <SelectTrigger className="w-64">
              <SelectValue>
                {empresaSelecionadaLinha === "all" ? "Todas as empresas" : empresaSelecionadaLinha}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresasIntra.map((empresa, idx) => (
                <SelectItem key={empresa.nome} value={empresa.nome}>{empresa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ResponsiveContainer width="99%" height={380}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(v: any) => Math.abs(Number(v))}
              labelFormatter={v => `Mês: ${v}`}
            />
            <Legend />
            {empresasIntra.map((empresa, idx) => (
              <Line
                key={`rec_${empresa.nome}`}
                type="monotone"
                dataKey={`rec_${empresa.nome}`}
                stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                name={`${empresa.nome} Recebidas`}
                dot={{ r: 3 }}
                strokeWidth={2}
                isAnimationActive={false}
                legendType="line"
                opacity={empresaSelecionadaLinha === 'all' || empresaSelecionadaLinha === empresa.nome ? 1 : 0.1}
                style={{
                  filter: empresaSelecionadaLinha === 'all' || empresaSelecionadaLinha === empresa.nome ? 'none' : 'grayscale(90%) blur(1px)'
                }}
              />
            ))}
            {empresasIntra.map((empresa, idx) => (
              <Line
                key={`env_${empresa.nome}`}
                type="monotone"
                dataKey={`env_${empresa.nome}`}
                stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                strokeDasharray="5 5"
                name={`${empresa.nome} Enviadas`}
                dot={{ r: 3 }}
                strokeWidth={2}
                isAnimationActive={false}
                legendType="line"
                opacity={empresaSelecionadaLinha === 'all' || empresaSelecionadaLinha === empresa.nome ? 1 : 0.1}
                style={{
                  filter: empresaSelecionadaLinha === 'all' || empresaSelecionadaLinha === empresa.nome ? 'none' : 'grayscale(90%) blur(1px)'
                }}
              />
            ))}
            <ReferenceLine y={0} stroke="#222" strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  function renderRankingBarChart(ranking: any[], label: string) {
    if (!ranking.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={ranking}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="indicacoes" name={label} fill={BAR_COLOR_RECEBIDAS}>
            <LabelList dataKey="indicacoes" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderBalancoBarChart(balanco: any[]) {
    if (!balanco.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={balanco}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tipo" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="valor" name="Quantidade" fill={BAR_COLOR_SALDO}>
            <LabelList dataKey="valor" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  function renderStatusPieChart(statusDistribuicao: any[]) {
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
            fill={BAR_COLOR_RECEBIDAS}
            dataKey="total"
            nameKey="status"
            label={({ name, percent }: { name: string, percent: number }) => 
              `${getStatusLabel(name)} ${(Number(percent) * 100).toFixed(0)}%`
            }
          >
            {statusDistribuicao.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props: any) => [`${value}`, getStatusLabel(props.payload.status)]} />
          <Legend formatter={(value: string) => getStatusLabel(value)} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  function renderQualidadeBarChart(qualidadeData: any[]) {
    if (!qualidadeData.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={qualidadeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="origem" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ganho" name="Ganhas" fill="#22c55e">
            <LabelList dataKey="ganho" position="top" />
          </Bar>
          <Bar dataKey="perdido" name="Perdidas" fill="#ef4444">
            <LabelList dataKey="perdido" position="top" />
          </Bar>
          <Bar dataKey="total" name="Total" fill="#a1a1aa">
            <LabelList dataKey="total" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ------------------- RENDER -------------------
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Label htmlFor="dataInicio">Data Inicial</Label>
          <DatePicker
            date={dataInicio}
            setDate={setDataInicio}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="dataFim">Data Final</Label>
          <DatePicker
            date={dataFim}
            setDate={setDataFim}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="empresaId">Empresa</Label>
          <Select
            value={empresaId === "" ? "all" : empresaId}
            onValueChange={v => setEmpresaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status === "" ? "all" : status}
            onValueChange={v => setStatus(v === "all" ? "" : v)}
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
          <Select value={periodo} onValueChange={v => setPeriodo(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mensal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Novo filtro de Ano do Quarter */}
        {periodo === "quarter" && (
          <>
          <div className="w-full md:w-auto">
            <Label htmlFor="quarter">Quarter</Label>
            <MultiSelect
              value={quarters.join(',')}
              onValueChange={(v) => setQuarters(v ? v.split(',') : [])}
            >
              {quartersOptions.map(q => (
                <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
              ))}
            </MultiSelect>
            <div className="text-xs text-muted-foreground mt-1">Você pode selecionar um ou mais quarters</div>
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="quarterYear">Ano</Label>
            <Select
              value={String(quarterYear)}
              onValueChange={v => setQuarterYear(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(ano => (
                  <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          </>
        )}
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
              <CardDescription>Quem indica para quem dentro do grupo</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                <>
                  {renderMatrizTable(matrizIntra, "origem", "Origem \\ Destino")}
                  <div className="mt-6">{renderMatrizDivergenteBarChart(matrizIntra)}</div>
                  <div className="mt-10">{renderQualidadeBarChart(qualidadeData)}</div>
                  <div className="mt-10">{renderMatrizLineChart(oportunidades, empresas.filter(e => e.tipo === "intragrupo"))}</div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcerias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
              <CardDescription>Indicações envolvendo parceiros externos</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">Carregando...</div>
              ) : (
                renderMatrizTable(matrizParceiros, "parceiro", "Parceiro \\ Intra")
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Enviadas</CardTitle>
              <CardDescription>Parceiros que mais enviam indicações</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRankingBarChart(rankingEnviadas, "Enviadas")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros - Recebidas</CardTitle>
              <CardDescription>Parceiros que mais recebem indicações</CardDescription>
            </CardHeader>
            <CardContent>
              {renderRankingBarChart(rankingRecebidas, "Recebidas")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balanço Grupo × Parceiros</CardTitle>
              <CardDescription>Comparação entre indicações enviadas e recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              {renderBalancoBarChart(balanco)}
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
              {renderStatusPieChart(statusDistribuicao)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
