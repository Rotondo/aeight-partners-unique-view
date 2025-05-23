import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { Oportunidade, Empresa } from "@/types";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";
import { Edit, Check, X as Cancel } from "lucide-react";

function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}
function getQuarterLabel(date: Date) {
  return `Q${getQuarter(date)}/${date.getFullYear()}`;
}
function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}
const STATUS_COLORS = {
  ganho: "#22c55e",
  perdido: "#ef4444",
  negociando: "#fbbf24",
  em_contato: "#3b82f6",
  Contato: "#6366f1",
};

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<"all" | "intra" | "extra">("all");
  const [periodo, setPeriodo] = useState<"mes" | "quarter">("mes");
  const [statusFiltro, setStatusFiltro] = useState<"all" | "ganho" | "perdido" | "andamento">("all");
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("all");
  const [empresaFiltroType, setEmpresaFiltroType] = useState<"remetente" | "destinatario" | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<any>({});
  const [saldoEmpresas, setSaldoEmpresas] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusChartData, setStatusChartData] = useState<any[]>([]);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Oportunidade>>({});
  const [opportunidadesList, setOportunidadesList] = useState<Oportunidade[]>([]);
  const [ordemLista, setOrdemLista] = useState<{ col: string; asc: boolean }>({ col: "data_indicacao", asc: false });
  const [matrizIntra, setMatrizIntra] = useState<any[]>([]);
  const [matrizParceiros, setMatrizParceiros] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: oportunidadesData, error } = await supabase
        .from("oportunidades")
        .select("*, empresa_origem:empresas!empresa_origem_id(id, nome, tipo), empresa_destino:empresas!empresa_destino_id(id, nome, tipo)");
      if (error) throw error;

      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .order("nome");
      if (empresasError) throw empresasError;

      // Enriquecimento
      const oportunidadesEnriquecidas: Oportunidade[] = oportunidadesData.map((op: any) => {
        const tipoOrigem = op.empresa_origem?.tipo || "";
        const tipoDestino = op.empresa_destino?.tipo || "";
        let tipo_relacao: "intra" | "extra" = "extra";
        if (tipoOrigem === "intragrupo" && tipoDestino === "intragrupo") tipo_relacao = "intra";
        return {
          ...op,
          tipo_relacao,
          isRemetente: true,
          isDestinatario: true,
        };
      });

      setOportunidades(oportunidadesEnriquecidas);
      setEmpresas(empresasData);
      processStats(oportunidadesEnriquecidas, empresasData);
      processSaldoEmpresas(oportunidadesEnriquecidas, empresasData);
      processChart(oportunidadesEnriquecidas);
      processStatusChart(oportunidadesEnriquecidas);
      processMatriz(oportunidadesEnriquecidas, empresasData);
      processOportunidadesList(oportunidadesEnriquecidas);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Agrupa por quarter
  function groupByQuarter(data: Oportunidade[], tipo: "intra" | "extra" | "all") {
    const result: Record<string, { enviadas: number; recebidas: number; dateObj: Date }> = {};
    data.forEach((op) => {
      const d = new Date(op.data_indicacao);
      const key = getQuarterLabel(d);
      if (!result[key]) result[key] = { enviadas: 0, recebidas: 0, dateObj: d };
      if (tipo === "intra" && op.tipo_relacao === "intra") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      } else if (tipo === "extra" && op.tipo_relacao === "extra") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      } else if (tipo === "all") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      }
    });
    return Object.entries(result)
      .map(([quarter, vals]) => ({ quarter, ...vals }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }

  // Agrupa por mês (CORRIGIDO PARA ORDENAR POR DATA REAL)
  function groupByMonth(data: Oportunidade[], tipo: "intra" | "extra" | "all") {
    const result: Record<string, { enviadas: number; recebidas: number; dateObj: Date }> = {};
    data.forEach((op) => {
      const d = new Date(op.data_indicacao);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!result[key]) result[key] = { enviadas: 0, recebidas: 0, dateObj: d };
      if (tipo === "intra" && op.tipo_relacao === "intra") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      } else if (tipo === "extra" && op.tipo_relacao === "extra") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      } else if (tipo === "all") {
        result[key].enviadas += op.isRemetente ? 1 : 0;
        result[key].recebidas += op.isDestinatario ? 1 : 0;
      }
    });
    return Object.entries(result)
      .map(([mes, vals]) => {
        const [year, month] = mes.split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        const mesLabel = date.toLocaleString("pt-BR", { month: "short" });
        return { mes: `${mesLabel}/${year.slice(2)}`, ...vals, dateObj: date };
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }

  function processStats(oportunidades: Oportunidade[], empresas: Empresa[]) {
    const total = oportunidades.length;
    const ganhas = oportunidades.filter((op) => op.status === "ganho").length;
    const perdidas = oportunidades.filter((op) => op.status === "perdido").length;
    const andamento = total - ganhas - perdidas;
    const intra = oportunidades.filter((op) => op.tipo_relacao === "intra").length;
    const extra = oportunidades.filter((op) => op.tipo_relacao === "extra").length;

    let enviadas = 0, recebidas = 0;
    oportunidades.forEach((op) => {
      if (op.empresa_origem_id) enviadas++;
      if (op.empresa_destino_id) recebidas++;
    });

    setStats({
      total,
      ganhas,
      perdidas,
      andamento,
      intra,
      extra,
      enviadas,
      recebidas,
      saldo: enviadas - recebidas,
    });
  }

  function processSaldoEmpresas(oportunidades: Oportunidade[], empresas: Empresa[]) {
    const saldos = empresas
      .filter((e) => e.status)
      .map((empresa) => {
        const enviadas = oportunidades.filter((op) => op.empresa_origem_id === empresa.id).length;
        const recebidas = oportunidades.filter((op) => op.empresa_destino_id === empresa.id).length;
        return {
          empresa: empresa.nome,
          tipo: empresa.tipo,
          enviadas,
          recebidas,
          saldo: enviadas - recebidas,
        };
      })
      .sort((a, b) => b.saldo - a.saldo);
    setSaldoEmpresas(saldos);
  }

  function processChart(oportunidades: Oportunidade[]) {
    let filtradas = oportunidades;
    if (statusFiltro !== "all") {
      filtradas = filtradas.filter((op) => {
        if (statusFiltro === "andamento") return op.status !== "ganho" && op.status !== "perdido";
        return op.status === statusFiltro;
      });
    }
    if (tipoFiltro !== "all") {
      filtradas = filtradas.filter((op) => op.tipo_relacao === tipoFiltro);
    }
    if (empresaFiltro !== "all" && empresaFiltroType !== "all") {
      filtradas = filtradas.filter((op) =>
        empresaFiltroType === "remetente"
          ? op.empresa_origem_id === empresaFiltro
          : op.empresa_destino_id === empresaFiltro
      );
    }
    if (searchTerm) {
      filtradas = filtradas.filter((op) =>
        (op.empresa_origem?.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.empresa_destino?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const data =
      periodo === "mes"
        ? groupByMonth(filtradas, tipoFiltro)
        : groupByQuarter(filtradas, tipoFiltro);
    setChartData(data);
  }

  function processStatusChart(oportunidades: Oportunidade[]) {
    let filtradas = oportunidades;
    if (tipoFiltro !== "all") {
      filtradas = filtradas.filter((op) => op.tipo_relacao === tipoFiltro);
    }
    const statusCount: Record<string, number> = {};
    filtradas.forEach((op) => {
      const s = op.status || "indefinido";
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    setStatusChartData(
      Object.entries(statusCount).map(([status, value]) => ({
        status,
        value,
      }))
    );
  }

  function processMatriz(oportunidades: Oportunidade[], empresas: Empresa[]) {
    const intragrupo = empresas.filter((e) => e.tipo === "intragrupo");
    let matrizIntra: any[] = [];
    for (const origem of intragrupo) {
      const row: any = { origem: origem.nome };
      for (const destino of intragrupo) {
        if (origem.id === destino.id) {
          row[destino.nome] = "-";
        } else {
          row[destino.nome] = oportunidades.filter(
            (op) =>
              op.tipo_relacao === "intra" &&
              op.empresa_origem_id === origem.id &&
              op.empresa_destino_id === destino.id
          ).length;
        }
      }
      matrizIntra.push(row);
    }
    setMatrizIntra(matrizIntra);

    const parceiros = empresas.filter((e) => e.tipo === "parceiro");
    let matrizParc: any[] = [];
    for (const parceiro of parceiros) {
      const row: any = { parceiro: parceiro.nome };
      for (const intra of intragrupo) {
        row[intra.nome] =
          oportunidades.filter(
            (op) =>
              op.tipo_relacao === "extra" &&
              ((op.empresa_origem_id === parceiro.id && op.empresa_destino_id === intra.id) ||
                (op.empresa_origem_id === intra.id && op.empresa_destino_id === parceiro.id))
          ).length;
      }
      matrizParc.push(row);
    }
    setMatrizParceiros(matrizParc);
  }

  function processOportunidadesList(oportunidades: Oportunidade[]) {
    setOportunidadesList(oportunidades);
  }

  function exportSaldoCSV() {
    const headers = ["Empresa", "Tipo", "Enviadas", "Recebidas", "Saldo"];
    const rows = saldoEmpresas.map((s) => [
      s.empresa,
      s.tipo,
      s.enviadas,
      s.recebidas,
      s.saldo,
    ]);
    let csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "saldos_oportunidades.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSaveEdit(id: string) {
    try {
      const updates: Partial<Oportunidade> = { ...editValues };
      delete (updates as any).empresa_origem;
      delete (updates as any).empresa_destino;
      delete (updates as any).tipo_relacao;
      delete (updates as any).isRemetente;
      delete (updates as any).isDestinatario;
      const { error } = await supabase
        .from("oportunidades")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Oportunidade atualizada com sucesso." });
      setEditRowId(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao atualizar oportunidade.", variant: "destructive" });
    }
  }
  function handleEdit(oportunidade: Oportunidade) {
    setEditRowId(oportunidade.id);
    setEditValues({ ...oportunidade });
  }
  function handleCancelEdit() {
    setEditRowId(null);
    setEditValues({});
  }

  function ordenarLista(col: string) {
    setOrdemLista((prev) => ({
      col,
      asc: prev.col === col ? !prev.asc : true,
    }));
  }
  const listaOrdenada = [...opportunidadesList].sort((a, b) => {
    let vA: any = (a as any)[ordemLista.col];
    let vB: any = (b as any)[ordemLista.col];
    if (typeof vA === "string") vA = vA.toLowerCase();
    if (typeof vB === "string") vB = vB.toLowerCase();
    if (vA < vB) return ordemLista.asc ? -1 : 1;
    if (vA > vB) return ordemLista.asc ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard de Oportunidades</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total de Oportunidades" value={loading ? "..." : stats.total} icon={<ReBarChart className="h-4 w-4 text-primary" />} color="bg-primary/10" description="Todas as oportunidades" />
        <DashboardCard title="Ganhos" value={loading ? "..." : stats.ganhas} icon={<ReBarChart className="h-4 w-4 text-green-500" />} color="bg-green-500/10" description="Oportunidades ganhas" />
        <DashboardCard title="Perdidos" value={loading ? "..." : stats.perdidas} icon={<ReBarChart className="h-4 w-4 text-destructive" />} color="bg-destructive/10" description="Oportunidades perdidas" />
        <DashboardCard title="Em Andamento" value={loading ? "..." : stats.andamento} icon={<ReBarChart className="h-4 w-4 text-amber-500" />} color="bg-amber-500/10" description="Em negociação" />
        <DashboardCard title="Intra Grupo" value={loading ? "..." : stats.intra} icon={<ReBarChart className="h-4 w-4 text-blue-500" />} color="bg-blue-500/10" description="Trocas dentro do grupo" />
        <DashboardCard title="Extra Grupo" value={loading ? "..." : stats.extra} icon={<ReBarChart className="h-4 w-4 text-purple-600" />} color="bg-purple-600/10" description="Trocas com terceiros" />
        <DashboardCard title="Enviadas" value={loading ? "..." : stats.enviadas} icon={<ReBarChart className="h-4 w-4 text-cyan-500" />} color="bg-cyan-500/10" description="Oportunidades enviadas" />
        <DashboardCard title="Recebidas" value={loading ? "..." : stats.recebidas} icon={<ReBarChart className="h-4 w-4 text-rose-500" />} color="bg-rose-500/10" description="Oportunidades recebidas" />
        <DashboardCard title="Saldo Envio-Recebimento" value={loading ? "..." : stats.saldo} icon={<ReBarChart className="h-4 w-4 text-gray-600" />} color="bg-gray-600/10" description="Saldo entre envio e recebimento" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Gráfico</CardTitle>
          <CardDescription>Refine os dados exibidos no gráfico</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <Select value={tipoFiltro} onValueChange={(v) => setTipoFiltro(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="intra">Intra Grupo</SelectItem>
              <SelectItem value="extra">Extra Grupo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFiltro} onValueChange={(v) => setStatusFiltro(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
              <SelectItem value="andamento">Em Andamento</SelectItem>
            </SelectContent>
          </Select>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mensal</SelectItem>
              <SelectItem value="quarter">Quarter (trimestre)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={empresaFiltroType} onValueChange={(v) => setEmpresaFiltroType(v as any)}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Tipo de Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="remetente">Origem</SelectItem>
              <SelectItem value="destinatario">Destino</SelectItem>
            </SelectContent>
          </Select>
          <Select value={empresaFiltro} onValueChange={(v) => setEmpresaFiltro(v)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Buscar empresa..." value={searchTerm} className="w-[200px]" onChange={(e) => setSearchTerm(e.target.value)} />
        </CardContent>
      </Card>
      {/* Gráfico funcional */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Oportunidades ({periodo === "mes" ? "Mensal" : "Quarter"})</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={periodo === "mes" ? "mes" : "quarter"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enviadas" fill="#0088fe" name="Enviadas" />
              <Bar dataKey="recebidas" fill="#00c49f" name="Recebidas" />
            </ReBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Distribuição por Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status ({tipoFiltro === "all" ? "Todos" : tipoFiltro === "intra" ? "Intra Grupo" : "Extra Grupo"})</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusChartData} dataKey="value" nameKey="status" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {statusChartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={STATUS_COLORS[entry.status] || "#8884d8"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Matriz de Indicações Intragrupo */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
          <CardDescription>Visualização de quem indica para quem dentro do grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="border p-1">Origem \ Destino</th>
                  {empresas.filter(e => e.tipo === "intragrupo").map(dest => (
                    <th className="border p-1" key={dest.id}>{dest.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrizIntra.map((row, idx) => (
                  <tr key={row.origem + idx}>
                    <td className="border p-1 font-bold">{row.origem}</td>
                    {empresas.filter(e => e.tipo === "intragrupo").map(dest => (
                      <td className="border p-1 text-center" key={dest.id}>{row[dest.nome]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Matriz de Indicações com Parceiros */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
          <CardDescription>Visualização das indicações envolvendo parceiros externos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="border p-1">Parceiro \ Intra</th>
                  {empresas.filter(e => e.tipo === "intragrupo").map(intra => (
                    <th className="border p-1" key={intra.id}>{intra.nome}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrizParceiros.map((row, idx) => (
                  <tr key={row.parceiro + idx}>
                    <td className="border p-1 font-bold">{row.parceiro}</td>
                    {empresas.filter(e => e.tipo === "intragrupo").map(intra => (
                      <td className="border p-1 text-center" key={intra.id}>{row[intra.nome]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Lista detalhada editável */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Detalhada de Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("empresa_origem.nome")}>Origem</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("empresa_destino.nome")}>Destino</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("status")}>Status</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("valor")}>Valor</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("nome_lead")}>Lead</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("tipo_relacao")}>Tipo</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("data_indicacao")}>Data Indicação</th>
                  <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("data_fechamento")}>Data Fechamento</th>
                  <th className="border p-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaOrdenada.map((op, idx) => (
                  <tr key={op.id + idx}>
                    <td className="border p-1">{op.empresa_origem?.nome || "-"}</td>
                    <td className="border p-1">{op.empresa_destino?.nome || "-"}</td>
                    <td className="border p-1">
                      {editRowId === op.id ? (
                        <Select value={editValues.status || ""} onValueChange={v => setEditValues(e => ({ ...e, status: v }))}>
                          <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="em_contato">Em Contato</SelectItem>
                            <SelectItem value="negociando">Negociando</SelectItem>
                            <SelectItem value="ganho">Ganho</SelectItem>
                            <SelectItem value="perdido">Perdido</SelectItem>
                            <SelectItem value="Contato">Contato</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : op.status}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id ? (
                        <Input type="number" className="w-[80px]" value={editValues.valor ?? ""} onChange={e => setEditValues(ev => ({ ...ev, valor: Number(e.target.value) }))} />
                      ) : (op.valor ?? "-")}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id ? (
                        <Input value={editValues.nome_lead ?? ""} onChange={e => setEditValues(ev => ({ ...ev, nome_lead: e.target.value }))} className="w-[110px]" />
                      ) : (op.nome_lead ?? "-")}
                    </td>
                    <td className="border p-1">
                      {op.tipo_relacao}
                    </td>
                    <td className="border p-1">{formatDate(op.data_indicacao)}</td>
                    <td className="border p-1">{op.data_fechamento ? formatDate(op.data_fechamento) : "-"}</td>
                    <td className="border p-1">
                      {editRowId === op.id ? (
                        <>
                          <Button size="icon" variant="success" title="Salvar" onClick={() => handleSaveEdit(op.id)}><Check className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" title="Cancelar" onClick={handleCancelEdit}><Cancel className="h-4 w-4" /></Button>
                        </>
                      ) : (
                        <Button size="icon" variant="ghost" title="Editar" onClick={() => handleEdit(op)}><Edit className="h-4 w-4" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAccess />
        <AboutPlatform />
      </div>
    </div>
  );
};

export default DashboardPage;
