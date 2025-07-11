// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  // Search, // Comentado se não usado diretamente ou para simplificar
  Grid3X3,
  List,
  // Filter, // Comentado se não usado diretamente ou para simplificar
  Users,
  ArrowLeft,
  Route, // Mantido da branch 'main' para a visualização de Jornada
  // SortAsc, // Será importado de lucide-react se necessário
  // SortDesc // Será importado de lucide-react se necessário
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import MapaParceirosSidebar from '@/components/mapa-parceiros/MapaParceirosSidebar';
import ParceiroCard from '@/components/mapa-parceiros/ParceiroCard'; // Priorizando ParceiroCard
import EmpresaSelector from '@/components/mapa-parceiros/EmpresaSelector';
import JornadaVisualization from '@/components/mapa-parceiros/JornadaVisualization'; // Mantido
import MapaParceirosTable from '@/components/mapa-parceiros/MapaParceirosTable';     // Mantido
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';
import { DemoModeToggle } from '@/components/privacy/DemoModeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import ParceiroDetalhesSimplificado from '@/components/mapa-parceiros/ParceiroDetalhesSimplificado'; // Mantido
// import { calcularScoreQuadrante } from '@/utils/parceiro-quadrante-score'; // Comentado - ARQUIVO AUSENTE

// Ícones para ordenação (se forem usados, descomentar e importar)
// import { SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Adicionado para busca rápida
import { Badge } from '@/components/ui/badge'; // Adicionado para badges

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

