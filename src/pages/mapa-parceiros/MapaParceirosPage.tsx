import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  ArrowLeft,
  Route,
  Grid3X3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import MapaParceirosSidebar from '@/components/mapa-parceiros/MapaParceirosSidebar';
import ParceiroDetalhesSimplificado from '@/components/mapa-parceiros/ParceiroDetalhesSimplificado';
import EmpresaSelector from '@/components/mapa-parceiros/EmpresaSelector';
import JornadaVisualization from '@/components/mapa-parceiros/JornadaVisualization';
import MapaParceirosTable from '@/components/mapa-parceiros/MapaParceirosTable';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';
import { DemoModeToggle } from '@/components/privacy/DemoModeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

const MapaParceirosPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    etapas,
    subniveis,
    parceiros,
    associacoes,
    loading,
    filtros,
    stats,
    setFiltros,
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao
  } = useMapaParceiros();

  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroMapa | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'jornada' | 'grid'>('jornada');
  const [filtrosLocal, setFiltrosLocal] = useState<MapaParceirosFiltros>({
    busca: '',
    status: '',
    etapaId: '',
    subnivelId: '',
    apenasSemEtapa: false,
  });

  // Função para limpar todos os filtros
  const handleLimparFiltros = () => {
    const filtrosVazios: MapaParceirosFiltros = {
      busca: '',
      status: '',
      etapaId: '',
      subnivelId: '',
      apenasSemEtapa: false,
    };
    setFiltrosLocal(filtrosVazios);
    setFiltros(filtrosVazios);
  };

  // Função para atualizar filtros simultaneamente
  const handleAtualizarFiltros = (atualizacoes: Partial<MapaParceirosFiltros>) => {
    const novosFiltros = { ...filtrosLocal, ...atualizacoes };
    setFiltrosLocal(novosFiltros);
    setFiltros(novosFiltros);
  };

  const handleToggleEtapa = (etapaId: string) => {
    const newExpanded = new Set(expandedEtapas);
    if (newExpanded.has(etapaId)) {
      newExpanded.delete(etapaId);
    } else {
      newExpanded.add(etapaId);
    }
    setExpandedEtapas(newExpanded);
  };

  const handleParceiroClick = (parceiro: ParceiroMapa) => {
    setParceiroSelecionado(parceiro);
    setShowDetalhes(true);
  };

  const handleNovoParceiro = () => {
    setShowEmpresaSelector(true);
  };

  const handleSalvarEmpresaParceiro = async (dados: { 
    empresa_id: string; 
    status: string; 
    performance_score: number | string; 
    observacoes?: string 
  }) => {
    const dadosFormatados = {
      empresa_id: dados.empresa_id,
      status: dados.status as 'ativo' | 'inativo' | 'pendente',
      performance_score: Number(dados.performance_score) || 0,
      observacoes: dados.observacoes
    };
    
    await criarParceiro(dadosFormatados);
  };

  const handleDeletarParceiro = async (parceiro: ParceiroMapa) => {
    if (window.confirm(`Tem certeza que deseja remover o parceiro "${parceiro.empresa?.nome}"?`)) {
      await deletarParceiro(parceiro.id);
      if (parceiroSelecionado?.id === parceiro.id) {
        setShowDetalhes(false);
        setParceiroSelecionado(null);
      }
    }
  };

  const handleSalvarDetalhes = async (dados: Partial<ParceiroMapa>) => {
    if (parceiroSelecionado) {
      const dadosFormatados = {
        ...dados,
        ...(dados.performance_score !== undefined && {
          performance_score: typeof dados.performance_score === 'string' 
            ? Number(dados.performance_score) || 0
            : Number(dados.performance_score) || 0
        })
      };
      
      await atualizarParceiro(parceiroSelecionado.id, dadosFormatados);
      setParceiroSelecionado({ 
        ...parceiroSelecionado, 
        ...dadosFormatados,
        performance_score: Number(dadosFormatados.performance_score) || 0
      });
    }
  };

  // Aplica filtros à lista de parceiros
  const parceirosFiltrados = useMemo(() => {
    let resultado = [...parceiros];

    // Filtrar status
    if (filtrosLocal.status) {
      resultado = resultado.filter(p => p.status === filtrosLocal.status);
    }
    // Filtrar etapa
    if (filtrosLocal.etapaId) {
      resultado = resultado.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === filtrosLocal.etapaId));
    }
    // Filtrar subnível
    if (filtrosLocal.subnivelId) {
      resultado = resultado.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.subnivel_id === filtrosLocal.subnivelId));
    }
    // Filtro de parceiros sem etapa da jornada atribuída
    if (filtrosLocal.apenasSemEtapa) {
      resultado = resultado.filter(p => !associacoes.some(a => a.parceiro_id === p.id));
    }

    return resultado;
  }, [parceiros, associacoes, filtrosLocal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando mapa de parceiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"}
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              {!isMobile && "Voltar"}
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {isMobile ? "Mapa de Parceiros" : "Mapa Sequencial de Parceiros"}
              </h1>
              {!isMobile && (
                <p className="text-muted-foreground text-sm">
                  Gestão de parceiros por etapa da jornada do e-commerce
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {!isMobile && <DemoModeToggle />}
            <Button onClick={handleNovoParceiro} size={isMobile ? "sm" : "default"}>
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              {isMobile ? "Novo" : "Novo Parceiro"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {!isMobile && (
          <MapaParceirosSidebar
            etapas={etapas}
            subniveis={subniveis}
            filtros={filtrosLocal}
            stats={stats}
            onFiltrosChange={handleAtualizarFiltros}
            onEtapaClick={() => {}}
            etapaSelecionada={filtrosLocal.etapaId}
            expandedEtapas={expandedEtapas}
            onToggleEtapa={handleToggleEtapa}
            onLimparFiltros={handleLimparFiltros}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            <Tabs value={visualizacao} onValueChange={(value) => setVisualizacao(value as 'jornada' | 'grid')}>
              <div className="border-b border-border p-4">
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="jornada" className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    {!isMobile && "Jornada"}
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="flex items-center gap-2">
                    <Grid3X3 className="h-4 w-4" />
                    {!isMobile && "Grade"}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="jornada" className="p-4 sm:p-6">
                <JornadaVisualization
                  etapas={etapas}
                  subniveis={subniveis}
                  parceiros={parceirosFiltrados}
                  associacoes={associacoes}
                  expandedEtapas={expandedEtapas}
                  onToggleEtapa={handleToggleEtapa}
                  onParceiroClick={handleParceiroClick}
                />
              </TabsContent>

              <TabsContent value="grid" className="p-4 sm:p-6">
                <MapaParceirosTable
                  parceiros={parceirosFiltrados}
                  associacoes={associacoes}
                  etapas={etapas}
                  subniveis={subniveis}
                  onParceiroClick={handleParceiroClick}
                  onDeletarParceiro={handleDeletarParceiro}
                  filtros={filtrosLocal}
                  onFiltrosChange={handleAtualizarFiltros}
                  onLimparFiltros={handleLimparFiltros}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Painel de Detalhes */}
        {showDetalhes && parceiroSelecionado && (
          <ParceiroDetalhesSimplificado
            parceiro={parceiroSelecionado}
            etapas={etapas}
            subniveis={subniveis}
            associacoes={associacoes}
            onClose={() => {
              setShowDetalhes(false);
              setParceiroSelecionado(null);
            }}
            onSave={handleSalvarDetalhes}
            onAssociarEtapa={associarParceiroEtapa}
            onRemoverAssociacao={removerAssociacao}
          />
        )}
      </div>

      {/* Modais */}
      <EmpresaSelector
        isOpen={showEmpresaSelector}
        onClose={() => setShowEmpresaSelector(false)}
        onSave={handleSalvarEmpresaParceiro}
      />
    </div>
  );
};

export default MapaParceirosPage;
