import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  ArrowLeft,
  Route,
  Grid3X3,
  Users,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import MapaParceirosSidebar from '@/components/mapa-parceiros/MapaParceirosSidebar';
import EmpresaSelector from '@/components/mapa-parceiros/EmpresaSelector';
import JornadaVisualization from '@/components/mapa-parceiros/JornadaVisualization';
import MapaParceirosTable from '@/components/mapa-parceiros/MapaParceirosTable';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';
import { DemoModeToggle } from '@/components/privacy/DemoModeToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import ParceiroDetalhesSimplificado from '@/components/mapa-parceiros/ParceiroDetalhesSimplificado';
import { calcularScoreQuadrante } from '@/utils/parceiro-quadrante-score';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

const VIEW_MODES = [
  { label: 'Grid', value: 'grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { label: 'Lista', value: 'lista', icon: <Users className="h-4 w-4" /> }
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
    filtros,
    stats,
    setFiltros,
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao,
    carregarDados
  } = useMapaParceiros();

  // States
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroMapa | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'lista'>('grid');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParceiros>('nome');
  const [ordemAsc, setOrdemAsc] = useState<boolean>(true);
  const [buscaRapida, setBuscaRapida] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [etapaSelecionada, setEtapaSelecionada] = useState<string | undefined>(undefined);

  // Unificação lógica de filtros/ordenação, memoizada
  const parceirosFiltrados = useMemo(() => {
    let result = parceiros;
    const termo = buscaRapida.trim().toLowerCase();
    if (termo)
      result = result.filter(p =>
        (p.empresa?.nome || '').toLowerCase().includes(termo) ||
        (p.empresa?.tipo || '').toLowerCase().includes(termo) ||
        (p.empresa?.descricao || '').toLowerCase().includes(termo)
      );
    if (statusFiltro !== 'todos')
      result = result.filter(p => p.status === statusFiltro);
    if (etapaSelecionada)
      result = result.filter(p => associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === etapaSelecionada));
    return result;
  }, [parceiros, buscaRapida, statusFiltro, etapaSelecionada, associacoes]);

  // Ordenação memoizada
  const parceirosOrdenados = useMemo(() => {
    return [...parceirosFiltrados].sort((a, b) => {
      let resultado = 0;
      switch (ordenacao) {
        case 'nome':
          resultado = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
          break;
        case 'performance':
          resultado =
            calcularScoreQuadrante(a) - calcularScoreQuadrante(b);
          break;
        case 'criado_em':
          resultado = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return ordemAsc ? resultado : -resultado;
    });
  }, [parceirosFiltrados, ordenacao, ordemAsc]);

  // Parceiros por etapa
  const getParceirosEtapa = useCallback((etapaId: string) => {
    return parceiros.filter(p =>
      associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === etapaId)
    );
  }, [parceiros, associacoes]);

  // Etapa info
  const getEtapaInfo = useCallback((etapaId: string) => etapas.find(e => e.id === etapaId), [etapas]);

  // Handler de expansão do sidebar
  const handleToggleEtapa = (etapaId: string) => {
    setExpandedEtapas(prev => {
      const newExpanded = new Set(prev);
      newExpanded.has(etapaId) ? newExpanded.delete(etapaId) : newExpanded.add(etapaId);
      return newExpanded;
    });
  };

  // Handler de seleção de etapa
  const handleEtapaClick = (etapaId: string) => {
    setEtapaSelecionada(etapaId === etapaSelecionada ? undefined : etapaId);
    setFiltros({ ...filtros, etapa: etapaId === etapaSelecionada ? undefined : etapaId });
  };

  // Handler para abrir/fechar detalhes do parceiro
  const handleParceiroClick = (parceiro: ParceiroMapa) => {
    setParceiroSelecionado(parceiro);
    setShowDetalhes(true);
  };

  // Novo parceiro
  const handleNovoParceiro = () => setShowEmpresaSelector(true);

  // Salvar novo parceiro
  const handleSalvarEmpresaParceiro = async (dados: { empresa_id: string; status: string; performance_score: number | string; observacoes?: string }) => {
    await criarParceiro({ 
      empresa_id: dados.empresa_id, 
      status: dados.status as 'ativo' | 'inativo' | 'pendente', 
      performance_score: Number(dados.performance_score) || 0, 
      observacoes: dados.observacoes 
    });
    await carregarDados();
  };

  // Deletar parceiro
  const handleDeletarParceiro = async (parceiro: ParceiroMapa) => {
    if (window.confirm(`Tem certeza que deseja remover o parceiro "${parceiro.empresa?.nome}"?`)) {
      await deletarParceiro(parceiro.id);
      if (parceiroSelecionado?.id === parceiro.id) {
        setShowDetalhes(false);
        setParceiroSelecionado(null);
      }
      await carregarDados();
    }
  };

  // Salvar detalhes
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
      await carregarDados();
    }
  };

  // Navegação entre parceiros nos detalhes
  const handleNavegarParceiro = (sentido: 'prev' | 'next') => {
    if (!parceiroSelecionado) return;
    const idx = parceirosOrdenados.findIndex(p => p.id === parceiroSelecionado.id);
    const novoIdx = sentido === 'prev' ? idx - 1 : idx + 1;
    if (novoIdx >= 0 && novoIdx < parceirosOrdenados.length) {
      setParceiroSelecionado(parceirosOrdenados[novoIdx]);
    }
  };

  // Empty states e feedbacks
  const emptyStateContent = etapaSelecionada
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

  // Onboarding microcopy
  const onboardingText = (
    <div className="mb-4 text-sm text-muted-foreground">
      <b>Mapa Sequencial de Parceiros:</b> Visualize e gerencie seus parceiros por etapa da jornada do e-commerce. Identifique facilmente etapas carentes ou saturadas de parceiros e potencialize sua estratégia!
    </div>
  );

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
    <div className="h-screen flex flex-col" aria-label="Mapa Sequencial de Parceiros">
      <DemoModeIndicator />
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex-1 flex min-h-0" role="main">
        {/* Sidebar */}
        {!isMobile && (
          <MapaParceirosSidebar
            etapas={etapas}
            subniveis={subniveis}
            filtros={filtros}
            stats={stats}
            onFiltrosChange={setFiltros}
            onEtapaClick={handleEtapaClick}
            etapaSelecionada={etapaSelecionada}
            expandedEtapas={expandedEtapas}
            onToggleEtapa={handleToggleEtapa}
            onLimparFiltros={() => {
              setEtapaSelecionada(undefined);
              setStatusFiltro('todos');
              setBuscaRapida('');
            }}
          />
        )}

        {/* Main Body */}
        <div className="flex-1 flex flex-col min-w-0">
          {onboardingText}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex gap-2 items-center">
              <h2 className="text-xl font-semibold whitespace-nowrap mr-2">
                {etapaSelecionada ? getEtapaInfo(etapaSelecionada)?.nome : "Todos os Parceiros"}
              </h2>
              <Badge variant="secondary" className="mr-2">
                {parceirosOrdenados.length} {etapaSelecionada ? "parceiros nesta etapa" : "parceiros totais"}
              </Badge>
            </div>
            <div className="flex gap-2 items-center">
              {/* Busca rápida */}
              <Input
                placeholder="Buscar parceiro..."
                value={buscaRapida}
                onChange={e => setBuscaRapida(e.target.value)}
                className="max-w-[180px] sm:max-w-xs"
                size={isMobile ? "sm" : "default"}
                aria-label="Buscar parceiro"
              />
              {/* Filtro status */}
              <select
                value={statusFiltro}
                onChange={e => setStatusFiltro(e.target.value)}
                className="rounded-md border px-2 py-1 text-sm text-muted-foreground"
                aria-label="Filtrar por status"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              {/* Ordenação */}
              <div className="flex items-center gap-1">
                <select
                  value={ordenacao}
                  onChange={e => setOrdenacao(e.target.value as OrdenacaoParceiros)}
                  className="rounded-md border px-2 py-1 text-sm text-muted-foreground"
                  aria-label="Ordenar por"
                >
                  <option value="nome">Nome</option>
                  <option value="performance">Performance Quadrante</option>
                  <option value="criado_em">Data de Cadastro</option>
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
              {/* Visualização: Grid/Lista */}
              <Tabs value={viewMode} onValueChange={v => setViewMode(v as 'grid' | 'lista')}>
                <TabsList>
                  {VIEW_MODES.map(({ label, value, icon }) => (
                    <TabsTrigger value={value} key={value} aria-label={label}>
                      {icon}
                      <span className="ml-1 hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Listagem adaptativa dos parceiros */}
          <div className="flex-1 overflow-y-auto pb-2">
            {parceirosOrdenados.length > 0 ? (
              viewMode === 'grid' ? (
                <div
                  className={`
                    grid gap-2
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                  `}
                  aria-label="Grid de parceiros"
                >
                  {parceirosOrdenados.map((parceiro) => (
                    <ParceiroDetalhesSimplificado
                      key={parceiro.id}
                      parceiro={parceiro}
                      etapas={etapas}
                      subniveis={subniveis}
                      associacoes={associacoes}
                      onClose={() => setShowDetalhes(false)}
                      onSave={handleSalvarDetalhes}
                      onAssociarEtapa={associarParceiroEtapa}
                      onRemoverAssociacao={removerAssociacao}
                    />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border" aria-label="Lista de parceiros">
                  {parceirosOrdenados.map((parceiro) => (
                    <li key={parceiro.id}>
                      <ParceiroDetalhesSimplificado
                        parceiro={parceiro}
                        etapas={etapas}
                        subniveis={subniveis}
                        associacoes={associacoes}
                        onClose={() => setShowDetalhes(false)}
                        onSave={handleSalvarDetalhes}
                        onAssociarEtapa={associarParceiroEtapa}
                        onRemoverAssociacao={removerAssociacao}
                      />
                    </li>
                  ))}
                </ul>
              )
            ) : (
              emptyStateContent
            )}
          </div>
        </div>

        {/* Painel de Detalhes - compacto */}
        {showDetalhes && parceiroSelecionado && (
          <aside className="w-96 max-w-full bg-background border-l border-border h-full overflow-y-auto" aria-label="Detalhes do Parceiro">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{parceiroSelecionado.empresa?.nome || 'Empresa sem nome'}</h2>
                  <p className="text-xs text-muted-foreground capitalize">{parceiroSelecionado.empresa?.tipo}</p>
                  <p className="text-xs text-muted-foreground">{parceiroSelecionado.empresa?.descricao}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowDetalhes(false)} aria-label="Fechar">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <span className="font-medium mr-2">Status:</span>
                <Badge variant="secondary">{parceiroSelecionado.status}</Badge>
                <span className="ml-4 font-medium">Performance Quadrante:</span>
                <span className="ml-1 font-bold text-green-600">{calcularScoreQuadrante(parceiroSelecionado)}</span>
              </div>
              <div>
                <span className="font-medium">Associações:</span>
                <ul className="list-disc pl-5">
                  {associacoes.filter(a => a.parceiro_id === parceiroSelecionado.id).map(a => {
                    const etapa = etapas.find(e => e.id === a.etapa_id);
                    const subnivel = subniveis.find(s => s.id === a.subnivel_id);
                    return (
                      <li key={a.id}>
                        {etapa?.nome}{subnivel ? ` > ${subnivel.nome}` : ""}
                        <Button variant="link" size="xs" className="ml-2" onClick={() => removerAssociacao(a.id)}>
                          Remover
                        </Button>
                      </li>
                    );
                  })}
                  {associacoes.filter(a => a.parceiro_id === parceiroSelecionado.id).length === 0 && (
                    <li className="text-muted-foreground">Nenhuma associação</li>
                  )}
                </ul>
              </div>
              <div>
                <span className="font-medium">Observações:</span>
                <p className="text-sm">{parceiroSelecionado.observacoes || <span className="text-muted-foreground">Sem observações</span>}</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => handleNavegarParceiro('prev')} aria-label="Parceiro anterior">
                  {"<"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleNavegarParceiro('next')} aria-label="Próximo parceiro">
                  {">"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeletarParceiro(parceiroSelecionado)} aria-label="Remover parceiro">
                  Remover
                </Button>
                <Button variant="primary" size="sm" onClick={() => handleSalvarDetalhes({})} aria-label="Salvar alterações">
                  Salvar
                </Button>
              </div>
            </div>
          </aside>
        )}

        {/* Modal de empresas */}
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