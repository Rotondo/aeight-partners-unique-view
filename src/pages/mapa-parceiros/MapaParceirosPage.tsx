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
import { Input } from '@/components/ui/input';

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
    associarParceiroEtapa
  } = useMapaParceiros();

  // Estado de filtros
  const [filtros, setFiltros] = useState({} as any);
  const [etapaSelecionada, setEtapaSelecionada] = useState<string | undefined>(undefined);
  const [subnivelSelecionado, setSubnivelSelecionado] = useState<string | undefined>(undefined);

  // Handlers para clique na sidebar
  const handleEtapaClick = (etapaId: string) => {
    setEtapaSelecionada(etapaId);
    setSubnivelSelecionado(undefined);
    setFiltros((prev: any) => ({ ...prev, etapaId, subnivelId: undefined }));
  };
  const handleSubnivelClick = (subnivelId: string) => {
    setSubnivelSelecionado(subnivelId);
    // Descobrir etapa correspondente
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

  if (!parceiros || parceiros.length === 0) {
    return <div>Nenhum parceiro encontrado para diagnóstico.</div>;
  }

  // Calcular stats reais para sidebar
  const parceirosPorEtapa: Record<string, number> = {};
  const parceirosPorSubnivel: Record<string, number> = {};
  associacoes.forEach(a => {
    if (a.etapa_id && !a.subnivel_id) {
      parceirosPorEtapa[a.etapa_id] = (parceirosPorEtapa[a.etapa_id] || 0) + 1;
    }
    if (a.subnivel_id) {
      parceirosPorSubnivel[a.subnivel_id] = (parceirosPorSubnivel[a.subnivel_id] || 0) + 1;
      // Também conta para etapa
      if (a.etapa_id) parceirosPorEtapa[a.etapa_id] = (parceirosPorEtapa[a.etapa_id] || 0) + 1;
    }
  });

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
          expandedEtapas={new Set([etapaSelecionada].filter(Boolean) as string[])}
          onToggleEtapa={setEtapaSelecionada}
          onLimparFiltros={handleLimparFiltros}
          onSubnivelClick={handleSubnivelClick}
          subnivelSelecionado={subnivelSelecionado}
        />
      </div>
      <div style={{ flex: 1, padding: 24 }}>
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
      </div>
    </div>
  );
};

export default MapaParceirosPage;
