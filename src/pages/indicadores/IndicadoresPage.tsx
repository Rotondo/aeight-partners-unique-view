import React, { useState, useEffect } from "react";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IndicadoresParceiro, Empresa, Oportunidade, TamanhoEmpresa } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Edit, Check, X as Cancel } from "lucide-react";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface IndicadoresParceiroWithEmpresa extends IndicadoresParceiro {
  empresa?: {
    id: string;
    nome: string;
  };
  oportunidadesIndicadas?: number;
  share_of_wallet?: number;
}

const QUALI_KEYS = [
  { key: "potencial_leads", label: "Potencial" },
  { key: "engajamento", label: "Engajamento" },
  { key: "alinhamento", label: "Alinhamento" },
  { key: "potencial_investimento", label: "Pot. Investimento" },
];

const IndicadoresPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [filteredIndicadores, setFilteredIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<string>("empresa");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const { toast } = useToast();
  const { isDemoMode } = usePrivacy();

  // Linha em modo edição (id do indicador)
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<IndicadoresParceiro>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: indicadoresData, error: indicadoresError } = await supabase
        .from("indicadores_parceiro")
        .select("*")
        .order("data_avaliacao", { ascending: false });
      if (indicadoresError) throw indicadoresError;

      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .eq("tipo", "parceiro")
        .eq("status", true)
        .order("nome");
      if (empresasError) throw empresasError;

      const { data: oportunidadesData, error: oportunidadesError } = await supabase
        .from("oportunidades")
        .select("id, empresa_origem_id");
      if (oportunidadesError) throw oportunidadesError;

      let allIndicadores: IndicadoresParceiroWithEmpresa[] = indicadoresData.map(
        (indicador: any) => {
          const empresa = empresasData.find((e: any) => e.id === indicador.empresa_id);
          return {
            ...indicador,
            empresa: empresa ? { id: empresa.id, nome: empresa.nome } : undefined,
          };
        }
      );

      const uniqueIndicadores: Record<string, IndicadoresParceiroWithEmpresa> = {};
      for (const indicador of allIndicadores) {
        if (!uniqueIndicadores[indicador.empresa_id]) {
          uniqueIndicadores[indicador.empresa_id] = indicador;
        }
      }
      let indicadoresUnicos = Object.values(uniqueIndicadores);

      const indicadoresComOportunidades = indicadoresUnicos.map((indicador) => {
        const oportunidadesDoParceiro = oportunidadesData.filter(
          (o: any) => o.empresa_origem_id === indicador.empresa_id
        ).length;
        let share = undefined;
        if (indicador.base_clientes && indicador.base_clientes > 0) {
          share = (oportunidadesDoParceiro / indicador.base_clientes) * 100;
        }
        return {
          ...indicador,
          oportunidadesIndicadas: oportunidadesDoParceiro,
          share_of_wallet: share,
        };
      });

      setIndicadores(indicadoresComOportunidades);
      setEmpresas(empresasData as Empresa[]);
      setOportunidades(oportunidadesData as Oportunidade[]);
      setFilteredIndicadores(indicadoresComOportunidades);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os indicadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filt = indicadores;
    if (searchTerm) {
      filt = filt.filter((ind) =>
        (ind.empresa?.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedEmpresa && selectedEmpresa !== "all") {
      filt = filt.filter((ind) => ind.empresa_id === selectedEmpresa);
    }
    filt = [...filt].sort((a, b) => {
      let vA: any, vB: any;
      if (sortColumn === "empresa") {
        vA = a.empresa?.nome || "";
        vB = b.empresa?.nome || "";
      } else if (sortColumn === "share_of_wallet") {
        vA = a.share_of_wallet ?? -1;
        vB = b.share_of_wallet ?? -1;
      } else if (sortColumn === "oportunidadesIndicadas") {
        vA = a.oportunidadesIndicadas ?? 0;
        vB = b.oportunidadesIndicadas ?? 0;
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
    setFilteredIndicadores(filt);
  }, [indicadores, searchTerm, selectedEmpresa, sortColumn, sortAsc]);

  function exportToCSV() {
    const headers = [
      "Empresa",
      "Potencial Leads",
      "Base Clientes",
      "Engajamento",
      "Alinhamento",
      "Pot. Investimento",
      "Tamanho",
      "Oportunidades Indicadas",
      "Share of Wallet (%)",
      "Data Avaliação",
    ];
    const rows = filteredIndicadores.map((i) => [
      isDemoMode ? "" : i.empresa?.nome || "-",
      i.potencial_leads,
      i.base_clientes || "-",
      i.engajamento,
      i.alinhamento,
      i.potencial_investimento,
      i.tamanho,
      i.oportunidadesIndicadas ?? 0,
      i.share_of_wallet !== undefined ? i.share_of_wallet.toFixed(2) : "-",
      formatDate(i.data_avaliacao),
    ]);
    let csvContent = [headers, ...rows].map((e) => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "indicadores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleSaveEdit(id: string) {
    try {
      const updates: Partial<IndicadoresParceiro> = { ...editValues };
      // Remove campos calculados ou não editáveis
      delete (updates as any).empresa;
      delete (updates as any).oportunidadesIndicadas;
      delete (updates as any).share_of_wallet;

      const { error } = await supabase
        .from("indicadores_parceiro")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Indicador atualizado com sucesso." });
      setEditRowId(null);
      setEditValues({});
      fetchAll();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao atualizar indicador.", variant: "destructive" });
    }
  }

  function handleEdit(indicador: IndicadoresParceiroWithEmpresa) {
    setEditRowId(indicador.id);
    setEditValues({ ...indicador });
  }

  // Cancelar edição
  function handleCancelEdit() {
    setEditRowId(null);
    setEditValues({});
  }

  // Campos editáveis
  const editableFields: (keyof IndicadoresParceiro)[] = [
    "potencial_leads",
    "base_clientes",
    "engajamento",
    "alinhamento",
    "potencial_investimento",
    "tamanho",
  ];

  // Função utilitária para mascarar nomes no modo demo
  function maskName(nome: string | undefined) {
    if (!nome) return "-";
    return isDemoMode ? "" : nome;
  }

  // Gráficos (com nomes mascarados no modo demo)
  const chartQuali = filteredIndicadores
    .sort((a, b) => b.potencial_leads - a.potencial_leads)
    .slice(0, 10)
    .map((ind) => ({
      nome: maskName(ind.empresa?.nome),
      Potencial: ind.potencial_leads,
      Engajamento: ind.engajamento,
      Alinhamento: ind.alinhamento,
      "Pot. Investimento": ind.potencial_investimento,
    }));

  const chartClientes = filteredIndicadores.map((ind) => ({
    nome: maskName(ind.empresa?.nome),
    "Base de Clientes": ind.base_clientes || 0,
  }));

  // Eixo Y dinâmico para share
  const maxShareValue = Math.max(...filteredIndicadores.map((i) =>
    i.share_of_wallet !== undefined && !isNaN(i.share_of_wallet) ? i.share_of_wallet : 0
  ), 0);
  function arredondaParaCima(valor: number) {
    if (valor <= 10) return 10;
    if (valor <= 20) return 20;
    if (valor <= 50) return 50;
    if (valor <= 100) return 100;
    return Math.ceil(valor / 10) * 10;
  }
  const maxShare = arredondaParaCima(maxShareValue);

  const chartShare = filteredIndicadores.map((ind) => ({
    nome: maskName(ind.empresa?.nome),
    "Share of Wallet (%)": ind.share_of_wallet ? Number(ind.share_of_wallet.toFixed(2)) : 0,
  }));

  // Radar Chart data (quando UM parceiro está selecionado)
  let radarData: { indicador: string; valor: number }[] = [];
  if (
    selectedEmpresa &&
    selectedEmpresa !== "all" &&
    filteredIndicadores.length === 1
  ) {
    const i = filteredIndicadores[0];
    radarData = [
      { indicador: "Potencial", valor: i.potencial_leads },
      { indicador: "Engajamento", valor: i.engajamento },
      { indicador: "Alinhamento", valor: i.alinhamento },
      { indicador: "Pot. Investimento", valor: i.potencial_investimento },
    ];
  }

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }

  const renderSortIcon = (col: string) =>
    sortColumn === col ? (
      sortAsc ? (
        <span className="ml-1">&#9650;</span>
      ) : (
        <span className="ml-1">&#9660;</span>
      )
    ) : null;

  // Para select de tamanho
  const TAMANHOS = [
    { value: "PP", label: "Pequeno Porte (PP)" },
    { value: "P", label: "Pequeno (P)" },
    { value: "M", label: "Médio (M)" },
    { value: "G", label: "Grande (G)" },
    { value: "GG", label: "Grande Porte (GG)" },
  ];

  // Função para garantir que nenhum objeto seja renderizado como React child
  function safeRenderCell(value: any): React.ReactNode {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") {
      // Se for um objeto simples, exibir JSON formatado
      try {
        const jsonString = JSON.stringify(value, null, 1);
        if (jsonString === undefined || jsonString === null) return "[objeto]";
        return (
          <pre style={{ fontSize: 11, margin: 0, background: "rgba(0,0,0,0.03)", padding: 2 }}>
            {jsonString}
          </pre>
        );
      } catch {
        return "[objeto]";
      }
    }
    return String(value) as React.ReactNode;
  }

  // Tooltip customizado para mascarar nomes se necessário
  const CustomTooltip = (props: any) => {
    if (!props.active || !props.payload || !props.payload.length) return null;
    const name = props.payload[0].payload.nome;
    return (
      <div className="p-2 bg-white border rounded shadow text-xs">
        {isDemoMode ? "" : name}
        {Object.entries(props.payload[0].payload)
          .filter(([k]) => k !== "nome")
          .map(([k, v]) => (
            <div key={k}>
              <b>{k}:</b> {v}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Indicadores de Performance</h1>
          <p className="text-muted-foreground">
            Avalie e gerencie indicadores de parceiros estratégicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar empresa..."
            className="w-[220px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {maskName(empresa.nome)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">Exportar CSV</Button>
          <Button onClick={fetchAll}>Atualizar</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando indicadores...</p>
        </div>
      ) : (
        <>
          {/* GRÁFICOS */}
          {!selectedEmpresa || selectedEmpresa === "all" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores Qualitativos (Top 10)</CardTitle>
                  <CardDescription>
                    Potencial, Engajamento, Alinhamento, Potencial de Investimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartQuali} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 5]} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Potencial" fill="#8884d8" />
                      <Bar dataKey="Engajamento" fill="#82ca9d" />
                      <Bar dataKey="Alinhamento" fill="#ffc658" />
                      <Bar dataKey="Pot. Investimento" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Base de Clientes</CardTitle>
                  <CardDescription>
                    Quantidade absoluta de clientes em cada parceiro
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartClientes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="Base de Clientes" fill="#0088fe" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredIndicadores.length === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Radar de Indicadores</CardTitle>
                    <CardDescription>
                      Visualização dos principais indicadores qualitativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="indicador" />
                        <PolarRadiusAxis domain={[0, 5]} />
                        <Radar
                          name={isDemoMode ? "" : filteredIndicadores[0].empresa?.nome}
                          dataKey="valor"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.5}
                        />
                        <RechartsTooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )
          )}
          {/* GRÁFICO SHARE OF WALLET */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Share of Wallet</CardTitle>
                <CardDescription>
                  Percentual de clientes indicados sobre a base de cada parceiro
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartShare} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                    <YAxis domain={[0, maxShare]} tickFormatter={(v) => `${v}%`} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Share of Wallet (%)" fill="#a020f0" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* TABELA */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Indicadores</CardTitle>
              <CardDescription>
                Lista detalhada de todos os indicadores registrados (mais recentes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "empresa") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("empresa");
                          setSortAsc(true);
                        }
                      }}>
                      Empresa {renderSortIcon("empresa")}
                    </TableHead>
                    {editableFields.map((field) => (
                      <TableHead
                        className="cursor-pointer"
                        key={field}
                        onClick={() => {
                          if (sortColumn === field) setSortAsc(!sortAsc);
                          else {
                            setSortColumn(field);
                            setSortAsc(true);
                          }
                        }}
                      >
                        {field === "potencial_leads" && <>Potencial Leads {renderSortIcon(field)}</>}
                        {field === "base_clientes" && <>Base Clientes {renderSortIcon(field)}</>}
                        {field === "engajamento" && <>Engajamento {renderSortIcon(field)}</>}
                        {field === "alinhamento" && <>Alinhamento {renderSortIcon(field)}</>}
                        {field === "potencial_investimento" && <>Pot. Investimento {renderSortIcon(field)}</>}
                        {field === "tamanho" && <>Tamanho {renderSortIcon(field)}</>}
                      </TableHead>
                    ))}
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "oportunidadesIndicadas") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("oportunidadesIndicadas");
                          setSortAsc(true);
                        }
                      }}>
                      Oportunidades Indicadas {renderSortIcon("oportunidadesIndicadas")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "share_of_wallet") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("share_of_wallet");
                          setSortAsc(true);
                        }
                      }}>
                      Share of Wallet (%) {renderSortIcon("share_of_wallet")}
                    </TableHead>
                    <TableHead>Data Avaliação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndicadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        Nenhum indicador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIndicadores.map((indicador) => (
                      <TableRow key={indicador.id}>
                        <TableCell>{maskName(indicador.empresa?.nome)}</TableCell>
                        {/* Campos editáveis */}
                        {editableFields.map((field) => (
                          <TableCell key={field}>
                            {editRowId === indicador.id ? (
                              field === "tamanho" ? (
                                <Select
                                  value={(editValues.tamanho as string) || ""}
                                  onValueChange={(value) =>
                                    setEditValues((v) => ({ ...v, tamanho: value as TamanhoEmpresa }))
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TAMANHOS.map((t) => (
                                      <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type={["potencial_leads", "base_clientes", "engajamento", "alinhamento", "potencial_investimento"].includes(field)
                                    ? "number"
                                    : "text"}
                                  min={["potencial_leads", "engajamento", "alinhamento", "potencial_investimento"].includes(field) ? 0 : undefined}
                                  max={["potencial_leads", "engajamento", "alinhamento", "potencial_investimento"].includes(field) ? 5 : undefined}
                                  value={editValues[field] ?? ""}
                                  className="w-[85px]"
                                  onChange={(e) =>
                                    setEditValues((v) => ({
                                      ...v,
                                      [field]: e.target.value === "" ? "" : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value),
                                    }))
                                  }
                                />
                              )
                            ) : (
                              safeRenderCell(indicador[field])
                            )}
                          </TableCell>
                        ))}
                        <TableCell>{safeRenderCell(indicador.oportunidadesIndicadas ?? 0)}</TableCell>
                        <TableCell>
                          {indicador.share_of_wallet !== undefined
                            ? indicador.share_of_wallet.toFixed(2) + "%"
                            : "-"}
                        </TableCell>
                        <TableCell>{formatDate(indicador.data_avaliacao)}</TableCell>
                        <TableCell>
                          {editRowId === indicador.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="outline"
                                title="Salvar"
                                onClick={() => handleSaveEdit(indicador.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                title="Cancelar"
                                onClick={handleCancelEdit}
                              >
                                <Cancel className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Editar"
                              onClick={() => handleEdit(indicador)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IndicadoresPage;
