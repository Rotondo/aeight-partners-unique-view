import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { DashboardKpis } from "@/components/dashboard/DashboardKpis";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";
import { OportunidadesChart } from "@/components/dashboard/OportunidadesChart";
import { StatusPieChart } from "@/components/dashboard/StatusPieChart";
import { MatrizIntra } from "@/components/dashboard/MatrizIntra";
import { MatrizParceiros } from "@/components/dashboard/MatrizParceiros";
import { OportunidadesTable } from "@/components/dashboard/OportunidadesTable";
import { IndicacoesRecebidasTable } from "@/components/dashboard/IndicacoesRecebidasTable";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Empresa, Oportunidade, StatusOportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import useDashboardStats from "@/hooks/useDashboardStats";

// Database accepted status values
type DatabaseStatusOportunidade = 
  | "em_contato"
  | "negociando" 
  | "proposta_enviada"
  | "aguardando_aprovacao"
  | "ganho"
  | "perdido"
  | "Contato"
  | "Apresentado"
  | "Sem contato";

// Convert frontend status to database-compatible status
function mapStatusToDatabase(status: StatusOportunidade): DatabaseStatusOportunidade {
  const statusMap: Record<StatusOportunidade, DatabaseStatusOportunidade> = {
    "em_contato": "em_contato",
    "negociando": "negociando",
    "proposta_enviada": "proposta_enviada",
    "aguardando_aprovacao": "aguardando_aprovacao",
    "ganho": "ganho",
    "perdido": "perdido",
    "Contato": "Contato",
    "Apresentado": "Apresentado",
    "Sem contato": "Sem contato",
    // Map additional statuses to closest database equivalent
    "indicado": "em_contato",
    "em_andamento": "negociando",
    "fechado": "ganho",
    "cancelado": "perdido"
  };
  
  return statusMap[status] || "em_contato";
}

