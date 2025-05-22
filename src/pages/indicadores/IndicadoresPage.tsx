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
} from "recharts";
import { useToast } from "@/hooks/use-toast";

interface IndicadoresParceiroWithEmpresa extends IndicadoresParceiro {
  empresa?: {
    id: string;
    nome: string;
  };
  oportunidadesIndicadas?: number;
  share_of_wallet?: number;
}

const IndicadoresPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [filteredIndicadores, setFilteredIndicadores] = useState<
    IndicadoresParceiroWithEmpresa[]
  >([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [chartQuali, setChartQuali] = useState<any[]>([]);
  const [chartClientes, setChartClientes] = useState<any[]>([]);
  const [chartShare, setChartShare] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Indicadores
      const { data: indicadoresData, error: indicadoresError } = await supabase
        .from("indicadores_parceiro")
        .select("*")
        .order("data_avaliacao", { ascending: false });
      if (indicadoresError) throw indicadoresError;

      // Empresas (apenas parceiros ativos)
      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome, tipo, status")
        .eq("tipo", "parceiro")
        .eq("status", true)
        .order("nome");
      if (empresasError) throw empresasError;

      // Oportunidades
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

      // MANTER APENAS O REGISTRO MAIS RECENTE DE CADA PARCEIRO
      const uniqueIndicadores: Record<string, IndicadoresParceiroWithEmpresa> = {};
      for (const indicador of allIndicadores) {
        // Como está ordenado por data_avaliacao desc, basta pegar o primeiro de cada empresa
        if (!uniqueIndicadores[indicador.empresa_id]) {
          uniqueIndicadores[indicador.empresa_id] = indicador;
        }
      }
      // Convertemos para array
      let indicadoresUnicos = Object.values(uniqueIndicadores);

      // Calcular oportunidades indicadas e share of wallet
      const indicadoresComOportunidades = indicadoresUnicos.map((indicador) => {
        // Quantas oportunidades foram indicadas por esse parceiro (empresa_id)
        const oportunidadesDoParceiro = oportunidadesData.filter(
          (o: any) => o.empresa_origem_id === indicador.empresa_id
        ).length;
        // Calcula share of wallet, se houver base_clientes
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
      prepareCharts(indicadoresComOportunidades);
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
    if (selectedEmpresa && selectedEmpresa !== "all") {
      filt = indicadores.filter((ind) => ind.empresa_id === selectedEmpresa);
    }
    setFilteredIndicadores(filt);
    prepareCharts(filt);
  }, [selectedEmpresa, indicadores]);

  // ======== GRÁFICOS ========
  function prepareCharts(indicadores: IndicadoresParceiroWithEmpresa[]) {
    // Gráfico QUALITATIVOS
    setChartQuali(
      indicadores.map((ind) => ({
        nome: ind.empresa?.nome || "Parceiro",
        Potencial: ind.potencial_leads,
        Engajamento: ind.engajamento,
        Alinhamento: ind.alinhamento,
        "Pot. Investimento": ind.potencial_investimento,
      }))
    );
    // Gráfico BASE DE CLIENTES
    setChartClientes(
      indicadores.map((ind) => ({
        nome: ind.empresa?.nome || "Parceiro",
        "Base de Clientes": ind.base_clientes || 0,
      }))
    );
    // Gráfico SHARE OF WALLET
    setChartShare(
      indicadores.map((ind) => ({
        nome: ind.empresa?.nome || "Parceiro",
        "Share of Wallet (%)": ind.share_of_wallet ? Number(ind.share_of_wallet.toFixed(2)) : 0,
      }))
    );
  }

  const handleEmpresaChange = (value: string) => {
    setSelectedEmpresa(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Indicadores de Parceiros</h1>
        <div className="flex space-x-4">
          <Select value={selectedEmpresa} onValueChange={handleEmpresaChange}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Qualitativos</CardTitle>
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
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
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
                    <TableHead>Empresa</TableHead>
                    <TableHead>Potencial Leads</TableHead>
                    <TableHead>Base Clientes</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead>Alinhamento</TableHead>
                    <TableHead>Pot. Investimento</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Oportunidades Indicadas</TableHead>
                    <TableHead>Share of Wallet (%)</TableHead>
                    <TableHead>Data Avaliação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndicadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center">
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
