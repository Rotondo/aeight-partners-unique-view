
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Target, TrendingUp, Building } from 'lucide-react';
import { MetaForm } from './MetaForm';
import { MetasProgress } from './MetasProgress';
import { ResultadosPorGrupoComponent } from './ResultadosPorGrupo';
import { ResultadosPorEmpresaComponent } from './ResultadosPorEmpresa';
import { ResultadosFiltersComponent } from './ResultadosFilters';
import { useMetas } from '@/hooks/useMetas';
import { useMetasProgress } from '@/hooks/useMetasProgress';
import { useResultadosStats } from '@/hooks/useResultadosStats';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import type { Meta, ResultadosFilters as ResultadosFiltersType } from '@/types/metas';

export const ResultadosControl: React.FC = () => {
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [editingMeta, setEditingMeta] = useState<Meta | undefined>();
  const [filters, setFilters] = useState<ResultadosFiltersType>({});
  
  const { metas, isLoading: metasLoading, createMeta, updateMeta, deleteMeta } = useMetas();
  const { filteredOportunidades, isLoading: oportunidadesLoading } = useOportunidades();
  
  const oportunidades = filteredOportunidades || [];
  const metasProgress = useMetasProgress(metas, oportunidades, filters);
  const { resultadosPorGrupo, resultadosPorEmpresa } = useResultadosStats(oportunidades, filters);

  const handleCreateMeta = async (data: any) => {
    await createMeta({
      ...data,
      ativo: true
    });
    setShowMetaForm(false);
  };

  const handleUpdateMeta = async (data: any) => {
    if (editingMeta) {
      await updateMeta(editingMeta.id, data);
      setEditingMeta(undefined);
      setShowMetaForm(false);
    }
  };

  const handleEditMeta = (meta: Meta) => {
    setEditingMeta(meta);
    setShowMetaForm(true);
  };

  const handleDeleteMeta = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      await deleteMeta(id);
    }
  };

  const isLoading = metasLoading || oportunidadesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Controle de Resultados
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Acompanhe metas e analise resultados por segmento e empresa
              </p>
            </div>
            <Button onClick={() => setShowMetaForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros de Período */}
      <ResultadosFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Tabs principais */}
      <Tabs defaultValue="metas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metas" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Metas & Progresso
          </TabsTrigger>
          <TabsTrigger value="grupos" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análise por Grupos
          </TabsTrigger>
          <TabsTrigger value="empresas" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Análise por Empresas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metas" className="space-y-6">
          <MetasProgress
            metasProgress={metasProgress}
            onEditMeta={handleEditMeta}
            onDeleteMeta={handleDeleteMeta}
          />
        </TabsContent>

        <TabsContent value="grupos" className="space-y-6">
          <ResultadosPorGrupoComponent resultados={resultadosPorGrupo} />
        </TabsContent>

        <TabsContent value="empresas" className="space-y-6">
          <ResultadosPorEmpresaComponent resultados={resultadosPorEmpresa} />
        </TabsContent>
      </Tabs>

      {/* Modal de Meta */}
      <MetaForm
        open={showMetaForm}
        onClose={() => {
          setShowMetaForm(false);
          setEditingMeta(undefined);
        }}
        onSave={editingMeta ? handleUpdateMeta : handleCreateMeta}
        meta={editingMeta}
      />
    </div>
  );
};
