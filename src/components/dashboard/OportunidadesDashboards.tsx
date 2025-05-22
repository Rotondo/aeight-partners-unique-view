import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  LabelList // <-- IMPORTAÇÃO ADICIONADA
} from 'recharts';

// CORES EDITÁVEIS PARA O GRÁFICO DIVERGENTE
const BAR_COLOR_RECEBIDAS = '#0088FE';   // para cima (recebidas)
const BAR_COLOR_ENVIADAS = '#FF8042';    // para baixo (enviadas)
const BAR_COLOR_SALDO = '#3ad29f';       // barra interna saldo

const STATUS_COLORS = {
  'em_contato': '#FFBB28',
  'negociando': '#0088FE',
  'ganho': '#00C49F',
  'perdido': '#FF8042',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const quartersOptions = [
  { value: 'Q1', label: 'Q1 (jan-mar)' },
  { value: 'Q2', label: 'Q2 (abr-jun)' },
  { value: 'Q3', label: 'Q3 (jul-set)' },
  { value: 'Q4', label: 'Q4 (out-dez)' },
];

function getQuarter(date) {
  const month = date.getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}

function getStatusLabel(status) {
  switch (status) {
    case 'em_contato': return 'Em Contato';
    case 'negociando': return 'Negociando';
    case 'ganho': return 'Ganho';
    case 'perdido': return 'Perdido';
    default: return status;
  }
}

export const OportunidadesDashboards: React.FC = () => {
  const [empresas, setEmpresas] = useState([]);
  const [matrizIntra, setMatrizIntra] = useState([]);
  const [matrizParceiros, setMatrizParceiros] = useState([]);
  const [statusDistribuicao, setStatusDistribuicao] = useState([]);
  const [rankingEnviadas, setRankingEnviadas] = useState([]);
  const [rankingRecebidas, setRankingRecebidas] = useState([]);
  const [balanco, setBalanco] = useState([]);
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [empresaId, setEmpresaId] = useState('');
  const [status, setStatus] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [quarters, setQuarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [dataInicio, dataFim, empresaId, status, periodo, quarters]);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: empresasDb } = await supabase.from("empresas").select("*").order("nome");
      setEmpresas(empresasDb || []);
      const { data: oportunidadesDb } = await supabase.from("oportunidades").select("*, empresa_origem:empresas!empresa_origem_id(id, nome, tipo), empresa_destino:empresas!empresa_destino_id(id, nome, tipo)");
      const oportunidades = (oportunidadesDb || []).filter(op => {
        const dataInd = op.data_indicacao ? new Date(op.data_indicacao) : null;
        let match = true;
        if (dataInicio && dataInd) match = match && dataInd >= dataInicio;
        if (dataFim && dataInd) match = match && dataInd <= dataFim;
        if (empresaId) match = match && (op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId);
        if (status) match = match && op.status === status;
        if (periodo === "quarter" && dataInd) match = match && quarters.includes(getQuarter(dataInd));
        return match;
      });

      // Matriz INTRAGRUPO
      const intra = empresasDb.filter(e => e.tipo === "intragrupo");
      const matrizIntraRows = intra.map(orig => {
        const row = { origem: orig.nome };
        intra.forEach(dest => {
          if (orig.id === dest.id) {
            row[dest.nome] = '-';
          } else {
            row[dest.nome] = oportunidades.filter(
              op =>
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
      const parceiros = empresasDb.filter(e => e.tipo === "parceiro");
      const matrizParceirosRows = parceiros.map(parc => {
        const row = { parceiro: parc.nome };
        intra.forEach(intraE => {
          row[intraE.nome] =
            oportunidades.filter(op =>
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

      // Status - Geral
      const statusCount = {};
      oportunidades.forEach(op => {
        if (!statusCount[op.status]) statusCount[op.status] = 0;
        statusCount[op.status]++;
      });
      setStatusDistribuicao(Object.entries(statusCount).map(([status, total]) => ({ status, total })));

      // Ranking Enviadas/Recebidas
      const rankingEnv = {};
      const rankingRec = {};
      oportunidades.forEach(op => {
        if (op.empresa_origem?.nome) {
          if (!rankingEnv[op.empresa_origem.nome]) rankingEnv[op.empresa_origem.nome] = 0;
          rankingEnv[op.empresa_origem.nome]++;
        }
        if (op.empresa_destino?.nome) {
          if (!rankingRec[op.empresa_destino.nome]) rankingRec[op.empresa_destino.nome] = 0;
          rankingRec[op.empresa_destino.nome]++;
        }
      });
      setRankingEnviadas(Object.entries(rankingEnv).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));
      setRankingRecebidas(Object.entries(rankingRec).map(([empresa, indicacoes]) => ({ empresa, indicacoes })).sort((a, b) => b.indicacoes - a.indicacoes));

      // Balanço Grupo x Parceiros
      const balGrupo = oportunidades.filter(op => op.empresa_origem.tipo === "intragrupo" && op.empresa_destino.tipo === "parceiro").length;
      const balParc = oportunidades.filter(op => op.empresa_origem.tipo === "parceiro" && op.empresa_destino.tipo === "intragrupo").length;
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

  // Renderização - TABELA MATRIZ com totalizadores e opacidade nos zeros
  function renderMatrizTable(rows, colKey, label) {
    if (!rows.length) return <div className="text-center">Nenhum dado</div>;
    const cols = Object.keys(rows[0]).filter(c => c !== colKey);
    const colTotals = {};
    cols.forEach(c => {
      colTotals[c] = rows.reduce((acc, row) => acc + (row[c] !== '-' ? row[c] : 0), 0);
    });
    const grandTotal = Object.values(colTotals).reduce((a, b) => a + b, 0);
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
                    rowTotal += value;
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

  // --------- GRÁFICO DIVERGENTE INTRAGRUPO ---------
  function renderMatrizDivergenteBarChart(matrizIntraRows) {
    if (!matrizIntraRows.length) return <div className="text-center text-xs">Nenhum dado para gráfico</div>;
    const empresasNomes = matrizIntraRows.map(row => row.origem);

    // Para cada empresa, calcula:
    // recebidas: soma das colunas daquele nome (exceto '-')
    // enviadas: soma da linha dela (exceto '-')
    const dados = empresasNomes.map(nome => {
      let recebidas = 0;
      let enviadas = 0;
      matrizIntraRows.forEach(row => {
        if (row.origem === nome) {
          Object.entries(row).forEach(([key, value]) => {
            if (key !== "origem" && value !== '-' && key !== nome) enviadas += value;
          });
        } else {
          if (row[nome] !== undefined && row[nome] !== '-' && row.origem !== nome) {
            recebidas += row[nome];
          }
        }
      });
      const saldo = recebidas - enviadas;
      return {
        empresa: nome,
        recebidas,
        enviadas: -enviadas, // Negativo, vai pra baixo
        saldo
      };
    });

    // Descobre o maior módulo para ajustar o eixo
    const maxAbs = Math.max(...dados.map(d => Math.abs(d.recebidas)), ...dados.map(d => Math.abs(d.enviadas)), 10);

    return (
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={dados} margin={{top: 20, right: 30, left: 0, bottom: 10}}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" />
          <YAxis domain={[-maxAbs, maxAbs]} />
          <Tooltip formatter={v => Math.abs(v)} />
          <Legend />
          <ReferenceLine y={0} stroke="#888" />
          <Bar dataKey="recebidas" name="Recebidas" fill={BAR_COLOR_RECEBIDAS} stackId="a" />
          <Bar dataKey="enviadas" name="Enviadas" fill={BAR_COLOR_ENVIADAS} stackId="a" />
          <Bar dataKey="saldo" name="Saldo" fill={BAR_COLOR_SALDO} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // Gráficos dos rankings, balanço e status - igual ao anterior
  function renderRankingBarChart(ranking, label) {
    if (!ranking.length) return <div className="text-center">Nenhum dado</div>;
    return (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={ranking}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="empresa" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="indicacoes" name={label} fill={COLORS[1]}>
            <LabelList dataKey="indicacoes" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  function renderBalancoBarChart(balanco) {
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
  function renderStatusPieChart(statusDistribuicao) {
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
                fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value}`, getStatusLabel(props.payload.status)]} />
          <Legend formatter={getStatusLabel} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

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
        {periodo === "quarter" && (
          <div className="w-full md:w-auto">
            <Label htmlFor="quarter">Quarter</Label>
            <Select
              value={quarters.join(',')}
              onValueChange={v => setQuarters(
                v ? v.split(',') : []
              )}
              multiple
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione quarter(s)" />
              </SelectTrigger>
              <SelectContent>
                {quartersOptions.map(q => (
                  <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground mt-1">Você pode selecionar um ou mais quarters</div>
          </div>
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
