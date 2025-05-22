import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { Oportunidade, Empresa } from "@/types";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";
import { Edit, Check, X as Cancel } from "lucide-react";

function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

function getQuarterKey(date: Date) {
  return `Q${getQuarter(date)}/${date.getFullYear()}`;
}

function groupByQuarter(data: Oportunidade[], tipo: "intra" | "extra" | "all") {
  const result: Record<string, { enviadas: number; recebidas: number }> = {};
  data.forEach((op) => {
    const d = new Date(op.data_indicacao);
    const key = getQuarterKey(d);
    if (!result[key]) result[key] = { enviadas: 0, recebidas: 0 };
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
    .sort((a, b) => a.quarter.localeCompare(b.quarter));
}

function groupByMonth(data: Oportunidade[], tipo: "intra" | "extra" | "all") {
  const result: Record<string, { enviadas: number; recebidas: number }> = {};
  data.forEach((op) => {
    const d = new Date(op.data_indicacao);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!result[key]) result[key] = { enviadas: 0, recebidas: 0 };
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
      return { mes: `${mesLabel}/${year.slice(2)}`, ...vals };
    })
    .sort((a, b) => a.mes.localeCompare(b.mes));
}

// Agrupa oportunidades para status
function groupByStatus(data: Oportunidade[], tipo: "all" | "intra" | "extra") {
  const result: Record<string, number> = {};
  data.forEach((op) => {
    if (tipo === "intra" && op.tipo_relacao !== "intra") return;
    if (tipo === "extra" && op.tipo_relacao !== "extra") return;
    result[op.status] = (result[op.status] || 0) + 1;
  });
  return Object.entries(result).map(([status, count]) => ({ status, count }));
}

const statusLabels: Record<string, string> = {
  ganho: "Ganho",
  perdido: "Perdido",
  negociando: "Negociando",
  em_contato: "Em Contato",
  Contato: "Contato",
};

const editableFields: (keyof Oportunidade)[] = [
  "status", "empresa_origem_id", "empresa_destino_id", "valor", "motivo_perda", "observacoes", "nome_lead"
];

const DashboardPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<"all" | "intra" | "extra">("all");
  const [periodo, setPeriodo] = useState<"mes" | "quarter">("mes");
  const [statusFiltro, setStatusFiltro] = useState<"all" | "ganho" | "perdido" | "andamento">("all");
  const [empresaFiltro, setEmpresaFiltro] = useState<string>("");
  const [empresaFiltroType, setEmpresaFiltroType] = useState<"remetente" | "destinatario" | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  // Edição da tabela
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Oportunidade>>({});
  const [sortColumn, setSortColumn] = useState<string>("data_indicacao");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Cards stats
  const [stats, setStats] = useState<any>({
    total: 0, ganhas: 0, perdidas: 0, andamento: 0, intra: 0, extra: 0, enviadas: 0, recebidas: 0, saldo: 0
  });

  const [saldoEmpresas, setSaldoEmpresas] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusChart, setStatusChart] = useState<any[]>([]);
  const [matrizIntra, setMatrizIntra] = useState<string[][]>([]);
  const [matrizParceiros, setMatrizParceiros] = useState<string[][]>([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      // Carrega oportunidades e empresas
      const { data: oportunidadesData, error } = await supabase
        .from("oportunidades")
        .select("*, empresa_origem:empresas!empresa_origem_id(nome, tipo), empresa_destino:empresas!empresa_destino_id(nome, tipo)");
      if (error) throw error;
      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .order("nome");
      if (empresasError) throw empresasError;

      // Marca intra/extra grupo
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
      processMatrizes(oportunidadesEnriquecidas, empresasData);
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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
    setStats({ total, ganhas, perdidas, andamento, intra, extra, enviadas, recebidas, saldo: enviadas - recebidas });
  }

  function processSaldoEmpresas(oportunidades: Oportunidade[], empresas: Empresa[]) {
    const saldos = empresas.filter((e) => e.status).map((empresa) => {
      const enviadas = oportunidades.filter((op) => op.empresa_origem_id === empresa.id).length;
      const recebidas = oportunidades.filter((op) => op.empresa_destino_id === empresa.id).length;
      return { empresa: empresa.nome, tipo: empresa.tipo, enviadas, recebidas, saldo: enviadas - recebidas };
    }).sort((a, b) => b.saldo - a.saldo);
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
    if (tipoFiltro !== "all") filtradas = filtradas.filter((op) => op.tipo_relacao === tipoFiltro);
    if (empresaFiltro && empresaFiltroType !== "all") {
      filtradas = filtradas.filter((op) =>
        empresaFiltroType === "remetente" ? op.empresa_origem_id === empresaFiltro : op.empresa_destino_id === empresaFiltro
      );
    }
    if (searchTerm) {
      filtradas = filtradas.filter((op) =>
        (op.empresa_origem?.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (op.empresa_destino?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    const data = periodo === "mes" ? groupByMonth(filtradas, tipoFiltro) : groupByQuarter(filtradas, tipoFiltro);
    setChartData(data);
  }

  function processStatusChart(oportunidades: Oportunidade[]) {
    setStatusChart(groupByStatus(oportunidades, tipoFiltro));
  }

  function processMatrizes(oportunidades: Oportunidade[], empresas: Empresa[]) {
    // Matriz IntraGrupo
    const intraEmpresas = empresas.filter((e) => e.tipo === "intragrupo");
    const matriz: string[][] = [];
    matriz.push(["", ...intraEmpresas.map((e) => e.nome)]);
    intraEmpresas.forEach((rem) => {
      const row = [rem.nome];
      intraEmpresas.forEach((dest) => {
        const count = oportunidades.filter(
          (op) =>
            op.empresa_origem_id === rem.id &&
            op.empresa_destino_id === dest.id &&
            op.tipo_relacao === "intra"
        ).length;
        row.push(count ? String(count) : "");
      });
      matriz.push(row);
    });
    setMatrizIntra(matriz);

    // Matriz Parceiros
    const parceiros = empresas.filter((e) => e.tipo === "parceiro");
    const matrizP: string[][] = [];
    matrizP.push(["", ...parceiros.map((e) => e.nome)]);
    parceiros.forEach((rem) => {
      const row = [rem.nome];
      parceiros.forEach((dest) => {
        const count = oportunidades.filter(
          (op) =>
            op.empresa_origem_id === rem.id &&
            op.empresa_destino_id === dest.id &&
            op.tipo_relacao === "extra"
        ).length;
        row.push(count ? String(count) : "");
      });
      matrizP.push(row);
    });
    setMatrizParceiros(matrizP);
  }

  // Edição da tabela
  function handleEdit(op: Oportunidade) {
    setEditRowId(op.id);
    setEditValues({ ...op });
  }
  function handleEditChange(field: keyof Oportunidade, value: any) {
    setEditValues((v) => ({ ...v, [field]: value }));
  }
  async function handleSaveEdit(id: string) {
    try {
      const updates: Partial<Oportunidade> = { ...editValues };
      delete (updates as any).empresa_origem;
      delete (updates as any).empresa_destino;
      delete (updates as any).tipo_relacao;
      delete (updates as any).isRemetente;
      delete (updates as any).isDestinatario;
      delete (updates as any).created_at;
      delete (updates as any).data_indicacao; // não editável
      const { error } = await supabase.from("oportunidades").update(updates).eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Oportunidade atualizada." });
      setEditRowId(null); setEditValues({});
      fetchAll();
    } catch {
      toast({ title: "Erro", description: "Falha ao editar.", variant: "destructive" });
    }
  }
  function handleCancelEdit() { setEditRowId(null); setEditValues({}); }

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  const renderSortIcon = (col: string) =>
    sortColumn === col ? (sortAsc ? <span className="ml-1">&#9650;</span> : <span className="ml-1">&#9660;</span>) : null;

  // Ordenação da tabela de oportunidades
  let oportunidadesOrdenadas = [...oportunidades].sort((a, b) => {
    let vA: any, vB: any;
    if (sortColumn === "empresa_origem") {
      vA = a.empresa_origem?.nome || "";
      vB = b.empresa_origem?.nome || "";
    } else if (sortColumn === "empresa_destino") {
      vA = a.empresa_destino?.nome || "";
      vB = b.empresa_destino?.nome || "";
    } else {
      vA = (a as any)[sortColumn] ?? "";
      vB = (b as any)[sortColumn] ?? "";
    }
    if (typeof vA === "string") vA = vA.toLowerCase();
    if (typeof vB === "string") vB = vB.toLowerCase();
    if (vA < vB) return sortAsc ? -1 : 1;
    if (vA > vB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Dashboard de Oportunidades</h1>
      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="Total de Oportunidades" value={loading ? "..." : stats.total} icon={<BarChart className="h-4 w-4 text-primary" />} color="bg-primary/10" description="Todas as oportunidades registradas" />
        <DashboardCard title="Ganhos" value={loading ? "..." : stats.ganhas} icon={<BarChart className="h-4 w-4 text-green-500" />} color="bg-green-500/10" description="Oportunidades ganhas" />
        <DashboardCard title="Perdidos" value={loading ? "..." : stats.perdidas} icon={<BarChart className="h-4 w-4 text-destructive" />} color="bg-destructive/10" description="Oportunidades perdidas" />
        <DashboardCard title="Em Andamento" value={loading ? "..." : stats.andamento} icon={<BarChart className="h-4 w-4 text-amber-500" />} color="bg-amber-500/10" description="Em negociação" />
        <DashboardCard title="Intra Grupo" value={loading ? "..." : stats.intra} icon={<BarChart className="h-4 w-4 text-blue-500" />} color="bg-blue-500/10" description="Trocas dentro do grupo" />
        <DashboardCard title="Extra Grupo" value={loading ? "..." : stats.extra} icon={<BarChart className="h-4 w-4 text-purple-600" />} color="bg-purple-600/10" description="Trocas com terceiros" />
        <DashboardCard title="Enviadas" value={loading ? "..." : stats.enviadas} icon={<BarChart className="h-4 w-4 text-cyan-500" />} color="bg-cyan-500/10" description="Oportunidades enviadas" />
        <DashboardCard title="Recebidas" value={loading ? "..." : stats.recebidas} icon={<BarChart className="h-4 w-4 text-rose-500" />} color="bg-rose-500/10" description="Oportunidades recebidas" />
        <DashboardCard title="Saldo Envio-Recebimento" value={loading ? "..." : stats.saldo} icon={<BarChart className="h-4 w-4 text-gray-600" />} color="bg-gray-600/10" description="Saldo entre enviadas e recebidas" />
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros do Gráfico</CardTitle>
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
              <SelectItem value="quarter">Quarter</SelectItem>
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
          <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Buscar empresa..."
            value={searchTerm}
            className="w-[200px]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Gráfico por mês/quarter */}
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades {periodo === "mes" ? "Mensal" : "por Quarter"}</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={periodo === "mes" ? "mes" : "quarter"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enviadas" fill="#0088fe" name="Enviadas" />
              <Bar dataKey="recebidas" fill="#00c49f" name="Recebidas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Gráfico de status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status ({tipoFiltro === "intra" ? "Intra Grupo" : tipoFiltro === "extra" ? "Extra Grupo" : "Todos"})</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tickFormatter={(s) => statusLabels[s] ?? s} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Matriz de Indicações Intragrupo */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
          <CardDescription>Visualização de quem indica para quem dentro do grupo (tabela)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <tbody>
                {matrizIntra.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={`border p-1 text-center ${i === 0 || j === 0 ? "font-bold bg-gray-100" : ""}`}>{cell}</td>
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
          <CardDescription>Visualização de indicações envolvendo parceiros externos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <tbody>
                {matrizParceiros.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className={`border p-1 text-center ${i === 0 || j === 0 ? "font-bold bg-gray-100" : ""}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Tabela de oportunidades */}
      <Card>
        <CardHeader>
          <CardTitle>Listagem de Oportunidades</CardTitle>
          <CardDescription>
            Todos os campos editáveis (exceto data). Clique em editar para modificar, depois salve ou cancele. Clique no cabeçalho para ordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr>
                  <th className="border p-1 cursor-pointer"
                    onClick={() => { if (sortColumn === "data_indicacao") setSortAsc(!sortAsc); else { setSortColumn("data_indicacao"); setSortAsc(false); } }}>
                    Data Indicação {renderSortIcon("data_indicacao")}
                  </th>
                  <th className="border p-1 cursor-pointer"
                    onClick={() => { if (sortColumn === "status") setSortAsc(!sortAsc); else { setSortColumn("status"); setSortAsc(true); } }}>
                    Status {renderSortIcon("status")}
                  </th>
                  <th className="border p-1 cursor-pointer"
                    onClick={() => { if (sortColumn === "empresa_origem") setSortAsc(!sortAsc); else { setSortColumn("empresa_origem"); setSortAsc(true); } }}>
                    Origem {renderSortIcon("empresa_origem")}
                  </th>
                  <th className="border p-1 cursor-pointer"
                    onClick={() => { if (sortColumn === "empresa_destino") setSortAsc(!sortAsc); else { setSortColumn("empresa_destino"); setSortAsc(true); } }}>
                    Destino {renderSortIcon("empresa_destino")}
                  </th>
                  <th className="border p-1 cursor-pointer"
                    onClick={() => { if (sortColumn === "valor") setSortAsc(!sortAsc); else { setSortColumn("valor"); setSortAsc(true); } }}>
                    Valor {renderSortIcon("valor")}
                  </th>
                  <th className="border p-1">Motivo Perda</th>
                  <th className="border p-1">Observações</th>
                  <th className="border p-1">Nome Lead</th>
                  <th className="border p-1">Ações</th>
                </tr>
              </thead>
              <tbody>
                {oportunidadesOrdenadas.map((op) => (
                  <tr key={op.id}>
                    <td className="border p-1">{formatDate(op.data_indicacao)}</td>
                    {/* status */}
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Select value={editValues.status || ""} onValueChange={val => handleEditChange("status", val)}>
                            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="em_contato">Em Contato</SelectItem>
                              <SelectItem value="negociando">Negociando</SelectItem>
                              <SelectItem value="ganho">Ganho</SelectItem>
                              <SelectItem value="perdido">Perdido</SelectItem>
                              <SelectItem value="Contato">Contato</SelectItem>
                            </SelectContent>
                          </Select>
                        : statusLabels[op.status] || op.status}
                    </td>
                    {/* origem */}
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Select value={editValues.empresa_origem_id || ""} onValueChange={val => handleEditChange("empresa_origem_id", val)}>
                            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        : op.empresa_origem?.nome}
                    </td>
                    {/* destino */}
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Select value={editValues.empresa_destino_id || ""} onValueChange={val => handleEditChange("empresa_destino_id", val)}>
                            <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        : op.empresa_destino?.nome}
                    </td>
                    {/* valor */}
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Input type="number" value={editValues.valor ?? ""} className="w-[80px]" onChange={e => handleEditChange("valor", Number(e.target.value) || 0)} />
                        : op.valor ?? "-"}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Input value={editValues.motivo_perda ?? ""} className="w-[90px]" onChange={e => handleEditChange("motivo_perda", e.target.value)} />
                        : op.motivo_perda ?? "-"}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Input value={editValues.observacoes ?? ""} className="w-[110px]" onChange={e => handleEditChange("observacoes", e.target.value)} />
                        : op.observacoes ?? "-"}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id
                        ? <Input value={editValues.nome_lead ?? ""} className="w-[110px]" onChange={e => handleEditChange("nome_lead", e.target.value)} />
                        : op.nome_lead ?? "-"}
                    </td>
                    <td className="border p-1">
                      {editRowId === op.id
                        ? (
                          <>
                            <Button size="icon" variant="success" onClick={() => handleSaveEdit(op.id)}><Check className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={handleCancelEdit}><Cancel className="h-4 w-4" /></Button>
                          </>
                        )
                        : <Button size="icon" variant="ghost" onClick={() => handleEdit(op)}><Edit className="h-4 w-4" /></Button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Atalhos e sobre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAccess />
        <AboutPlatform />
      </div>
    </div>
  );
};

export default DashboardPage;
