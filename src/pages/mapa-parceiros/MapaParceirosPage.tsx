// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Grid3X3, // Usado em VIEW_MODES e TabsTrigger
  List,    // Usado em VIEW_MODES e TabsTrigger
  Users,   // Usado em emptyStateContent
  ArrowLeft,
  Route,   // Usado em TabsTrigger
  SortAsc, // Usado em Button de ordenação
  SortDesc // Usado em Button de ordenação
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import MapaParceirosSidebar from '@/components/mapa-parceiros/MapaParceirosSidebar';
// import ParceiroCard from '@/components/mapa-parceiros/ParceiroCard'; // Comentado por enquanto, main usa DetalhesSimplificado para cards
import EmpresaSelector from '@/components/mapa-parceiros/EmpresaSelector';
import JornadaVisualization from '@/components/mapa-parceiros/JornadaVisualization';
import MapaParceirosTable from '@/components/mapa-parceiros/MapaParceirosTable';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';
import { DemoModeToggle } from '@/components/privacy/DemoModeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import ParceiroDetalhesSimplificado from '@/components/mapa-parceiros/ParceiroDetalhesSimplificado';
// import { calcularScoreQuadrante } from '@/utils/parceiro-quadrante-score'; // Comentado - ARQUIVO AUSENTE
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