const VIEW_MODES = [
  { label: 'Grid', value: 'grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { label: 'Lista', value: 'lista', icon: <List className="h-4 w-4" /> }
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
    // filtros, // Será usado filtrosLocal da branch 'main' e sincronizado com setFiltros do hook
    stats,
    setFiltros, // do hook useMapaParceiros
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao,
    carregarDados // da branch MapadeParceiros
  } = useMapaParceiros();

  // States da branch MapadeParceiros (priorizados e adaptados)
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroMapa | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);

  // View mode e ordenação da branch MapadeParceiros
  const [viewMode, setViewMode] = useState<'jornada' | 'grid' | 'lista'>('jornada'); // Adicionado 'jornada'
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParceiros>('nome');
  const [ordemAsc, setOrdemAsc] = useState<boolean>(true);

  // Filtros locais (combinação das duas branches)
  const [filtrosLocal, setFiltrosLocal] = useState<MapaParceirosFiltros & { etapaSelecionada?: string }>({
    busca: '', // Da branch 'main' (filtrosLocal.busca) e MapadeParceiros (buscaRapida)
    status: 'todos', // Da branch MapadeParceiros (statusFiltro), adaptado para MapaParceirosFiltros
    etapaId: '',
    subnivelId: '',
    apenasSemEtapa: false,
    etapaSelecionada: undefined, // Da branch MapadeParceiros
  });

  // Função para limpar todos os filtros (adaptada)
  const handleLimparFiltros = () => {
    const filtrosVazios: MapaParceirosFiltros & { etapaSelecionada?: string } = {
      busca: '',
      status: 'todos',
      etapaId: '',
      subnivelId: '',
      apenasSemEtapa: false,
      etapaSelecionada: undefined,
    };
    setFiltrosLocal(filtrosVazios);
    setFiltros(filtrosVazios); // Sincroniza com o hook
    if (carregarDados) carregarDados(filtrosVazios); // Recarrega dados se necessário
  };

  // Função para atualizar filtros (adaptada)
  const handleAtualizarFiltros = (atualizacoes: Partial<MapaParceirosFiltros & { etapaSelecionada?: string }>) => {
    const novosFiltros = { ...filtrosLocal, ...atualizacoes };
    setFiltrosLocal(novosFiltros);
    setFiltros(novosFiltros); // Sincroniza com o hook
    if (carregarDados) carregarDados(novosFiltros); // Recarrega dados
  };

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAtualizarFiltros({ busca: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleAtualizarFiltros({ status: e.target.value === 'todos' ? undefined : e.target.value });
  };


  // Unificação lógica de filtros/ordenação, memoizada
  const parceirosFiltrados = useMemo(() => {
    let result = [...parceiros]; // Começa com todos os parceiros do hook
    const termoBusca = filtrosLocal.busca?.trim().toLowerCase();

    if (termoBusca) {
      result = result.filter(p =>
        (p.empresa?.nome || '').toLowerCase().includes(termoBusca) ||
        (p.empresa?.tipo || '').toLowerCase().includes(termoBusca) ||
        (p.empresa?.descricao || '').toLowerCase().includes(termoBusca)
      );
    }
    if (filtrosLocal.status && filtrosLocal.status !== 'todos') {
      result = result.filter(p => p.status === filtrosLocal.status);
    }
    if (filtrosLocal.etapaId) { // Filtro de etapa da sidebar (Jornada ou Grade)
        result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === filtrosLocal.etapaId));
    }
    if (filtrosLocal.subnivelId) { // Filtro de subnível da sidebar (Jornada ou Grade)
        result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.subnivel_id === filtrosLocal.subnivelId));
    }
    if (filtrosLocal.apenasSemEtapa) {
        result = result.filter(p => !associacoes.some(a => a.parceiro_id === p.id && (a.etapa_id || a.subnivel_id)));
    }
    // Filtro de etapaSelecionada (do header da visualização de Grid/Lista da branch MapadeParceiros)
    if (filtrosLocal.etapaSelecionada) {
         result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === filtrosLocal.etapaSelecionada));
    }

    return result;
  }, [parceiros, associacoes, filtrosLocal]);

  // Ordenação memoizada
  const parceirosOrdenados = useMemo(() => {
    return [...parceirosFiltrados].sort((a, b) => {
      let resultado = 0;
      switch (ordenacao) {
        case 'nome':
          resultado = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
          break;
        case 'performance':
          // resultado = calcularScoreQuadrante(a) - calcularScoreQuadrante(b); // Comentado
          resultado = (a.performance_score || 0) - (b.performance_score || 0); // Usando performance_score direto
          break;
        case 'criado_em':
          resultado = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return ordemAsc ? resultado : -resultado;
    });
  }, [parceirosFiltrados, ordenacao, ordemAsc]);

  const getEtapaInfo = useCallback((etapaId: string) => etapas.find(e => e.id === etapaId), [etapas]);

  const handleToggleEtapaSidebar = (etapaId: string) => { // Renomeado para evitar conflito
    const newExpanded = new Set(expandedEtapas);
    if (newExpanded.has(etapaId)) {
      newExpanded.delete(etapaId);
    } else {
      newExpanded.add(etapaId);
    }
    setExpandedEtapas(newExpanded);
  };

  // Handler de seleção de etapa (para o filtro principal, usado no header do grid/lista)
  const handleEtapaHeaderClick = (etapaId: string) => {
    const novaEtapaSelecionada = etapaId === filtrosLocal.etapaSelecionada ? undefined : etapaId;
    handleAtualizarFiltros({ etapaSelecionada: novaEtapaSelecionada, etapaId: undefined, subnivelId: undefined }); // Limpa outros filtros de etapa/subnível
  };


  const handleParceiroClick = (parceiro: ParceiroMapa) => {
    setParceiroSelecionado(parceiro);
    setShowDetalhes(true);
  };

  const handleNovoParceiro = () => setShowEmpresaSelector(true);

  const handleSalvarEmpresaParceiro = async (dados: { 
    empresa_id: string; 
    status: string; 
    performance_score: number | string; // Aceita string ou number
    observacoes?: string 
  }) => {
    const dadosFormatados = {
      empresa_id: dados.empresa_id,
      status: dados.status as 'ativo' | 'inativo' | 'pendente',
      performance_score: Number(dados.performance_score) || 0, // Garante que seja number
      observacoes: dados.observacoes
    };
    await criarParceiro(dadosFormatados);
    if (carregarDados) await carregarDados(filtrosLocal); // Recarrega dados
  };

  const handleDeletarParceiro = async (parceiro: ParceiroMapa) => {
    if (window.confirm(`Tem certeza que deseja remover o parceiro "${parceiro.empresa?.nome}"?`)) {
      await deletarParceiro(parceiro.id);
      if (parceiroSelecionado?.id === parceiro.id) {
        setShowDetalhes(false);
        setParceiroSelecionado(null);
      }
      if (carregarDados) await carregarDados(filtrosLocal); // Recarrega dados
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
      setParceiroSelecionado(prev => prev ? {
        ...prev,
        ...dadosFormatados,
        performance_score: Number(dadosFormatados.performance_score) || 0
      } : null);
      if (carregarDados) await carregarDados(filtrosLocal); // Recarrega dados
    }
  };

  const handleNavegarParceiro = (sentido: 'prev' | 'next') => {
    if (!parceiroSelecionado) return;
    const idx = parceirosOrdenados.findIndex(p => p.id === parceiroSelecionado.id);
    const novoIdx = sentido === 'prev' ? idx - 1 : idx + 1;
    if (novoIdx >= 0 && novoIdx < parceirosOrdenados.length) {
      setParceiroSelecionado(parceirosOrdenados[novoIdx]);
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

  const emptyStateContent = filtrosLocal.etapaSelecionada
    ? null
    : null;

  const onboardingText = null;


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
            filtros={filtrosLocal} // Passa filtrosLocal unificado
            stats={stats}
            onFiltrosChange={handleAtualizarFiltros} // Usa a função unificada
            onEtapaClick={(etapaId) => handleAtualizarFiltros({ etapaId: filtrosLocal.etapaId === etapaId ? undefined : etapaId, subnivelId: undefined, etapaSelecionada: undefined })}
            etapaSelecionada={filtrosLocal.etapaId} // Para destacar na sidebar
            expandedEtapas={expandedEtapas}
            onToggleEtapa={handleToggleEtapaSidebar}
            onLimparFiltros={handleLimparFiltros}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 p-4 space-y-4">
            {/* Header da área de conteúdo com Tabs de visualização */}
            <div className="flex items-center justify-between">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'jornada' | 'grid' | 'lista')}>
                    <TabsList>
                        <TabsTrigger value="jornada" className="flex items-center gap-2">
                            <Route className="h-4 w-4" /> {!isMobile && "Jornada"}
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="flex items-center gap-2">
                            <Grid3X3 className="h-4 w-4" /> {!isMobile && "Grid"}
                        </TabsTrigger>
                        <TabsTrigger value="lista" className="flex items-center gap-2">
                            <List className="h-4 w-4" /> {!isMobile && "Lista"}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                {/* Controles de busca e filtro (somente para grid/lista) */}
                {(viewMode === 'grid' || viewMode === 'lista') && (
                    <div className="flex gap-2 items-center">
                        <Input
                            placeholder="Buscar parceiro..."
                            value={filtrosLocal.busca}
                            onChange={handleBuscaChange}
                            className="max-w-[180px] sm:max-w-xs"
                            aria-label="Buscar parceiro"
                        />
                        <select
                            value={filtrosLocal.status || 'todos'}
                            onChange={handleStatusChange}
                            className="rounded-md border px-2 py-1 text-sm text-muted-foreground bg-background h-10"
                            aria-label="Filtrar por status"
                        >
                            <option value="todos">Status (Todos)</option>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                            <option value="pendente">Pendente</option>
                        </select>
                        {/* Ordenação pode ser adicionada aqui se necessário para grid/lista */}
                    </div>
                )}
            </div>

            {/* Conteúdo principal baseado na viewMode */}
            <div className="flex-1 overflow-y-auto">
                {viewMode === 'jornada' && (
                    <JornadaVisualization
                        etapas={etapas}
                        subniveis={subniveis}
                        parceiros={parceirosFiltrados} // Usa parceiros já filtrados pelos filtros globais
                        associacoes={associacoes}
                        expandedEtapas={expandedEtapas}
                        onToggleEtapa={handleToggleEtapaSidebar}
                        onParceiroClick={handleParceiroClick}
                    />
                )}
                {(viewMode === 'grid' || viewMode === 'lista') && (
                    <>
                        {/* Seletor de Etapa para Grid/Lista */}
                        <div className="mb-4">
                            <label htmlFor="etapa-selector-header" className="text-sm font-medium mr-2">Filtrar por Etapa Principal:</label>
                            <select
                                id="etapa-selector-header"
                                value={filtrosLocal.etapaSelecionada || ''}
                                onChange={(e) => handleEtapaHeaderClick(e.target.value || '')}
                                className="rounded-md border px-2 py-1 text-sm text-muted-foreground bg-background h-10"
                            >
                                <option value="">Todas as Etapas</option>
                                {etapas.map(etapa => (
                                    <option key={etapa.id} value={etapa.id}>{etapa.nome}</option>
                                ))}
                            </select>
                        </div>

                        {parceirosOrdenados.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {parceirosOrdenados.map((parceiro) => (
                                        <ParceiroCard
                                            key={parceiro.id}
                                            parceiro={parceiro}
                                            onClick={() => handleParceiroClick(parceiro)}
                                            // onDelete={() => handleDeletarParceiro(parceiro)} // Ações podem estar no detalhe
                                            // quadranteScore={calcularScoreQuadrante(parceiro)} // Comentado
                                        />
                                    ))}
                                </div>
                            ) : ( // viewMode === 'lista'
                                <div className="space-y-2">
                                    {parceirosOrdenados.map((parceiro) => (
                                         <ParceiroCard
                                            key={parceiro.id}
                                            parceiro={parceiro}
                                            onClick={() => handleParceiroClick(parceiro)}
                                            isListItemStyle // Adicionar prop para estilo de lista se necessário
                                            // quadranteScore={calcularScoreQuadrante(parceiro)} // Comentado
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                             <div className="text-center py-10">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Nenhum parceiro encontrado</h3>
                                <p className="text-muted-foreground mb-4">
                                  Ajuste os filtros ou adicione novos parceiros.
                                </p>
                                <Button onClick={handleNovoParceiro}>
                                  <Plus className="h-4 w-4 mr-2" />
                                  Adicionar Parceiro
                                </Button>
                              </div>
                        )}
                    </>
                )}
                 {viewMode === 'table_legacy' && ( // Mantendo a tabela antiga se necessário, mas oculta por padrão
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
            onRemoverAssociacao={async (assocId) => { await removerAssociacao(assocId); if(carregarDados) carregarDados(filtrosLocal);}}
            onNavigate={handleNavegarParceiro} // Para os botões < > nos detalhes
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
