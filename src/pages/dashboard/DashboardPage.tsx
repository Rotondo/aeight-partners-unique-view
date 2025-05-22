import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { Oportunidade, Empresa } from "@/types";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";

function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

function groupByQuarter(data: Oportunidade[], tipo: "intra" | "extra" | "all") {
  const result: Record<string, { enviadas: number; recebidas: number }> = {};
  data.forEach((op) => {
    const d = new Date(op.data_indicacao);
    const year = d.getFullYear();
    const quarter = getQuarter(d);
    const key = `${year}-Q${quarter}`;
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

// Agrupa por mês para gráfico
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

  // Cards stats
  const [stats, setStats] = useState<any>({
    total: 0,
    ganhas: 0,
    perdidas: 0,
    andamento: 0,
    intra: 0,
    extra: 0,
    enviadas: 0,
    recebidas: 0,
    saldo: 0,
  });

  // Tabela de saldo por empresa
  const [saldoEmpresas, setSaldoEmpresas] = useState<any[]>([]);

  // Gráfico
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      // Carrega oportunidades
      const { data: oportunidadesData, error } = await supabase
        .from("oportunidades")
        .select("*, empresa_origem:empresas!empresa_origem_id(nome, tipo), empresa_destino:empresas!empresa_destino_id(nome, tipo)");
      if (error) throw error;

      // Carrega empresas
      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .order("nome");
      if (empresasError) throw empresasError;

      // Enriquecimento de tipo intra/extra
      const oportunidadesEnriquecidas: Oportunidade[] = oportunidadesData.map((op: any) => {
        const tipoOrigem = op.empresa_origem?.tipo || "";
        const tipoDestino = op.empresa_destino?.tipo || "";
        // intra se ambos forem intragrupo; extra caso contrário
        let tipo_relacao: "intra" | "extra" = "extra";
        if (tipoOrigem === "intragrupo" && tipoDestino === "intragrupo") tipo_relacao = "intra";
        // flags para gráficos de enviados/recebidos
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
    } catch (e) {
      toast({ title: "Erro", description: "Não foi possível carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Estatísticas para os cards
  function processStats(oportunidades: Oportunidade[], empresas: Empresa[]) {
    const total = oportunidades.length;
    const ganhas = oportunidades.filter((op) => op.status === "ganho").length;
    const perdidas = oportunidades.filter((op) => op.status === "perdido").length;
    const andamento = total - ganhas - perdidas;
    const intra = oportunidades.filter((op) => op.tipo_relacao === "intra").length;
    const extra = oportunidades.filter((op) => op.tipo_relacao === "extra").length;

    // Saldos gerais
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

  // Saldo de enviadas/recebidas por empresa
  function processSaldoEmpresas(oportunidades: Oportunidade[], empresas: Empresa[]) {
    // Só mostra para as empresas ativas
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

  // Dados para o gráfico
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
    if (empresaFiltro && empresaFiltroType !== "all") {
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

  // Atualiza gráfico ao mudar filtros
  useEffect(() => {
    processChart(oportunidades);
  }, [oportunidades, tipoFiltro, periodo, statusFiltro, empresaFiltro, empresaFiltroType, searchTerm]);

  // Exportação de tabela de saldos
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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard de Oportunidades</h1>
      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total de Oportunidades"
          value={loading ? "..." : stats.total}
          icon={<BarChart className="h-4 w-4 text-primary" />}
          color="bg-primary/10"
          description="Todas as oportunidades registradas"
        />
        <DashboardCard
          title="Ganhos"
          value={loading ? "..." : stats.ganhas}
          icon={<BarChart className="h-4 w-4 text-green-500" />}
          color="bg-green-500/10"
          description="Oportunidades ganhas"
        />
        <DashboardCard
          title="Perdidos"
          value={loading ? "..." : stats.perdidas}
          icon={<BarChart className="h-4 w-4 text-destructive" />}
          color="bg-destructive/10"
          description="Oportunidades perdidas"
        />
        <DashboardCard
          title="Em Andamento"
          value={loading ? "..." : stats.andamento}
          icon={<BarChart className="h-4 w-4 text-amber-500" />}
          color="bg-amber-500/10"
          description="Em negociação"
        />
        <DashboardCard
          title="Intra Grupo"
          value={loading ? "..." : stats.intra}
          icon={<BarChart className="h-4 w-4 text-blue-500" />}
          color="bg-blue-500/10"
          description="Trocas dentro do grupo"
        />
        <DashboardCard
          title="Extra Grupo"
          value={loading ? "..." : stats.extra}
          icon={<BarChart className="h-4 w-4 text-purple-600" />}
          color="bg-purple-600/10"
          description="Trocas com terceiros"
        />
        <DashboardCard
          title="Enviadas"
          value={loading ? "..." : stats.enviadas}
          icon={<BarChart className="h-4 w-4 text-cyan-500" />}
          color="bg-cyan-500/10"
          description="Oportunidades enviadas"
        />
        <DashboardCard
          title="Recebidas"
          value={loading ? "..." : stats.recebidas}
          icon={<BarChart className="h-4 w-4 text-rose-500" />}
          color="bg-rose-500/10"
          description="Oportunidades recebidas"
        />
        <DashboardCard
          title="Saldo Envio-Recebimento"
          value={loading ? "..." : stats.saldo}
          icon={<BarChart className="h-4 w-4 text-gray-600" />}
          color="bg-gray-600/10"
          description="Saldo entre enviadas e recebidas"
        />
      </div>

      {/* Filtros */}
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
              <SelectItem value="quarter">Trimestre</SelectItem>
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

      {/* Gráfico funcional, editável */}
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Oportunidades ({periodo === "mes" ? "Mensal" : "Trimestral"})</CardTitle>
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

      {/* Tabela de saldo por empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Balanço Geral por Empresa</CardTitle>
          <CardDescription>
            Quantidade de oportunidades enviadas, recebidas e saldo por empresa (inclui intra e extra grupo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="sm" variant="outline" onClick={exportSaldoCSV}>Exportar CSV</Button>
          <div className="overflow-x-auto mt-3">
            <table className="min-w-full text-sm border">
              <thead>
                <tr>
                  <th className="border p-2">Empresa</th>
                  <th className="border p-2">Tipo</th>
                  <th className="border p-2">Enviadas</th>
                  <th className="border p-2">Recebidas</th>
                  <th className="border p-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {saldoEmpresas.map((s, idx) => (
                  <tr key={s.empresa + idx}>
                    <td className="border p-2">{s.empresa}</td>
                    <td className="border p-2">{s.tipo}</td>
                    <td className="border p-2">{s.enviadas}</td>
                    <td className="border p-2">{s.recebidas}</td>
                    <td className="border p-2">{s.saldo}</td>
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
