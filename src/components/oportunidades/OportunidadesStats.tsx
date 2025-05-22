import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import { format, subMonths, parseISO, differenceInDays, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOportunidades } from "./OportunidadesContext";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_COLORS = {
  em_contato: "#3b82f6", // blue
  negociando: "#eab308", // yellow
  ganho: "#22c55e", // green
  perdido: "#ef4444", // red
};

function getGrupoStatus(empresa_origem_tipo, empresa_destino_tipo) {
  if (
    empresa_origem_tipo === "intragrupo" &&
    empresa_destino_tipo === "intragrupo"
  )
    return "intragrupo";
  return "extragrupo";
}
function getQuarter(date) {
  if (!isValid(date)) return "";
  const month = date.getMonth();
  if (month < 3) return "Q1";
  if (month < 6) return "Q2";
  if (month < 9) return "Q3";
  return "Q4";
}
function getYear(date) {
  if (!isValid(date)) return null;
  return date.getFullYear();
}
function getMonthYear(date) {
  if (!isValid(date)) return "";
  return format(date, "MMM/yyyy", { locale: ptBR });
}

export const OportunidadesStats: React.FC = () => {
  const { oportunidades } = useOportunidades();
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | undefined>(
    undefined
  );
  const [selectedTab, setSelectedTab] = useState("mensal");

  // Filtros do gráfico volume mensal
  const [periodo, setPeriodo] = useState("mes");
  const [quarters, setQuarters] = useState(["Q1", "Q2", "Q3", "Q4"]);
  const [quarterYear, setQuarterYear] = useState<number>(
    new Date().getFullYear()
  );
  const [grupoStatus, setGrupoStatus] = useState("all"); // all, intra, extra

  // Modal em aberto detalhado
  const [modalAberto, setModalAberto] = useState<{
    faixa: string;
    oportunidades: any[];
  } | null>(null);

  // Coleta anos disponíveis
  const anosDisponiveis = useMemo(() => {
    return Array.from(
      new Set(
        oportunidades
          .map((op) => {
            if (!op.data_indicacao) return null;
            try {
              const d = parseISO(op.data_indicacao);
              return isValid(d) ? d.getFullYear() : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
      )
    ).sort((a, b) => b - a);
  }, [oportunidades]);

  // Filtro de oportunidades para o gráfico
  const oportunidadesFiltradas = useMemo(() => {
    return oportunidades.filter((op) => {
      if (!op.data_indicacao) return false;
      let dataInd;
      try {
        dataInd = parseISO(op.data_indicacao);
      } catch {
        return false;
      }
      if (!isValid(dataInd)) return false;
      let match = true;
      if (periodo === "quarter" && quarters.length && quarterYear) {
        match =
          match &&
          quarters.includes(getQuarter(dataInd)) &&
          getYear(dataInd) === quarterYear;
      }
      if (grupoStatus === "intragrupo") {
        match =
          match &&
          getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo) ===
            "intragrupo";
      }
      if (grupoStatus === "extragrupo") {
        match =
          match &&
          getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo) ===
            "extragrupo";
      }
      return match;
    });
  }, [oportunidades, periodo, quarters, quarterYear, grupoStatus]);

  // KPIs
  const total = oportunidades.length;
  const emAberto = oportunidades.filter(
    (op) => ["em_contato", "negociando"].includes(op.status)
  );
  const ganhas = oportunidades.filter((op) => op.status === "ganho");
  const perdidas = oportunidades.filter((op) => op.status === "perdido");

  // Em aberto por faixa de tempo
  const hoje = new Date();
  const emAbertoFaixa = {
    "há 30 dias": emAberto.filter((op) => {
      try {
        const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
        return dias <= 30;
      } catch {
        return false;
      }
    }),
    "30 a 60 dias": emAberto.filter((op) => {
      try {
        const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
        return dias > 30 && dias <= 60;
      } catch {
        return false;
      }
    }),
    "mais de 60 dias": emAberto.filter((op) => {
      try {
        const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
        return dias > 60;
      } catch {
        return false;
      }
    }),
  };

  // Gráfico Volume Mensal com filtros
  const oportunidadesPorMes = useMemo(() => {
    // Filtra pelo período selecionado
    const lista = oportunidadesFiltradas;
    // Agrupa por mês
    const mapa: Record<
      string,
      { name: string; total: number; ganho: number; perdido: number }
    > = {};
    lista.forEach((op) => {
      let data;
      try {
        data = parseISO(op.data_indicacao);
      } catch {
        return;
      }
      if (!isValid(data)) return;
      const chave = getMonthYear(data);
      if (!chave) return;
      if (!mapa[chave])
        mapa[chave] = { name: chave, total: 0, ganho: 0, perdido: 0 };
      mapa[chave].total++;
      if (op.status === "ganho") mapa[chave].ganho++;
      if (op.status === "perdido") mapa[chave].perdido++;
    });
    // Ordena por data
    const resultado = Object.entries(mapa)
      .map(([k, v]) => ({ name: k, ...v }))
      .sort((a, b) => {
        // ano-mês para ordenar corretamente
        const [ma, ya] = a.name.split("/");
        const [mb, yb] = b.name.split("/");
        return new Date(`01 ${ma} ${ya}`) > new Date(`01 ${mb} ${yb}`) ? 1 : -1;
      });
    return resultado;
  }, [oportunidadesFiltradas]);

  // Status Distribution para gráfico de pizza
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      em_contato: 0,
      negociando: 0,
      ganho: 0,
      perdido: 0,
    };
    oportunidades.forEach((op) => {
      if (!op.status) return;
      if (counts[op.status] === undefined) return;
      counts[op.status] += 1;
    });
    return [
      {
        name: "Em Contato",
        value: counts.em_contato,
        color: STATUS_COLORS.em_contato,
      },
      {
        name: "Negociando",
        value: counts.negociando,
        color: STATUS_COLORS.negociando,
      },
      {
        name: "Ganho",
        value: counts.ganho,
        color: STATUS_COLORS.ganho,
      },
      {
        name: "Perdido",
        value: counts.perdido,
        color: STATUS_COLORS.perdido,
      },
    ];
  }, [oportunidades]);

  // Company conversion rates (mantido do original)
  const empresasConversion = useMemo(() => {
    const conversions: Record<
      string,
      { total: number; ganho: number; perdido: number; taxa: number }
    > = {};
    oportunidades.forEach((op) => {
      if (!op.empresa_origem?.nome) return;
      const origem = op.empresa_origem.nome;
      if (!conversions[origem]) {
        conversions[origem] = { total: 0, ganho: 0, perdido: 0, taxa: 0 };
      }
      conversions[origem].total += 1;
      if (op.status === "ganho") conversions[origem].ganho += 1;
      if (op.status === "perdido") conversions[origem].perdido += 1;
    });
    // Calculate conversion rates
    Object.keys(conversions).forEach((empresa) => {
      const { total, ganho } = conversions[empresa];
      conversions[empresa].taxa = total > 0 ? (ganho / total) * 100 : 0;
    });
    return Object.entries(conversions)
      .map(([empresa, stats]) => ({
        empresa,
        ...stats,
        taxa: parseFloat(stats.taxa.toFixed(2)),
      }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [oportunidades]);

  // Render active shape for pie chart
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#000">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666">
          {value} ({(percent * 100).toFixed(1)}%)
        </text>
      </g>
    );
  };

  // Modal de oportunidades em aberto por faixa
  const renderModalAberto = () => {
    if (!modalAberto) return null;
    return (
      <Modal
        open={!!modalAberto}
        onOpenChange={() => setModalAberto(null)}
        title={`Oportunidades em Aberto (${modalAberto.faixa})`}
      >
        <div className="space-y-3">
          {modalAberto.oportunidades.map((op, idx) => (
            <div key={op.id || idx} className="p-2 border rounded">
              <div>
                <b>Lead:</b> {op.nome_lead} <br />
                <b>Origem:</b> {op.empresa_origem?.nome || "-"} <br />
                <b>Destino:</b> {op.empresa_destino?.nome || "-"} <br />
                <b>Data Indicação:</b>{" "}
                {op.data_indicacao
                  ? (() => {
                      try {
                        const d = parseISO(op.data_indicacao);
                        if (!isValid(d)) return "-";
                        return format(d, "dd/MM/yyyy", { locale: ptBR });
                      } catch {
                        return "-";
                      }
                    })()
                  : "-"}
                <br />
                <b>Status:</b> {op.status}
              </div>
            </div>
          ))}
          {modalAberto.oportunidades.length === 0 && (
            <div>Nenhuma oportunidade encontrada.</div>
          )}
        </div>
      </Modal>
    );
  };

  // Handlers para Pie Chart
  const onPieEnter = (_: any, index: number) => {
    setSelectedPieIndex(index);
  };
  const onPieLeave = () => {
    setSelectedPieIndex(undefined);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Oportunidades</CardTitle>
            <CardDescription>Todas as oportunidades registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Em Aberto</CardTitle>
            <CardDescription>Em contato ou negociando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold">{emAberto.length}</span>
              <span className="text-sm text-muted-foreground">(detalhe:)</span>
            </div>
            <div className="mt-2 space-x-2 flex flex-wrap">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setModalAberto({
                    faixa: "há 30 dias",
                    oportunidades: emAbertoFaixa["há 30 dias"],
                  })
                }
              >
                há 30 dias:{" "}
                <b className="ml-1">{emAbertoFaixa["há 30 dias"].length}</b>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setModalAberto({
                    faixa: "30 a 60 dias",
                    oportunidades: emAbertoFaixa["30 a 60 dias"],
                  })
                }
              >
                30-60 dias:{" "}
                <b className="ml-1">{emAbertoFaixa["30 a 60 dias"].length}</b>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setModalAberto({
                    faixa: "mais de 60 dias",
                    oportunidades: emAbertoFaixa["mais de 60 dias"],
                  })
                }
              >
                +60 dias:{" "}
                <b className="ml-1">{emAbertoFaixa["mais de 60 dias"].length}</b>
              </Button>
            </div>
            {renderModalAberto()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ganhas</CardTitle>
            <CardDescription>Oportunidades convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {ganhas.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Perdidas</CardTitle>
            <CardDescription>Oportunidades não convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {perdidas.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mensal" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="mensal">Volume Mensal</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="taxas">Taxas de Conversão</TabsTrigger>
        </TabsList>

        {/* Gráfico Volume Mensal com filtros avançados */}
        <TabsContent value="mensal">
          <Card>
            <CardHeader>
              <CardTitle>Volume de Oportunidades por Mês</CardTitle>
              <CardDescription>
                Número de oportunidades registradas. Use os filtros para
                customizar o período e o tipo.
              </CardDescription>
              <div className="flex flex-wrap gap-3 mt-4">
                <div>
                  <Label>Período</Label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mes">Mensal</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {periodo === "quarter" && (
                  <>
                    <div>
                      <Label>Quarter</Label>
                      <Select
                        value={quarters.join(",")}
                        onValueChange={(v) =>
                          setQuarters(v ? v.split(",") : [])
                        }
                        multiple
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                            <SelectItem key={q} value={q}>
                              {q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Ano</Label>
                      <Select
                        value={String(quarterYear)}
                        onValueChange={(v) => setQuarterYear(Number(v))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {anosDisponiveis.map((ano) => (
                            <SelectItem key={ano} value={String(ano)}>
                              {ano}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div>
                  <Label>Natureza</Label>
                  <Select value={grupoStatus} onValueChange={setGrupoStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="intragrupo">Intragrupo</SelectItem>
                      <SelectItem value="extragrupo">Extragrupo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent style={{ padding: 0, margin: 0 }}>
              <div style={{ width: "100%", minHeight: 320, height: 350, padding: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oportunidadesPorMes || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total" fill="#94a3b8" />
                    <Bar dataKey="ganho" name="Ganhas" fill="#22c55e" />
                    <Bar dataKey="perdido" name="Perdidas" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>
                Proporção de oportunidades em cada status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: "100%", minHeight: 320, height: 350, padding: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={selectedPieIndex}
                      activeShape={renderActiveShape}
                      data={statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value) => [`${value} oportunidades`, undefined]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Taxas de Conversão Tab */}
        <TabsContent value="taxas">
          <Card>
            <CardHeader>
              <CardTitle>Taxas de Conversão por Empresa</CardTitle>
              <CardDescription>
                Percentual de oportunidades ganhas vs. total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ganhas</TableHead>
                      <TableHead className="text-right">Perdidas</TableHead>
                      <TableHead className="text-right">
                        Taxa de Conversão
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresasConversion.map((item) => (
                      <TableRow key={item.empresa}>
                        <TableCell>{item.empresa}</TableCell>
                        <TableCell className="text-right">
                          {item.total}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.ganho}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.perdido}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span
                            className={
                              item.taxa >= 70
                                ? "text-green-600"
                                : item.taxa >= 40
                                ? "text-amber-600"
                                : "text-red-600"
                            }
                          >
                            {item.taxa}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {empresasConversion.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Nenhum dado disponível
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