function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}
function getQuarterLabel(date: Date) {
  return `Q${getQuarter(date)}/${date.getFullYear()}`;
}

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
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Oportunidade>>({});
  const [opportunidadesList, setOpportunidadesList] = useState<Oportunidade[]>([]);
  const [ordemLista, setOrdemLista] = useState<{ col: string; asc: boolean }>({ col: "data_indicacao", asc: false });
  const [matrizIntra, setMatrizIntra] = useState<any[]>([]);
  const [matrizParceiros, setMatrizParceiros] = useState<any[]>([]);
  const [empresaIntraSelecionada, setEmpresaIntraSelecionada] = useState<string>("all");

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
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

      // Enriquecimento com propriedades calculadas
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
      setOpportunidadesList(oportunidadesEnriquecidas);
      processMatriz(oportunidadesEnriquecidas, empresasData);
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e?.message ?? JSON.stringify(e) ?? "Não foi possível carregar dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const oportunidadesFiltradas = useMemo(() => {
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
    return filtradas;
  }, [oportunidades, statusFiltro, tipoFiltro, empresaFiltro, empresaFiltroType, searchTerm]);

  // Use o hook robusto e achate o objeto para os KPIs
  const statsRaw = useDashboardStats(oportunidadesFiltradas);
  const stats = {
    total: statsRaw.total.total,
    ganhas: statsRaw.total.ganho,
    perdidas: statsRaw.total.perdido,
    andamento: statsRaw.total.em_contato + statsRaw.total.negociando,
    intra: statsRaw.intra.total,
    extra: statsRaw.extra.total,
    enviadas: statsRaw.enviadas,
    recebidas: statsRaw.recebidas,
    saldo: statsRaw.saldo,
  };

  const chartData = useMemo(() => {
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
    if (periodo === "mes") return groupByMonth(oportunidadesFiltradas, tipoFiltro);
    return groupByQuarter(oportunidadesFiltradas, tipoFiltro);
  }, [oportunidadesFiltradas, periodo, tipoFiltro]);

  const statusChartData = useMemo(() => {
    const statusCount: Record<string, number> = {};
    oportunidadesFiltradas.forEach((op) => {
      const s = op.status || "indefinido";
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    return Object.entries(statusCount).map(([status, value]) => ({
      status,
      value,
    }));
  }, [oportunidadesFiltradas]);

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

  async function handleSaveEdit(id: string) {
    try {
      // Create a clean updates object with database-compatible types
      const updates: any = { ...editValues };
      
      // Remove properties that shouldn't be sent to database
      delete updates.empresa_origem;
      delete updates.empresa_destino;
      delete updates.contato;
      delete updates.usuario_envio;
      delete updates.usuario_recebe;
      delete updates.tipo_relacao;
      delete updates.isRemetente;
      delete updates.isDestinatario;
      delete updates.tipo_natureza;
      
      // Convert status to database-compatible format
      if (updates.status) {
        updates.status = mapStatusToDatabase(updates.status);
      }
      
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
  const listaOrdenada = useMemo(() => {
    const arr = [...opportunidadesList];
    arr.sort((a, b) => {
      let vA: any = (a as any)[ordemLista.col];
      let vB: any = (b as any)[ordemLista.col];
      if (typeof vA === "string") vA = vA.toLowerCase();
      if (typeof vB === "string") vB = vB.toLowerCase();
      if (vA < vB) return ordemLista.asc ? -1 : 1;
      if (vA > vB) return ordemLista.asc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [opportunidadesList, ordemLista]);

  const empresasIntra = useMemo(() => empresas.filter(e => e.tipo === "intragrupo"), [empresas]);
  const indicacoesRecebidasTodas = useMemo(() => {
    if (!empresaIntraSelecionada || empresaIntraSelecionada === "all") return [];
    return oportunidades.filter(
      op => op.empresa_destino_id === empresaIntraSelecionada
    );
  }, [empresaIntraSelecionada, oportunidades]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard de Oportunidades</h1>
      <DashboardKpis stats={stats} loading={loading} />

      <DashboardFilters
        tipoFiltro={tipoFiltro}
        setTipoFiltro={(value: string) => setTipoFiltro(value as "intra" | "extra" | "all")}
        statusFiltro={statusFiltro}
        setStatusFiltro={(value: string) => setStatusFiltro(value as "ganho" | "perdido" | "all" | "andamento")}
        periodo={periodo}
        setPeriodo={(value: string) => setPeriodo(value as "mes" | "quarter")}
        empresaFiltroType={empresaFiltroType}
        setEmpresaFiltroType={(value: string) => setEmpresaFiltroType(value as "remetente" | "destinatario" | "all")}
        empresaFiltro={empresaFiltro}
        setEmpresaFiltro={setEmpresaFiltro}
        empresas={empresas}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div>
        {/* Filtro de empresa de destino (apenas intragrupo) */}
        <div className="mb-4">
          <Select
            value={empresaIntraSelecionada}
            onValueChange={(v) => setEmpresaIntraSelecionada(v)}
          >
            <SelectTrigger className="w-[320px]">
              <SelectValue placeholder="Selecione uma empresa intragrupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {empresasIntra.map((e) => (
                <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Tabela de indicações recebidas */}
        <IndicacoesRecebidasTable
          empresaIntraSelecionada={empresaIntraSelecionada}
          empresasIntra={empresasIntra}
          indicacoesRecebidasTodas={indicacoesRecebidasTodas}
        />
      </div>

      <OportunidadesChart chartData={chartData} periodo={periodo} />

      <StatusPieChart statusChartData={statusChartData} tipoFiltro={tipoFiltro} />

      <MatrizIntra matrizIntra={matrizIntra} empresasIntra={empresasIntra} />
      <MatrizParceiros matrizParceiros={matrizParceiros} empresasIntra={empresasIntra} />

      <OportunidadesTable
        listaOrdenada={listaOrdenada}
        editRowId={editRowId}
        editValues={editValues}
        setEditValues={setEditValues}
        handleEdit={handleEdit}
        handleSaveEdit={handleSaveEdit}
        handleCancelEdit={handleCancelEdit}
        ordenarLista={ordenarLista}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickAccess />
        <AboutPlatform />
      </div>
    </div>
  );
};

export default DashboardPage;
