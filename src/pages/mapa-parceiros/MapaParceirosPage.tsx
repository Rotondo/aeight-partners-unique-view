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
  return <div>Diagnóstico raiz</div>;
};

export default MapaParceirosPage;
