import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, Filter, Users, BarChart3 } from 'lucide-react';
import { EtapaJornada, SubnivelEtapa, MapaParceirosFiltros, MapaParceirosStats } from '@/types/mapa-parceiros';

interface MapaParceirosSidebarProps {
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  filtros: MapaParceirosFiltros;
  stats: MapaParceirosStats;
  onFiltrosChange: (filtros: MapaParceirosFiltros) => void;
  onEtapaClick: (etapaId: string) => void;
  etapaSelecionada?: string;
  expandedEtapas: Set<string>;
  onToggleEtapa: (etapaId: string) => void;
}

const MapaParceirosSidebar: React.FC<MapaParceirosSidebarProps> = ({
  etapas,
  subniveis,
  filtros,
  stats,
  onFiltrosChange,
  onEtapaClick,
  etapaSelecionada,
  expandedEtapas,
  onToggleEtapa
}) => {
  const handleBuscaChange = (valor: string) => {
    onFiltrosChange({ ...filtros, busca: valor });
  };

  const handleStatusChange = (status: string) => {
    onFiltrosChange({ ...filtros, status: status === 'todos' ? undefined : status });
  };

  const handleEtapaChange = (etapa: string) => {
    onFiltrosChange({ ...filtros, etapa: etapa === 'todas' ? undefined : etapa });
  };

  const limparFiltros = () => {
    onFiltrosChange({});
  };

  const getSubniveisPorEtapa = (etapaId: string) => {
    return subniveis.filter(s => s.etapa_id === etapaId);
  };

  return (
    <div className="w-80 bg-background border-r border-border h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Estatísticas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total de Parceiros</span>
              <Badge variant="secondary">{stats.totalParceiros}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ativos</span>
              <Badge variant="default" className="bg-green-500">{stats.parceirosAtivos}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Performance Média</span>
              <Badge variant="outline">{Math.round(stats.performanceMedia)}%</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar parceiros..."
                value={filtros.busca || ''}
                onChange={(e) => handleBuscaChange(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Status */}
            <Select value={filtros.status || 'todos'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            {/* Etapa */}
            <Select value={filtros.etapa || 'todas'} onValueChange={handleEtapaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Etapas</SelectItem>
                {etapas.map((etapa) => (
                  <SelectItem key={etapa.id} value={etapa.id}>
                    {etapa.ordem}. {etapa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={limparFiltros}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Etapas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Jornada do E-commerce
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {etapas.map((etapa) => {
              const subnivelsDaEtapa = getSubniveisPorEtapa(etapa.id);
              const isExpanded = expandedEtapas.has(etapa.id);
              const isSelecionada = etapaSelecionada === etapa.id;
              const totalParceiros = stats.parceirosPorEtapa[etapa.id] || 0;

              return (
                <Collapsible key={etapa.id} open={isExpanded}>
                  <div 
                    className={`rounded-lg border transition-colors ${
                      isSelecionada ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                  >
                    <CollapsibleTrigger
                      onClick={() => onToggleEtapa(etapa.id)}
                      className="w-full p-2 flex items-center justify-between text-left"
                    >
                      <div 
                        className="flex-1 flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEtapaClick(etapa.id);
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: etapa.cor }}
                        />
                        <span className="text-sm font-medium truncate">
                          {etapa.ordem}. {etapa.nome}
                        </span>
                        {totalParceiros > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {totalParceiros}
                          </Badge>
                        )}
                      </div>
                      {subnivelsDaEtapa.length > 0 && (
                        isExpanded ? 
                          <ChevronDown className="h-4 w-4 text-muted-foreground" /> :
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                    
                    {subnivelsDaEtapa.length > 0 && (
                      <CollapsibleContent className="px-4 pb-2">
                        <div className="space-y-1">
                          {subnivelsDaEtapa.map((subnivel) => (
                            <div 
                              key={subnivel.id}
                              className="flex items-center gap-2 py-1 px-2 rounded text-xs text-muted-foreground hover:bg-muted/30 cursor-pointer"
                            >
                              <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                              <span className="truncate">{subnivel.nome}</span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapaParceirosSidebar;