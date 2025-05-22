
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { IndicadoresParceiro, Empresa } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

// Define the extended type that includes the empresa join result
interface IndicadoresParceiroWithEmpresa extends IndicadoresParceiro {
  empresa?: {
    id: string;
    nome: string;
  }
}

const IndicadoresPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredIndicadores, setFilteredIndicadores] = useState<IndicadoresParceiroWithEmpresa[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchIndicadores();
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (selectedEmpresa && selectedEmpresa !== "all") {
      setFilteredIndicadores(
        indicadores.filter(ind => ind.empresa_id === selectedEmpresa)
      );
    } else {
      setFilteredIndicadores(indicadores);
    }
  }, [selectedEmpresa, indicadores]);

  useEffect(() => {
    prepareChartData();
  }, [filteredIndicadores]);

  const fetchIndicadores = async () => {
    try {
      setLoading(true);
      
      // First, fetch the indicadores data without the join to avoid stack depth issues
      const { data: indicadoresData, error: indicadoresError } = await supabase
        .from("indicadores_parceiro")
        .select("*")
        .order("data_avaliacao", { ascending: false });

      if (indicadoresError) throw indicadoresError;
      
      // Then, fetch empresa data separately
      const { data: empresasData, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome");
        
      if (empresasError) throw empresasError;
      
      // Map the empresa data to the indicadores
      const indicadoresWithEmpresas = indicadoresData.map((indicador: any) => {
        const empresa = empresasData.find((e: any) => e.id === indicador.empresa_id);
        return {
          ...indicador,
          empresa: empresa ? { id: empresa.id, nome: empresa.nome } : undefined
        };
      });
      
      setIndicadores(indicadoresWithEmpresas as IndicadoresParceiroWithEmpresa[]);
      setFilteredIndicadores(indicadoresWithEmpresas as IndicadoresParceiroWithEmpresa[]);
      console.log("Indicadores carregados:", indicadoresWithEmpresas);
    } catch (error) {
      console.error("Erro ao buscar indicadores:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os indicadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("tipo", "parceiro")
        .eq("status", true)
        .order("nome");

      if (error) throw error;
      setEmpresas(data as Empresa[]);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  const prepareChartData = () => {
    // Transform the filtered indicators into chart data
    const chartData = filteredIndicadores.map(ind => ({
      nome: ind.empresa?.nome || "Parceiro",
      'Potencial de Leads': ind.potencial_leads,
      'Engajamento': ind.engajamento,
      'Alinhamento': ind.alinhamento,
      'Potencial de Investimento': ind.potencial_investimento,
      'Base de Clientes': ind.base_clientes || 0,
    }));

    setChartData(chartData);
  };

  const handleEmpresaChange = (value: string) => {
    setSelectedEmpresa(value);
  };

  // Function to get empresa name from id
  const getEmpresaNome = (id: string): string => {
    const empresa = empresas.find(e => e.id === id);
    return empresa ? empresa.nome : "Desconhecido";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
              {empresas.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={() => fetchIndicadores()}>Atualizar</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando indicadores...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral dos Indicadores</CardTitle>
                <CardDescription>
                  Análise comparativa dos principais indicadores por parceiro
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Potencial de Leads" fill="#8884d8" />
                    <Bar dataKey="Engajamento" fill="#82ca9d" />
                    <Bar dataKey="Alinhamento" fill="#ffc658" />
                    <Bar dataKey="Potencial de Investimento" fill="#ff7300" />
                    <Bar dataKey="Base de Clientes" fill="#0088fe" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Indicadores</CardTitle>
              <CardDescription>
                Lista detalhada de todos os indicadores registrados
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
                    <TableHead>Data Avaliação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIndicadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Nenhum indicador encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIndicadores.map(indicador => (
                      <TableRow key={indicador.id}>
                        <TableCell>{indicador.empresa?.nome || getEmpresaNome(indicador.empresa_id)}</TableCell>
                        <TableCell>{indicador.potencial_leads}</TableCell>
                        <TableCell>{indicador.base_clientes || "-"}</TableCell>
                        <TableCell>{indicador.engajamento}</TableCell>
                        <TableCell>{indicador.alinhamento}</TableCell>
                        <TableCell>{indicador.potencial_investimento}</TableCell>
                        <TableCell>{indicador.tamanho}</TableCell>
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