// VIEW_MODES combinados - Adicionando Jornada
const TAB_VIEWS = [
  { label: 'Jornada', value: 'jornada', icon: <Route className="h-4 w-4" /> },
  { label: 'Grid', value: 'grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { label: 'Lista', value: 'lista', icon: <List className="h-4 w-4" /> },
  // { label: 'Tabela Legada', value: 'table_legacy', icon: <List className="h-4 w-4" /> }, // Opcional
];


const MapaParceirosPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    etapas,
    subniveis,
    parceiros,
    associacoes,
    loading,
    stats,
    setFiltros: setHookFiltros, // Renomeado para clareza, vem do Hook e espera MapaParceirosFiltros
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao,
    carregarDados
  } = useMapaParceiros();

  // Estados para a Sidebar e visualização de Jornada/Tabela (da antiga 'fix/mapa-parceiros-filtros-inconsistentes')
  const [filtrosSidebar, setFiltrosSidebar] = useState<MapaParceirosFiltros>({
    busca: '',
    status: '', // Usar string vazia para 'todos'
    etapaId: '',
    subnivelId: '',
    apenasSemEtapa: false,
  });

  // Estados para Grid/Lista (da 'main')
  const [viewModeGridLista, setViewModeGridLista] = useState<'grid' | 'lista'>('grid');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParceiros>('nome');
  const [ordemAsc, setOrdemAsc] = useState<boolean>(true);
  const [buscaRapida, setBuscaRapida] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos'); // 'todos', 'ativo', 'inativo', 'pendente'
  const [etapaSelecionadaHeader, setEtapaSelecionadaHeader] = useState<string | undefined>(undefined); // Para filtro no header do grid/lista

  // Estado unificado para a aba de visualização principal
  const [currentViewTab, setCurrentViewTab] = useState<'jornada' | 'grid' | 'lista' | 'table_legacy'>('jornada');

  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroMapa | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);

  // Handler para atualizar filtros da Sidebar e notificar o hook
  const handleAtualizarFiltrosSidebar = (novosFiltrosSidebar: Partial<MapaParceirosFiltros>) => {
    const mergedFiltros = { ...filtrosSidebar, ...novosFiltrosSidebar };
    setFiltrosSidebar(mergedFiltros);
    setHookFiltros(mergedFiltros); // Atualiza o hook com os filtros da sidebar
    // Não chamamos carregarDados aqui, pois o hook deve reagir a setHookFiltros
  };
  
  const handleLimparFiltrosSidebar = () => {
    const resetedFilters: MapaParceirosFiltros = {
      busca: '', status: '', etapaId: '', subnivelId: '', apenasSemEtapa: false
    };
    setFiltrosSidebar(resetedFilters);
    setHookFiltros(resetedFilters);
  };

  // Memo para parceiros filtrados (baseado na view atual)
  const parceirosFiltradosParaView = useMemo(() => {
    let result = [...parceiros];

    if (currentViewTab === 'jornada' || currentViewTab === 'table_legacy') {
      // Aplicar filtros da Sidebar (filtrosSidebar)
      if (filtrosSidebar.busca) {
        const termo = filtrosSidebar.busca.toLowerCase();
        result = result.filter(p => (p.empresa?.nome || '').toLowerCase().includes(termo));
      }
      if (filtrosSidebar.status) {
        result = result.filter(p => p.status === filtrosSidebar.status);
      }
      if (filtrosSidebar.etapaId) {
        result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === filtrosSidebar.etapaId));
      }
      if (filtrosSidebar.subnivelId) {
        result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.subnivel_id === filtrosSidebar.subnivelId));
      }
      if (filtrosSidebar.apenasSemEtapa) {
        result = result.filter(p => !associacoes.some(a => a.parceiro_id === p.id && (a.etapa_id || a.subnivel_id)));
      }
    } else { // Grid ou Lista
      // Aplicar filtros do Header (buscaRapida, statusFiltro, etapaSelecionadaHeader)
      const termo = buscaRapida.trim().toLowerCase();
      if (termo) {
        result = result.filter(p =>
          (p.empresa?.nome || '').toLowerCase().includes(termo) ||
          (p.empresa?.tipo || '').toLowerCase().includes(termo) ||
          (p.empresa?.descricao || '').toLowerCase().includes(termo)
        );
      }
      if (statusFiltro !== 'todos') {
        result = result.filter(p => p.status === statusFiltro);
      }
      if (etapaSelecionadaHeader) {
        result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === etapaSelecionadaHeader));
      }
    }
    return result;
  }, [parceiros, associacoes, currentViewTab, filtrosSidebar, buscaRapida, statusFiltro, etapaSelecionadaHeader]);

  // Ordenação para Grid/Lista
  const parceirosOrdenadosParaGridLista = useMemo(() => {
    // Só ordenar se a view for grid ou lista
    if (currentViewTab !== 'grid' && currentViewTab !== 'lista') return parceirosFiltradosParaView;

    return [...parceirosFiltradosParaView].sort((a, b) => {
      let comparacao = 0;
      switch (ordenacao) {
        case 'nome':
          comparacao = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
          break;
        case 'performance':
          // comparacao = calcularScoreQuadrante(a) - calcularScoreQuadrante(b); // Comentado
          comparacao = (a.performance_score || 0) - (b.performance_score || 0);
          break;
        case 'criado_em':
          comparacao = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return ordemAsc ? comparacao : -comparacao;
    });
  }, [parceirosFiltradosParaView, ordenacao, ordemAsc, currentViewTab]);


  const getEtapaInfo = useCallback((etapaId: string) => etapas.find(e => e.id === etapaId), [etapas]);

  const handleToggleEtapaExpansao = (etapaId: string) => { // Para expandir/colapsar na Jornada ou Sidebar
    setExpandedEtapas(prev => {
      const newExpanded = new Set(prev);
      newExpanded.has(etapaId) ? newExpanded.delete(etapaId) : newExpanded.add(etapaId);
      return newExpanded;
    });
  };
  
  const handleEtapaClickSidebar = (etapaId: string) => {
    handleAtualizarFiltrosSidebar({ 
      etapaId: filtrosSidebar.etapaId === etapaId ? '' : etapaId, 
      subnivelId: '' // Limpa subnível ao clicar em etapa
    });
  };
  
  const handleParceiroClick = (parceiro: ParceiroMapa) => {
    setParceiroSelecionado(parceiro);
    setShowDetalhes(true);
  };

  const handleNovoParceiro = () => setShowEmpresaSelector(true);

  const handleSalvarEmpresaParceiro = async (dados: { 
    empresa_id: string; 
    status: string; 
    performance_score: number | string; 
    observacoes?: string 
  }) => {
    await criarParceiro({ 
      empresa_id: dados.empresa_id, 
      status: dados.status as 'ativo' | 'inativo' | 'pendente', 
      performance_score: Number(dados.performance_score) || 0, 
      observacoes: dados.observacoes 
    });
    if (carregarDados) await carregarDados();
  };

  const handleDeletarParceiro = async (parceiro: ParceiroMapa) => {
    if (window.confirm(`Tem certeza que deseja remover o parceiro "${parceiro.empresa?.nome}"?`)) {
      await deletarParceiro(parceiro.id);
      if (parceiroSelecionado?.id === parceiro.id) {
        setShowDetalhes(false);
        setParceiroSelecionado(null);
      }
      if (carregarDados) await carregarDados();
    }
  };

  const handleSalvarDetalhes = async (dados: Partial<ParceiroMapa>) => {
    if (parceiroSelecionado) {
      const dadosFormatados = {
        ...dados,
        ...(dados.performance_score !== undefined && {
          performance_score: Number(dados.performance_score) || 0
        })
      };
      await atualizarParceiro(parceiroSelecionado.id, dadosFormatados);
      setParceiroSelecionado(prev => prev ? ({ 
        ...prev, 
        ...dadosFormatados,
        performance_score: Number(dadosFormatados.performance_score) || 0
      }) : null);
      if (carregarDados) await carregarDados();
    }
  };
  
  const handleNavegarParceiro = (sentido: 'prev' | 'next') => {
    if (!parceiroSelecionado) return;
    // Usar parceirosOrdenadosParaGridLista se em grid/lista, senão parceirosFiltradosParaView
    const listaAtual = (currentViewTab === 'grid' || currentViewTab === 'lista') ? parceirosOrdenadosParaGridLista : parceirosFiltradosParaView;
    const idx = listaAtual.findIndex(p => p.id === parceiroSelecionado.id);
    const novoIdx = sentido === 'prev' ? idx - 1 : idx + 1;
    if (novoIdx >= 0 && novoIdx < listaAtual.length) {
      setParceiroSelecionado(listaAtual[novoIdx]);
    }
  };

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

  // Conteúdo do empty state e onboarding da branch 'main'
  const emptyStateContent = etapaSelecionadaHeader
    ? (
      <div className="text-center py-10">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum parceiro nesta etapa</h3>
        <p className="text-muted-foreground mb-4">
          Esta etapa ainda não possui parceiros associados.<br />Adicione parceiros ou associe-os a etapas!
        </p>
        <Button onClick={handleNovoParceiro}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Parceiro
        </Button>
      </div>
    )
    : (
      <div className="text-center py-10">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum parceiro cadastrado</h3>
        <p className="text-muted-foreground mb-4">
          Comece adicionando seus primeiros parceiros ao mapa sequencial
        </p>
        <Button onClick={handleNovoParceiro}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Primeiro Parceiro
        </Button>
      </div>
    );

  const onboardingText = (
    <div className="mb-4 text-sm text-muted-foreground">
      <b>Mapa Sequencial de Parceiros:</b> Visualize e gerencie seus parceiros por etapa da jornada do e-commerce. Identifique facilmente etapas carentes ou saturadas de parceiros e potencialize sua estratégia!
    </div>
  );

  return (
    <div className="h-screen flex flex-col" aria-label="Mapa Sequencial de Parceiros">
      <DemoModeIndicator />
      <header className="flex-shrink-0 border-b border-border bg-background" role="banner">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={() => navigate('/')}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              {!isMobile && "Voltar"}
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate" tabIndex={0}>
                {isMobile ? "Mapa de Parceiros" : "Mapa Sequencial de Parceiros"}
              </h1>
              {!isMobile && (
                <p className="text-muted-foreground text-sm">
                  Gestão visual dos parceiros por etapa da jornada do e-commerce
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {!isMobile && <DemoModeToggle />}
            <Button onClick={handleNovoParceiro} size={isMobile ? "sm" : "default"} aria-label="Novo Parceiro">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              {isMobile ? "Novo" : "Novo Parceiro"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex min-h-0" role="main">
        {!isMobile && (
          <MapaParceirosSidebar
            etapas={etapas}
            subniveis={subniveis}
            filtros={filtrosSidebar}
            stats={stats}
            onFiltrosChange={handleAtualizarFiltrosSidebar}
            onEtapaClick={handleEtapaClickSidebar} // Para filtro da sidebar
            etapaSelecionada={filtrosSidebar.etapaId}
            expandedEtapas={expandedEtapas}
            onToggleEtapa={handleToggleEtapaExpansao} // Para expandir/colapsar na sidebar
            onLimparFiltros={handleLimparFiltrosSidebar}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 p-4">
          {/* Header da área de conteúdo com Tabs de visualização */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <Tabs value={currentViewTab} onValueChange={(v) => setCurrentViewTab(v as any)}>
              <TabsList>
                {TAB_VIEWS.map(view => (
                  <TabsTrigger key={view.value} value={view.value} className="flex items-center gap-2">
                    {view.icon} {!isMobile && view.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            
            {/* Controles de busca e filtro (somente para grid/lista) */}
            {(currentViewTab === 'grid' || currentViewTab === 'lista') && (
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Buscar parceiro..."
                  value={buscaRapida}
                  onChange={e => setBuscaRapida(e.target.value)}
                  className="h-9 max-w-[150px] sm:max-w-xs"
                  aria-label="Buscar parceiro"
                />
                <select
                  value={statusFiltro}
                  onChange={e => setStatusFiltro(e.target.value)}
                  className="h-9 rounded-md border px-2 py-1 text-sm text-muted-foreground bg-background"
                  aria-label="Filtrar por status"
                >
                  <option value="todos">Status (Todos)</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="pendente">Pendente</option>
                </select>
                <select
                  value={etapaSelecionadaHeader || ''}
                  onChange={e => setEtapaSelecionadaHeader(e.target.value || undefined)}
                  className="h-9 rounded-md border px-2 py-1 text-sm text-muted-foreground bg-background"
                  aria-label="Filtrar por Etapa"
                >
                  <option value="">Etapa (Todas)</option>
                  {etapas.map(etapa => (
                    <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <select
                    value={ordenacao}
                    onChange={e => setOrdenacao(e.target.value as OrdenacaoParceiros)}
                    className="h-9 rounded-md border px-2 py-1 text-sm text-muted-foreground bg-background"
                    aria-label="Ordenar por"
                  >
                    <option value="nome">Nome</option>
                    <option value="performance">Performance</option>
                    <option value="criado_em">Data Cadastro</option>
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setOrdemAsc(v => !v)}
                    aria-label="Alternar ordem"
                  >
                    {ordemAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {currentViewTab !== 'jornada' && currentViewTab !== 'table_legacy' && onboardingText}
          
          {/* Conteúdo principal baseado na viewMode */}
          <div className="flex-1 overflow-y-auto">
            {currentViewTab === 'jornada' && (
              <JornadaVisualization
                etapas={etapas}
                subniveis={subniveis}
                parceiros={parceirosFiltradosParaView}
                associacoes={associacoes}
                expandedEtapas={expandedEtapas}
                onToggleEtapa={handleToggleEtapaExpansao} // Para expandir/colapsar na jornada
                onParceiroClick={handleParceiroClick}
              />
            )}
            {(currentViewTab === 'grid' || currentViewTab === 'lista') && (
              parceirosOrdenadosParaGridLista.length > 0 ? (
                currentViewTab === 'grid' ? (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {parceirosOrdenadosParaGridLista.map((parceiro) => (
                       <ParceiroDetalhesSimplificado // Usando ParceiroDetalhesSimplificado como na main para os cards
                        key={parceiro.id}
                        parceiro={parceiro}
                        etapas={etapas}
                        subniveis={subniveis}
                        associacoes={associacoes}
                        onClose={() => {setShowDetalhes(false); setParceiroSelecionado(null);}}
                        onSave={handleSalvarDetalhes}
                        onAssociarEtapa={associarParceiroEtapa}
                        onRemoverAssociacao={removerAssociacao}
                        isCardMode // Adicionar uma prop para estilizar como card
                        onClick={() => handleParceiroClick(parceiro)}
                      />
                    ))}
                  </div>
                ) : ( // viewMode === 'lista'
                  <div className="space-y-2">
                    {parceirosOrdenadosParaGridLista.map((parceiro) => (
                       <ParceiroDetalhesSimplificado // Usando ParceiroDetalhesSimplificado
                        key={parceiro.id}
                        parceiro={parceiro}
                        etapas={etapas}
                        subniveis={subniveis}
                        associacoes={associacoes}
                        onClose={() => {setShowDetalhes(false); setParceiroSelecionado(null);}}
                        onSave={handleSalvarDetalhes}
                        onAssociarEtapa={associarParceiroEtapa}
                        onRemoverAssociacao={removerAssociacao}
                        isListItemMode // Adicionar uma prop para estilizar como item de lista
                        onClick={() => handleParceiroClick(parceiro)}
                      />
                    ))}
                  </div>
                )
              ) : (
                emptyStateContent
              )
            )}
            {currentViewTab === 'table_legacy' && (
              <MapaParceirosTable
                parceiros={parceirosFiltradosParaView}
                associacoes={associacoes}
                etapas={etapas}
                subniveis={subniveis}
                onParceiroClick={handleParceiroClick}
                onDeletarParceiro={handleDeletarParceiro}
                filtros={filtrosSidebar} // Tabela usa filtros da sidebar
                onFiltrosChange={handleAtualizarFiltrosSidebar}
                onLimparFiltros={handleLimparFiltrosSidebar}
              />
            )}
          </div>
        </div>

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
            onRemoverAssociacao={async (assocId) => { await removerAssociacao(assocId); if (carregarDados) await carregarDados();}}
            onNavigate={handleNavegarParceiro}
          />
        )}

        <EmpresaSelector
          isOpen={showEmpresaSelector}
          onClose={() => setShowEmpresaSelector(false)}
          onSave={handleSalvarEmpresaParceiro}
        />
      </div>
    </div>
  );
};

export default MapaParceirosPage;
