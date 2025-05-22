import React, { useState, useEffect } from "react";
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
import { IndicadoresParceiro, Empresa, Oportunidade } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

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

  // MODAL DE EDIÇÃO
  const [editModal, setEditModal] = useState<{ open: boolean; indicador?: IndicadoresParceiroWithEmpresa }>({ open: false });

  // --------- CARREGAMENTO DE DADOS ---------
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

      // JOIN empresa no indicador (para nome)
      let allIndicadores: IndicadoresParceiroWithEmpresa[] = indicadoresData.map(
        (indicador: any) => {
          const empresa = empresasData.find((e: any) => e.id === indicador.empresa_id);
          return {
            ...indicador,
            empresa: empresa ? { id: empresa.id, nome: empresa.nome } : undefined,
          };
        }
      );

      // MANTER APENAS O MAIS RECENTE DE CADA PARCEIRO
      const uniqueIndicadores: Record<string, IndicadoresParceiroWithEmpresa> = {};
      for (const indicador of allIndicadores) {
        if (!uniqueIndicadores[indicador.empresa_id]) {
          uniqueIndicadores[indicador.empresa_id] = indicador;
        }
      }
      let indicadoresUnicos = Object.values(uniqueIndicadores);

      // Calcular oportunidades indicadas e share of wallet
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

  // --------- FILTRO E ORDENAÇÃO ---------
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

  // --------- EXPORTAÇÃO CSV ---------
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
      i.empresa?.nome || "-",
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

  // --------- EDIÇÃO (EXEMPLO SIMPLES) ---------
  function handleEdit(indicador: IndicadoresParceiroWithEmpresa) {
    setEditModal({ open: true, indicador });
  }
  function handleSaveEdit() {
    toast({ title: "Edição ainda não implementada", description: "Aqui você pode implementar o salvamento via Supabase." });
    setEditModal({ open: false });
  }

  // --------- GRÁFICOS ---------
  const chartQuali = filteredIndicadores
    .sort((a, b) => b.potencial_leads - a.potencial_leads)
    .slice(0, 10) // Top 10 por potencial
    .map((ind) => ({
      nome: ind.empresa?.nome || "Parceiro",
      Potencial: ind.potencial_leads,
      Engajamento: ind.engajamento,
      Alinhamento: ind.alinhamento,
      "Pot. Investimento": ind.potencial_investimento,
    }));

  const chartClientes = filteredIndicadores.map((ind) => ({
    nome: ind.empresa?.nome || "Parceiro",
    "Base de Clientes": ind.base_clientes || 0,
  }));

  const maxShare = Math.max(...filteredIndicadores.map((i) => i.share_of_wallet || 0), 100);
  const chartShare = filteredIndicadores.map((ind) => ({
    nome: ind.empresa?.nome || "Parceiro",
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 md:justify-between items-center">
        <h1 className="text-2xl font-bold">Indicadores de Parceiros</h1>
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
                  {empresa.nome}
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
          {/* Apenas se NÃO houver parceiro selecionado */}
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
                      <Tooltip />
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
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Base de Clientes" fill="#0088fe" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Se UM parceiro, mostra RADAR
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
                          name={filteredIndicadores[0].empresa?.nome}
                          dataKey="valor"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.5}
                        />
                        <Tooltip />
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
                    <Tooltip />
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
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "potencial_leads") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("potencial_leads");
                          setSortAsc(true);
                        }
                      }}>
                      Potencial Leads {renderSortIcon("potencial_leads")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "base_clientes") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("base_clientes");
                          setSortAsc(true);
                        }
                      }}>
                      Base Clientes {renderSortIcon("base_clientes")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "engajamento") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("engajamento");
                          setSortAsc(true);
                        }
                      }}>
                      Engajamento {renderSortIcon("engajamento")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "alinhamento") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("alinhamento");
                          setSortAsc(true);
                        }
                      }}>
                      Alinhamento {renderSortIcon("alinhamento")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "potencial_investimento") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("potencial_investimento");
                          setSortAsc(true);
                        }
                      }}>
                      Pot. Investimento {renderSortIcon("potencial_investimento")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => {
                        if (sortColumn === "tamanho") setSortAsc(!sortAsc);
                        else {
                          setSortColumn("tamanho");
                          setSortAsc(true);
                        }
                      }}>
                      Tamanho {renderSortIcon("tamanho")}
                    </TableHead>
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
                      <TableCell colSpan={11} className="text-center">
                        Nenhum indicador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIndicadores.map((indicador) => (
                      <TableRow key={indicador.id}>
                        <TableCell>{indicador.empresa?.nome || "-"}</TableCell>
                        <TableCell>{indicador.potencial_leads}</TableCell>
                        <TableCell>{indicador.base_clientes || "-"}</TableCell>
                        <TableCell>{indicador.engajamento}</TableCell>
                        <TableCell>{indicador.alinhamento}</TableCell>
                        <TableCell>{indicador.potencial_investimento}</TableCell>
                        <TableCell>{indicador.tamanho}</TableCell>
                        <TableCell>{indicador.oportunidadesIndicadas ?? 0}</TableCell>
                        <TableCell>
                          {indicador.share_of_wallet !== undefined
                            ? indicador.share_of_wallet.toFixed(2) + "%"
                            : "-"}
                        </TableCell>
                        <TableCell>{formatDate(indicador.data_avaliacao)}</TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Editar"
                            onClick={() => handleEdit(indicador)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {/* MODAL DE EDIÇÃO SIMPLES */}
              {editModal.open && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded shadow-lg w-[90vw] max-w-lg space-y-4">
                    <h2 className="text-xl font-bold mb-2">Edição de Indicador</h2>
                    <div>
                      <strong>Empresa:</strong>{" "}
                      {editModal.indicador?.empresa?.nome || "-"}
                    </div>
                    <div>
                      <strong>Potencial Leads:</strong>{" "}
                      {editModal.indicador?.potencial_leads}
                    </div>
                    <div>
                      <strong>Base Clientes:</strong>{" "}
                      {editModal.indicador?.base_clientes}
                    </div>
                    <div>
                      <strong>Engajamento:</strong>{" "}
                      {editModal.indicador?.engajamento}
                    </div>
                    <div>
                      <strong>Alinhamento:</strong>{" "}
                      {editModal.indicador?.alinhamento}
                    </div>
                    <div>
                      <strong>Pot. Investimento:</strong>{" "}
                      {editModal.indicador?.potencial_investimento}
                    </div>
                    <div>
                      <Button onClick={handleSaveEdit}>Salvar (exemplo)</Button>
                      <Button variant="ghost" onClick={() => setEditModal({ open: false })}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IndicadoresPage;
