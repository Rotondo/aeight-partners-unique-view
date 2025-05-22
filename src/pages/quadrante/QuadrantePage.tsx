import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuadranteChart from "@/components/quadrante/QuadranteChart";
import QuadranteForm from "@/components/quadrante/QuadranteForm";
import { Empresa, IndicadoresParceiro, QuadrantPoint, TamanhoEmpresa } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const tamanhoColorMap: Record<TamanhoEmpresa, string> = {
  PP: "#38bdf8",
  P: "#2dd4bf",
  M: "#4ade80",
  G: "#facc15",
  GG: "#f97316",
};

function mapIndicadorToPoint(item: IndicadoresParceiro, empresas: Empresa[]): QuadrantPoint {
  const empresa = empresas.find((e) => e.id === item.empresa_id);
  return {
    id: item.id || item.empresa_id,
    empresaId: item.empresa_id,
    nome: empresa?.nome || "Desconhecido",
    x: item.potencial_leads || 0,
    y: item.potencial_investimento || 0,
    tamanho: item.tamanho as TamanhoEmpresa || "M",
    engajamento: item.engajamento || 0,
    color: tamanhoColorMap[item.tamanho as TamanhoEmpresa] || "#94a3b8",
  };
}

const QuadrantePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [indicadores, setIndicadores] = useState<IndicadoresParceiro[]>([]);
  const [quadrantPoints, setQuadrantPoints] = useState<QuadrantPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParceiro, setSelectedParceiro] = useState<IndicadoresParceiro | null>(null);

  // Carrega empresas e indicadores do supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: empresasData } = await supabase.from("empresas").select("*");
      setEmpresas(empresasData || []);
      const { data: indicadoresData } = await supabase.from("indicadores_parceiro").select("*");
      setIndicadores(indicadoresData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Cria pontos do quadrante a partir dos indicadores e empresas
  useEffect(() => {
    if (indicadores.length && empresas.length) {
      setQuadrantPoints(
        indicadores.map((item) => mapIndicadorToPoint(item, empresas))
      );
    }
  }, [indicadores, empresas]);

  // Seleciona parceiro ao clicar no gráfico
  const handlePointClick = useCallback((pointId: string) => {
    const parceiro = indicadores.find((p) => (p.id || p.empresa_id) === pointId);
    setSelectedParceiro(parceiro || null);
  }, [indicadores]);

  // Seleciona parceiro ao escolher no formulário
  const handleParceiroSelect = useCallback((empresa_id: string) => {
    const parceiro = indicadores.find((p) => p.empresa_id === empresa_id);
    setSelectedParceiro(parceiro || null);
  }, [indicadores]);

  // Salva indicador (edição/criação) e atualiza quadrante em tempo real
  const handleSaveIndicador = async (indicador: Partial<IndicadoresParceiro>) => {
    try {
      let updatedIndicadores;
      if (indicador.id) {
        // Edita indicador existente
        const { data, error } = await supabase
          .from("indicadores_parceiro")
          .update(indicador)
          .eq("id", indicador.id)
          .select();
        if (error) throw error;
        updatedIndicadores = indicadores.map((item) =>
          item.id === indicador.id ? { ...item, ...indicador } : item
        );
        setIndicadores(updatedIndicadores);
      } else {
        // Cria novo indicador
        const newIndicador = {
          empresa_id: indicador.empresa_id!,
          potencial_leads: indicador.potencial_leads || 0,
          engajamento: indicador.engajamento || 0,
          alinhamento: indicador.alinhamento || 0,
          potencial_investimento: indicador.potencial_investimento || 0,
          tamanho: indicador.tamanho || "M",
          data_avaliacao: indicador.data_avaliacao || new Date().toISOString(),
          ...indicador
        };

        const { data, error } = await supabase
          .from("indicadores_parceiro")
          .insert([newIndicador])
          .select();
        if (error) throw error;
        updatedIndicadores = [...indicadores, ...(data || [])];
        setIndicadores(updatedIndicadores);
      }
      toast({
        title: "Sucesso",
        description: "Indicadores do parceiro salvos com sucesso!",
      });
      setSelectedParceiro(null);
    } catch (error) {
      console.error("Error saving indicators:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os indicadores.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quadrante de Parceiros</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Área do Gráfico - 2/3 da largura no desktop */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Matriz de Avaliação de Parceiros</CardTitle>
            <CardDescription>
              Visualização da relação entre potencial de geração de leads e potencial de investimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[420px]">
              <QuadranteChart
                data={quadrantPoints}
                isLoading={loading}
                onPointClick={handlePointClick}
                selectedId={selectedParceiro?.id || selectedParceiro?.empresa_id}
              />
            </div>
          </CardContent>
        </Card>
        {/* Área do Formulário - 1/3 da largura no desktop */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Parceiro</CardTitle>
            <CardDescription>
              {selectedParceiro
                ? `Editando: ${empresas.find(e => e.id === selectedParceiro.empresa_id)?.nome || "Parceiro"}`
                : "Selecione um parceiro no gráfico ou cadastre um novo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Editar</TabsTrigger>
                {user?.papel === "admin" && (
                  <TabsTrigger value="new">Novo</TabsTrigger>
                )}
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <QuadranteForm
                  indicador={selectedParceiro}
                  onSave={handleSaveIndicador}
                  readOnly={!user || user.papel === "user"}
                  onParceiroSelect={handleParceiroSelect}
                />
              </TabsContent>
              {user?.papel === "admin" && (
                <TabsContent value="new" className="mt-4">
                  <QuadranteForm
                    indicador={null}
                    onSave={handleSaveIndicador}
                    readOnly={false}
                  />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      {/* Legenda */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Legenda</CardTitle>
            <CardDescription>Interpretação do quadrante de parceiros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Superior Direito</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Alto potencial de leads e investimento</strong> - Parceiros estratégicos prioritários
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Superior Esquerdo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Baixo potencial de leads, alto investimento</strong> - Parceiros com potencial de desenvolvimento
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Inferior Direito</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Alto potencial de leads, baixo investimento</strong> - Parceiros com boa rentabilidade
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Inferior Esquerdo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Baixo potencial de leads e investimento</strong> - Parceiros de menor prioridade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadrantePage;
