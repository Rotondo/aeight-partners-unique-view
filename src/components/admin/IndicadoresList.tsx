
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empresa, IndicadoresParceiro, TamanhoEmpresa, TipoEmpresa } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PrivateData } from "@/components/privacy/PrivateData";
import { useDemoMask } from "@/utils/demoMask";

interface IndicadorComEmpresa extends IndicadoresParceiro {
  empresa?: {
    nome: string;
  };
}

export const IndicadoresList: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadorComEmpresa[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Aplicar máscara aos dados
  const maskedIndicadores = useDemoMask(indicadores);
  const maskedEmpresas = useDemoMask(empresas);

  useEffect(() => {
    fetchIndicadores();
    fetchEmpresas();
  }, []);

  const fetchIndicadores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("indicadores_parceiro")
        .select(`
          *,
          empresa:empresas(nome)
        `)
        .order("data_avaliacao", { ascending: false });

      if (error) throw error;
      setIndicadores(data as IndicadorComEmpresa[]);
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
        .order("nome");

      if (error) throw error;
      
      // Convert the raw data to match the Empresa type
      const typedData: Empresa[] = data.map(item => ({
        ...item,
        tipo: item.tipo as TipoEmpresa
      }));
      
      setEmpresas(typedData);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  const formatDataAvaliacao = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Helper function to map tamanho codes to readable names
  const getTamanhoDisplay = (tamanho: TamanhoEmpresa) => {
    switch (tamanho) {
      case "PP": return "Pequeno Porte (PP)";
      case "P": return "Pequeno (P)";
      case "M": return "Médio (M)";
      case "G": return "Grande (G)";
      case "GG": return "Grande Porte (GG)";
      default: return tamanho;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Indicadores de Parceiros</h2>
      {loading ? (
        <div className="text-center p-4">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Potencial Leads</TableHead>
              <TableHead>Base Clientes</TableHead>
              <TableHead>Engajamento</TableHead>
              <TableHead>Alinhamento</TableHead>
              <TableHead>Potencial Investimento</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Score X</TableHead>
              <TableHead>Score Y</TableHead>
              <TableHead>Data Avaliação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maskedIndicadores.map((indicador) => (
              <TableRow key={indicador.id}>
                <TableCell>
                  <PrivateData type="company">
                    {indicador.empresa?.nome}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.potencial_leads}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.base_clientes}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.engajamento}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.alinhamento}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.potencial_investimento}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="generic">
                    {getTamanhoDisplay(indicador.tamanho)}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.score_x}
                  </PrivateData>
                </TableCell>
                <TableCell>
                  <PrivateData type="value">
                    {indicador.score_y}
                  </PrivateData>
                </TableCell>
                <TableCell>{formatDataAvaliacao(indicador.data_avaliacao)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
