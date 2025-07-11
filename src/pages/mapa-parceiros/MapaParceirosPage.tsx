
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Users,
  ArrowLeft,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMapaParceiros } from '@/hooks/useMapaParceiros';
import MapaParceirosSidebar from '@/components/mapa-parceiros/MapaParceirosSidebar';
import ParceiroCard from '@/components/mapa-parceiros/ParceiroCard';
import ParceiroDetalhesSimplificado from '@/components/mapa-parceiros/ParceiroDetalhesSimplificado';
import EmpresaSelector from '@/components/mapa-parceiros/EmpresaSelector';
import { ParceiroMapa } from '@/types/mapa-parceiros';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';
import { DemoModeToggle } from '@/components/privacy/DemoModeToggle';
import { useIsMobile } from '@/hooks/use-mobile';

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

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
  const [etapaSelecionada, setEtapaSelecionada] = useState<string>();
  const [parceiroSelecionado, setParceiroSelecionado] = useState<ParceiroMapa | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [showEmpresaSelector, setShowEmpresaSelector] = useState(false);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParceiros>('nome');
  const [ordemAsc, setOrdemAsc] = useState<boolean>(true);
  const [buscaRapida, setBuscaRapida] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const handleToggleEtapa = (etapaId: string) => {
    const newExpanded = new Set(expandedEtapas);
    if (newExpanded.has(etapaId)) {
      newExpanded.delete(etapaId);
    } else {
      newExpanded.add(etapaId);
    }
    setExpandedEtapas(newExpanded);
  };

  const handleEtapaClick = (etapaId: string) => {
    setEtapaSelecionada(etapaId === etapaSelecionada ? undefined : etapaId);
    setFiltros({ ...filtros, etapa: etapaId === etapaSelecionada ? undefined : etapaId });
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
    // Ensure performance_score is always a number
    const dadosFormatados = {
      empresa_id: dados.empresa_id,
      status: dados.status as 'ativo' | 'inativo' | 'pendente',
      performance_score: typeof dados.performance_score === 'string' 
        ? Number(dados.performance_score) 
        : dados.performance_score,
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
      // Ensure performance_score is converted to number if it exists
      const dadosFormatados = {
        ...dados,
        ...(dados.performance_score !== undefined && {
          performance_score: typeof dados.performance_score === 'string'
            ? Number(dados.performance_score)
            : dados.performance_score
        })
      };
      
      await atualizarParceiro(parceiroSelecionado.id, dadosFormatados);
      setParceiroSelecionado({ ...parceiroSelecionado, ...dadosFormatados });
    }
  };

  const getParceirosEtapa = (etapaId: string) => {
    const associacoesDaEtapa = associacoes.filter(a => a.etapa_id === etapaId);
    return associacoesDaEtapa.map(a => a.parceiro).filter(Boolean) as ParceiroMapa[];
  };

  const getEtapaInfo = (etapaId: string) => {
    return etapas.find(e => e.id === etapaId);
  };

  // --- FILTROS & ORDENAÇÃO PARA LISTAGEM ---
  // Filtro rápido por busca
  const parceirosFiltrados = parceiros.filter((p) => {
    const termo = buscaRapida.trim().toLowerCase();
    const matchNome = p.empresa?.nome?.toLowerCase().includes(termo);
    const matchTipo = p.empresa?.tipo?.toLowerCase().includes(termo);
    return !termo || matchNome || matchTipo;
  }).filter((p) => {
    if (statusFiltro === 'todos') return true;
    return p.status === statusFiltro;
  });

  // Ordenação customizada
  const parceirosOrdenados = [...parceirosFiltrados].sort((a, b) => {
    let resultado = 0;
    switch(ordenacao) {
      case 'nome':
        resultado = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
        break;
      case 'performance':
        resultado = (a.performance_score ?? 0) - (b.performance_score ?? 0);
        break;
      case 'criado_em':
        resultado = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return ordemAsc ? resultado : -resultado;
  });

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
        {/* Sidebar */}
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
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-2 sm:p-6">
            {etapaSelecionada ? (
              // Visualização de uma etapa específica (pode repetir melhorias aqui depois)
              <div className="space-y-6">
                {(() => {
                  const etapa = getEtapaInfo(etapaSelecionada);
                  const parceirosDaEtapa = getParceirosEtapa(etapaSelecionada);
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: etapa?.cor }}
                        />
                        <h2 className="text-xl font-semibold">
                          {etapa?.ordem}. {etapa?.nome}
                        </h2>
                        <Badge variant="secondary">
                          {parceirosDaEtapa.length} parceiros
                        </Badge>
                      </div>
                      {etapa?.descricao && (
                        <p className="text-muted-foreground">{etapa.descricao}</p>
                      )}
                      {/* Listagem de parceiros pode ser melhorada similar à geral */}
                    </>
                  );
                })()}
              </div>
            ) : (
              // Visualização geral de todos os parceiros
              <div className="space-y-4">
                {/* Controles rápidos acima da lista */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex-1 flex gap-2 items-center">
                    <h2 className="text-xl font-semibold whitespace-nowrap mr-2">
                      Todos os Parceiros
                    </h2>
                    <Badge variant="secondary" className="mr-2">
                      {parceiros.length} parceiros totais
                    </Badge>
                  </div>
                  <div className="flex gap-2 flex-1 justify-end">
                    {/* Busca rápida */}
                    <Input
                      placeholder="Buscar parceiro..."
                      value={buscaRapida}
                      onChange={e => setBuscaRapida(e.target.value)}
                      className="max-w-[180px] sm:max-w-xs"
                      size={isMobile ? "sm" : "default"}
                    />
                    {/* Filtro status */}
                    <select
                      value={statusFiltro}
                      onChange={e => setStatusFiltro(e.target.value)}
                      className="rounded-md border px-2 py-1 text-sm text-muted-foreground"
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
                      >
                        <option value="nome">Nome</option>
                        <option value="performance">Performance</option>
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
                  </div>
                </div>

                {/* Listagem adaptativa dos parceiros */}
                {parceirosOrdenados.length > 0 ? (
                  <div
                    className={`
                      grid gap-2
                      grid-cols-1
                      sm:grid-cols-2
                      md:grid-cols-3
                      lg:grid-cols-4
                    `}
                  >
                    {parceirosOrdenados.map((parceiro) => (
                      <ParceiroCard
                        key={parceiro.id}
                        parceiro={parceiro}
                        onClick={() => handleParceiroClick(parceiro)}
                        onEdit={() => handleParceiroClick(parceiro)} // pode abrir direto detalhes para edição
                        onDelete={() => handleDeletarParceiro(parceiro)}
                        compact={isMobile}
                        showActions // nova prop, para exibir menu de ações
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
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
                )}
              </div>
            )}
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
