// @ts-nocheck
import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { calcularContadoresParceiros } from '@/lib/utils';

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

// VIEW_MODES combinados - Adicionando Jornada
const TAB_VIEWS = [
  { label: 'Jornada', value: 'jornada', icon: <Route className="h-4 w-4" /> },
  { label: 'Grid', value: 'grid', icon: <Grid3X3 className="h-4 w-4" /> },
  { label: 'Lista', value: 'lista', icon: <List className="h-4 w-4" /> },
  // { label: 'Tabela Legada', value: 'table_legacy', icon: <List className="h-4 w-4" /> }, // Opcional
];


const MapaParceirosPage: React.FC = () => {
  const {
    etapas,
    subniveis,
    parceiros: parceirosOriginais,
    associacoes,
    associarParceiroEtapa,
    criarParceiro,
    refetch: refetchMapaParceiros
  } = useMapaParceiros();

  // Estado de filtros
  const [filtros, setFiltros] = useState({} as any);
  const [etapaSelecionada, setEtapaSelecionada] = useState<string | undefined>(undefined);
  const [subnivelSelecionado, setSubnivelSelecionado] = useState<string | undefined>(undefined);
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());

  // Handler para expandir/colapsar etapa (corrigido para sempre retornar novo Set)
  const handleToggleEtapa = (etapaId: string) => {
    setExpandedEtapas(prev => {
      const novo = new Set(prev);
      if (novo.has(etapaId)) novo.delete(etapaId);
      else novo.add(etapaId);
      return new Set(novo); // Garante novo Set para atualização correta
    });
  };

  // Handler para clique na etapa (garante uso de id)
  const handleEtapaClick = (etapaId: string) => {
    setEtapaSelecionada(etapaId);
    setSubnivelSelecionado(undefined);
    setFiltros((prev: any) => ({ ...prev, etapaId, subnivelId: undefined }));
  };

  // Handler para clique no subnível (garante uso de id)
  const handleSubnivelClick = (subnivelId: string) => {
    setSubnivelSelecionado(subnivelId);
    const subnivel = subniveis.find(s => s.id === subnivelId);
    setEtapaSelecionada(subnivel?.etapa_id);
    setFiltros((prev: any) => ({ ...prev, etapaId: subnivel?.etapa_id, subnivelId }));
  };

  // Handler para limpar filtros
  const handleLimparFiltros = () => {
    setFiltros({});
    setEtapaSelecionada(undefined);
    setSubnivelSelecionado(undefined);
  };

  // Filtragem de parceiros conforme apenasSemEtapa, etapaId, subnivelId
  let parceiros = parceirosOriginais;
  if (filtros.apenasSemEtapa) {
    parceiros = parceirosOriginais.filter(p =>
      !associacoes.some(a => a.parceiro_id === p.id && (a.etapa_id || a.subnivel_id))
    );
  } else if (filtros.subnivelId) {
    parceiros = parceirosOriginais.filter(p =>
      associacoes.some(a => a.parceiro_id === p.id && a.subnivel_id === filtros.subnivelId)
    );
  } else if (filtros.etapaId) {
    parceiros = parceirosOriginais.filter(p =>
      associacoes.some(a => a.parceiro_id === p.id && a.etapa_id === filtros.etapaId)
    );
  }

  // Calcular stats reais para sidebar - CORRIGIDO para contar parceiros únicos
  const { parceirosPorEtapa, parceirosPorSubnivel } = calcularContadoresParceiros(associacoes);

  // Estado para modal de inclusão de parceiros
  const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);
  // Função de inclusão (dummy, pode ser adaptada para atualizar o mapa após inclusão)
  const handleIncluirParceiro = async (dados: any) => {
    // Chama a função de inclusão real no banco
    await criarParceiro({
      empresa_id: dados.empresa_id,
      status: dados.status || 'ativo',
      performance_score: dados.performance_score || 80,
      observacoes: dados.observacoes || ''
    });
    setModalEmpresaOpen(false);
    if (typeof refetchMapaParceiros === 'function') {
      await refetchMapaParceiros();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ minWidth: 280, borderRight: '1px solid #eee' }}>
        <MapaParceirosSidebar
          etapas={etapas}
          subniveis={subniveis}
          filtros={filtros}
          stats={{
            totalParceiros: parceiros.length,
            parceirosPorEtapa,
            parceirosPorSubnivel,
            parceirosAtivos: 0,
            parceirosInativos: 0,
            performanceMedia: 0
          }}
          onFiltrosChange={setFiltros}
          onEtapaClick={handleEtapaClick}
          etapaSelecionada={etapaSelecionada}
          expandedEtapas={expandedEtapas}
          onToggleEtapa={handleToggleEtapa}
          onLimparFiltros={handleLimparFiltros}
          onSubnivelClick={handleSubnivelClick}
          subnivelSelecionado={subnivelSelecionado}
        />
      </div>
      <div style={{ flex: 1, padding: 24 }}>
        {/* Botão para abrir modal de inclusão de parceiros */}
        <div className="flex justify-end mb-4">
          <Button variant="default" onClick={() => setModalEmpresaOpen(true)}>
            Adicionar Parceiro ao Mapa
          </Button>
        </div>
        <MapaParceirosTable
          parceiros={parceiros}
          associacoes={associacoes}
          etapas={etapas}
          subniveis={subniveis}
          filtros={filtros}
          onParceiroClick={() => {}}
          onDeletarParceiro={() => {}}
          onFiltrosChange={setFiltros}
          onLimparFiltros={() => setFiltros({})}
          onAssociarEtapa={associarParceiroEtapa}
        />
        {/* Modal de inclusão de parceiros */}
        <EmpresaSelector isOpen={modalEmpresaOpen} onClose={() => setModalEmpresaOpen(false)} onSave={handleIncluirParceiro} />
      </div>
    </div>
  );
};

export default MapaParceirosPage;
