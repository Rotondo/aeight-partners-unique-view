
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { IndicadoresParceiro, QuadrantPoint, TamanhoEmpresa } from '@/types';
import QuadranteChart from '@/components/quadrante/QuadranteChart';
import QuadranteForm from '@/components/quadrante/QuadranteForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const tamanhoColorMap: Record<TamanhoEmpresa, string> = {
  'PP': '#38bdf8', // sky-400
  'P': '#2dd4bf',  // teal-400
  'M': '#4ade80',  // green-400
  'G': '#facc15',  // yellow-400
  'GG': '#f97316', // orange-500
};

const QuadrantePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [indicadores, setIndicadores] = useState<IndicadoresParceiro[]>([]);
  const [quadrantPoints, setQuadrantPoints] = useState<QuadrantPoint[]>([]);
  const [selectedParceiro, setSelectedParceiro] = useState<IndicadoresParceiro | null>(null);
  
  // Load indicators and convert to quadrant points
  useEffect(() => {
    const fetchIndicadores = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('indicadores_parceiro')
          .select(`
            id, 
            empresa_id, 
            potencial_leads, 
            potencial_investimento, 
            engajamento, 
            tamanho,
            empresas (
              nome
            )
          `);

        if (error) throw error;
        
        setIndicadores(data as IndicadoresParceiro[]);
        
        // Transform to quadrant points
        const points = data.map((item: any) => ({
          id: item.id,
          empresaId: item.empresa_id,
          nome: item.empresas.nome,
          x: item.potencial_leads,
          y: item.potencial_investimento,
          tamanho: item.tamanho,
          engajamento: item.engajamento,
          color: tamanhoColorMap[item.tamanho as TamanhoEmpresa] || '#94a3b8',
        }));
        
        setQuadrantPoints(points);
      } catch (error) {
        console.error('Error fetching indicators:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os indicadores dos parceiros.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchIndicadores();
  }, [toast]);

  // Handle point click
  const handlePointClick = async (pointId: string) => {
    try {
      const { data, error } = await supabase
        .from('indicadores_parceiro')
        .select(`
          *,
          empresas (
            id,
            nome
          )
        `)
        .eq('id', pointId)
        .single();

      if (error) throw error;

      setSelectedParceiro(data as any);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes deste parceiro.',
        variant: 'destructive',
      });
    }
  };

  // Handle form save
  const handleSaveIndicador = async (indicador: Partial<IndicadoresParceiro>) => {
    try {
      const { data, error } = await supabase
        .from('indicadores_parceiro')
        .upsert({
          ...indicador,
          data_avaliacao: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Refresh data
      const { data: refreshedData, error: refreshError } = await supabase
        .from('indicadores_parceiro')
        .select(`
          id,
          empresa_id,
          potencial_leads,
          potencial_investimento,
          engajamento,
          tamanho,
          empresas (
            nome
          )
        `);

      if (refreshError) throw refreshError;

      setIndicadores(refreshedData as IndicadoresParceiro[]);

      // Transform to quadrant points
      const points = refreshedData.map((item: any) => ({
        id: item.id,
        empresaId: item.empresa_id,
        nome: item.empresas.nome,
        x: item.potencial_leads,
        y: item.potencial_investimento,
        tamanho: item.tamanho,
        engajamento: item.engajamento,
        color: tamanhoColorMap[item.tamanho as TamanhoEmpresa] || '#94a3b8',
      }));
      
      setQuadrantPoints(points);

      toast({
        title: 'Sucesso',
        description: 'Indicadores do parceiro salvos com sucesso!',
      });

      // Reset selection
      setSelectedParceiro(null);
    } catch (error) {
      console.error('Error saving indicators:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar os indicadores.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Quadrante de Parceiros</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chart Area - 2/3 width on desktop */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Matriz de Avaliação de Parceiros</CardTitle>
            <CardDescription>
              Visualização da relação entre potencial de geração de leads e potencial de investimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <QuadranteChart 
                data={quadrantPoints} 
                isLoading={loading}
                onPointClick={handlePointClick} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Area - 1/3 width on desktop */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Parceiro</CardTitle>
            <CardDescription>
              {selectedParceiro
                ? `Editando: ${(selectedParceiro as any).empresas?.nome || 'Parceiro'}`
                : 'Selecione um parceiro no gráfico ou cadastre um novo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Editar</TabsTrigger>
                {user?.papel === 'admin' && (
                  <TabsTrigger value="new">Novo</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="edit" className="mt-4">
                <QuadranteForm
                  indicador={selectedParceiro}
                  onSave={handleSaveIndicador}
                  readOnly={!user || user.papel === 'user'}
                />
              </TabsContent>
              
              {user?.papel === 'admin' && (
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
                  <strong>Baixo potencial de leads e investimento</strong> - Parceiros a reavaliar
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-2">Tamanho das Empresas</h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(tamanhoColorMap).map(([tamanho, color]) => (
                  <div key={tamanho} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: color }}
                    />
                    <span>{tamanho}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                O tamanho dos pontos no gráfico representa o nível de engajamento do parceiro.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuadrantePage;
