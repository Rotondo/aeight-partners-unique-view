import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useOportunidades } from "./OportunidadesContext";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function getGrupoStatus(empresa_origem_tipo: string, empresa_destino_tipo: string) {
  if (empresa_origem_tipo === "intragrupo" && empresa_destino_tipo === "intragrupo") return "intragrupo";
  return "extragrupo";
}

function getQuarter(date: Date) {
  const month = date.getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
}
function getYear(date: Date) {
  return date.getFullYear();
}
function getMonthYear(date: Date) {
  return format(date, "MMM/yyyy", { locale: ptBR });
}

export const OportunidadesStats: React.FC = () => {
  const { oportunidades } = useOportunidades();
  const [selectedTab, setSelectedTab] = useState("mensal");

  const [periodo, setPeriodo] = useState("mes");
  const [quarters, setQuarters] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [quarterYear, setQuarterYear] = useState<number>(new Date().getFullYear());
  const [grupoStatus, setGrupoStatus] = useState("all"); // all, intra, extra

  // Para Dialog de em aberto detalhado
  const [modalAberto, setModalAberto] = useState<{ faixa: string, oportunidades: any[] } | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const anosDisponiveis = useMemo(() => {
    return Array.from(new Set(oportunidades.map(op => {
      if (!op.data_indicacao) return null;
      try { return new Date(op.data_indicacao).getFullYear(); }
      catch { return null; }
    }).filter(Boolean))).sort((a, b) => b - a);
  }, [oportunidades]);

  const oportunidadesFiltradas = useMemo(() => {
    return oportunidades.filter(op => {
      if (!op.data_indicacao) return false;
      const dataInd = parseISO(op.data_indicacao);
      let match = true;
      if (periodo === "quarter") {
        match = match && quarters.includes(getQuarter(dataInd)) && getYear(dataInd) === quarterYear;
      }
      if (grupoStatus === "intragrupo") {
        match = match && getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo) === "intragrupo";
      }
      if (grupoStatus === "extragrupo") {
        match = match && getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo) === "extragrupo";
      }
      return match;
    });
  }, [oportunidades, periodo, quarters, quarterYear, grupoStatus]);

  // KPIs
  const total = oportunidades.length;
  const emAberto = oportunidades.filter(
    op => ['em_contato', 'negociando'].includes(op.status)
  );
  const ganhas = oportunidades.filter(op => op.status === 'ganho');
  const perdidas = oportunidades.filter(op => op.status === 'perdido');

  // Em aberto por faixa de tempo
  const hoje = new Date();
  const emAbertoFaixa = {
    "há 30 dias": emAberto.filter(op => {
      const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
      return dias <= 30;
    }),
    "30 a 60 dias": emAberto.filter(op => {
      const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
      return dias > 30 && dias <= 60;
    }),
    "mais de 60 dias": emAberto.filter(op => {
      const dias = differenceInDays(hoje, parseISO(op.data_indicacao));
      return dias > 60;
    }),
  };

  const oportunidadesPorMes = useMemo(() => {
    const lista = oportunidadesFiltradas;
    const mapa: Record<string, { total: number, ganho: number, perdido: number }> = {};
    lista.forEach(op => {
      const data = parseISO(op.data_indicacao);
      const chave = getMonthYear(data);
      if (!mapa[chave]) mapa[chave] = { total: 0, ganho: 0, perdido: 0 };
      mapa[chave].total++;
      if (op.status === "ganho") mapa[chave].ganho++;
      if (op.status === "perdido") mapa[chave].perdido++;
    });
    const resultado = Object.entries(mapa)
      .map(([k, v]) => ({ name: k, ...v }))
      .sort((a, b) => {
        const [ma, ya] = a.name.split("/");
        const [mb, yb] = b.name.split("/");
        return new Date(`01 ${ma} ${ya}`) > new Date(`01 ${mb} ${yb}`) ? 1 : -1;
      });
    return resultado;
  }, [oportunidadesFiltradas]);

  // Dialog content for em aberto
  const renderDialogAberto = () => {
    if (!modalAberto) return null;
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Oportunidades em Aberto ({modalAberto.faixa})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {modalAberto.oportunidades.map((op, idx) => (
              <div key={op.id || idx} className="p-2 border rounded">
                <div>
                  <b>Lead:</b> {op.nome_lead} <br />
                  <b>Origem:</b> {op.empresa_origem?.nome || "-"} <br />
                  <b>Destino:</b> {op.empresa_destino?.nome || "-"} <br />
                  <b>Data Indicação:</b> {format(parseISO(op.data_indicacao), "dd/MM/yyyy", { locale: ptBR })} <br />
                  <b>Status:</b> {op.status}
                </div>
              </div>
            ))}
            {modalAberto.oportunidades.length === 0 && <div>Nenhuma oportunidade encontrada.</div>}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  function handleOpenAberto(faixa: string, oportunidades: any[]) {
    setModalAberto({ faixa, oportunidades });
    setOpenDialog(true);
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                onClick={() => handleOpenAberto("há 30 dias", emAbertoFaixa["há 30 dias"])}
              >
                há 30 dias: <b className="ml-1">{emAbertoFaixa["há 30 dias"].length}</b>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenAberto("30 a 60 dias", emAbertoFaixa["30 a 60 dias"])}
              >
                30-60 dias: <b className="ml-1">{emAbertoFaixa["30 a 60 dias"].length}</b>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleOpenAberto("mais de 60 dias", emAbertoFaixa["mais de 60 dias"])}
              >
                +60 dias: <b className="ml-1">{emAbertoFaixa["mais de 60 dias"].length}</b>
              </Button>
            </div>
            {renderDialogAberto()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ganhas</CardTitle>
            <CardDescription>Oportunidades convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{ganhas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Perdidas</CardTitle>
            <CardDescription>Oportunidades não convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{perdidas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para gráficos */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
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
                Número de oportunidades registradas. Use os filtros para customizar o período e o tipo.
              </CardDescription>
              <div className="flex flex-wrap gap-3 mt-4">
                <div>
                  <label>Período</label>
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
                      <label>Quarter</label>
                      <Select
                        value={quarters.join(",")}
                        onValueChange={v => setQuarters(v ? v.split(",") : [])}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Q1", "Q2", "Q3", "Q4"].map(q => (
                            <SelectItem key={q} value={q}>{q}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label>Ano</label>
                      <Select value={String(quarterYear)} onValueChange={v => setQuarterYear(Number(v))}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {anosDisponiveis.map(ano => (
                            <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div>
                  <label>Natureza</label>
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
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={oportunidadesPorMes}>
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

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status das Oportunidades</CardTitle>
              <CardDescription>
                Distribuição dos status das oportunidades
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-center text-muted-foreground">Gráfico de status pode ser adicionado aqui.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxas">
          <Card>
            <CardHeader>
              <CardTitle>Taxas de Conversão</CardTitle>
              <CardDescription>
                Converta mais oportunidades acompanhando as taxas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">Gráfico de taxas de conversão pode ser adicionado aqui.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
