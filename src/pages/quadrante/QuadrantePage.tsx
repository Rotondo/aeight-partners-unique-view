import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuadranteChart from "@/components/quadrante/QuadranteChart";
import QuadranteForm from "@/components/quadrante/QuadranteForm";
import ParceirosPendentes from "@/components/quadrante/ParceirosPendentes";
import QuadranteStats from "@/components/quadrante/QuadranteStats";
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

  // Cálculo composto (ponderado) para X e Y
  const potencial_leads = Number(item.potencial_leads) || 0;
  const potencial_investimento = Number(item.potencial_investimento) || 0;
  const engajamento = Number(item.engajamento) || 0;
  const alinhamento = Number(item.alinhamento) || 0;
  const pesoLeads = 2, pesoInvest = 2, pesoEngaj = 1, pesoAlinh = 1;

  let x = (pesoLeads * potencial_leads + pesoEngaj * engajamento + pesoAlinh * alinhamento) / (pesoLeads + pesoEngaj + pesoAlinh);
  let y = (pesoInvest * potencial_investimento + pesoEngaj * engajamento + pesoAlinh * alinhamento) / (pesoInvest + pesoEngaj + pesoAlinh);

  x += (Math.random() - 0.5) * 0.08;
  y += (Math.random() - 0.5) * 0.08;

  x = Math.max(0, Math.min(5, x));
  y = Math.max(0, Math.min(5, y));

  return {
    id: item.id || item.empresa_id,
    empresaId: item.empresa_id,
    nome: empresa?.nome || "Desconhecido",
    x,
    y,
    tamanho: item.tamanho as TamanhoEmpresa || "M",
    engajamento,
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
  const [activeTab, setActiveTab] = useState<"edit" | "new" | "pendentes">("edit");
  const [empresaParaAvaliar, setEmpresaParaAvaliar] = useState<Empresa | null>(null);

  // Carrega empresas (apenas parceiros) e indicadores do supabase
  const fetchData = async () => {
    setLoading(true);
    const { data: empresasData } = await supabase
      .from("empresas")
      .select("*")
      .eq("tipo", "parceiro");
    setEmpresas(empresasData || []);
    const { data: indicadoresData } = await supabase
      .from("indicadores_parceiro")
      .select("*")
      .order("data_avaliacao", { ascending: false });
    // Apenas o registro mais recente de cada parceiro
    const unicosPorEmpresa: Record<string, IndicadoresParceiro> = {};
    (indicadoresData || []).forEach((item) => {
      if (item.empresa_id && !unicosPorEmpresa[item.empresa_id]) {
        unicosPorEmpresa[item.empresa_id] = item;
      }
    });
    setIndicadores(Object.values(unicosPorEmpresa));
    setLoading(false);
  };

  useEffect(() => {
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

  // Sincroniza seleção de parceiro entre gráfico e formulário
  const handlePointClick = (pointId: string) => {
    const parceiro = indicadores.find((p) => (p.id || p.empresa_id) === pointId);
    setSelectedParceiro(parceiro || null);
    setActiveTab("edit");
  };

  // Sincroniza seleção de parceiro via formulário
  const handleParceiroSelect = (empresa_id: string) => {
    const parceiro = indicadores.find((p) => p.empresa_id === empresa_id);
    setSelectedParceiro(parceiro || null);
    setActiveTab("edit");
  };

  // Handler para avaliar parceiro pendente
  const handleAvaliarParceiro = (empresa: Empresa) => {
    setEmpresaParaAvaliar(empresa);
    setSelectedParceiro(null);
    setActiveTab("new");
  };

  // Salva indicador (edição/criação) e atualiza quadrante em tempo real
  const handleSaveIndicador = async (indicador: Partial<IndicadoresParceiro>) => {
    try {
      if (indicador.id) {
        // Edição
        const { error } = await supabase
          .from("indicadores_parceiro")
          .update(indicador)
          .eq("id", indicador.id);
        if (error) throw error;
        await fetchData();
      } else {
        // Criação (Novo)
        const now = new Date().toISOString();
        const newIndicador = {
          empresa_id: indicador.empresa_id!,
          potencial_leads: indicador.potencial_leads || 0,
          engajamento: indicador.engajamento || 0,
          alinhamento: indicador.alinhamento || 0,
          potencial_investimento: indicador.potencial_investimento || 0,
          tamanho: indicador.tamanho || "M",
          base_clientes: indicador.base_clientes || 0,
          data_avaliacao: now,
        };

        const { error } = await supabase
          .from("indicadores_parceiro")
          .insert([newIndicador]);
        if (error) throw error;
        await fetchData();
      }
      toast({
        title: "Sucesso",
        description: "Indicadores do parceiro salvos com sucesso!",
      });
      setSelectedParceiro(null);
      setEmpresaParaAvaliar(null);
      setActiveTab("edit");
    } catch (error) {
      console.error("Error saving indicators:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os indicadores.",
        variant: "destructive",
      });
    }
  };

  // Calcular estatísticas
  const totalParceiros = empresas.filter(e => e.tipo === "parceiro").length;
  const parceirosAvaliados = indicadores.length;
  const empresasComIndicadores = indicadores.map(i => i.empresa_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quadrante de Parceiros</h1>
      </div>
      
      {/* Estatísticas */}
      <QuadranteStats 
        totalParceiros={totalParceiros}
        parceirosAvaliados={parceirosAvaliados}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Área do Gráfico - 2/3 da largura no desktop */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Matriz de Avaliação de Parceiros</CardTitle>
            <CardDescription>
              Visualização da relação entre potencial de geração de leads, investimento, engajamento e alinhamento
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
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "edit" | "new" | "pendentes")}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit">Editar</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
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
                  empresas={empresas}
                />
              </TabsContent>
              <TabsContent value="pendentes" className="mt-4">
                <ParceirosPendentes
                  empresas={empresas}
                  empresasComIndicadores={empresasComIndicadores}
                  onAvaliarParceiro={handleAvaliarParceiro}
                />
              </TabsContent>
              {user?.papel === "admin" && (
                <TabsContent value="new" className="mt-4">
                  <QuadranteForm
                    indicador={null}
                    onSave={handleSaveIndicador}
                    readOnly={false}
                    empresas={empresas}
                    empresaPreSelecionada={empresaParaAvaliar}
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
                  <strong>Alto potencial em todos os indicadores</strong> - Parceiros estratégicos prioritários
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Superior Esquerdo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Baixo potencial de leads, alto investimento ou outros indicadores elevados</strong> - Parceiros com potencial de desenvolvimento
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Inferior Direito</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Alto potencial de leads, baixo investimento, mas engajamento/alinhamento podem ser altos</strong> - Parceiros com boa rentabilidade
                </p>
              </div>
              <div className="border p-4 rounded-md">
                <h4 className="font-medium mb-2">Quadrante Inferior Esquerdo</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Baixo potencial em todos os indicadores</strong> - Parceiros de menor prioridade
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
