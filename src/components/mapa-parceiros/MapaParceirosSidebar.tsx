import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Search, Users } from 'lucide-react';
import { EtapaJornada, SubnivelEtapa } from '@/types/mapa-parceiros';

// Novo tipo de filtros para maior flexibilidade
type FiltrosParceiros = {
  busca?: string;
  status?: string;
  etapaId?: string;
  subnivelId?: string;
  apenasSemEtapa?: boolean;
};

interface MapaParceirosStats {
  parceirosPorEtapa: Record<string, number>;
  parceirosPorSubnivel: Record<string, number>;
}

interface MapaParceirosSidebarProps {
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  filtros: FiltrosParceiros;
  stats: MapaParceirosStats;
  onFiltrosChange: (filtros: FiltrosParceiros) => void;
  onEtapaClick: (etapaId: string) => void;
  etapaSelecionada?: string;
  expandedEtapas: Set<string>;
  onToggleEtapa: (etapaId: string) => void;
  onLimparFiltros?: () => void;
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
  onToggleEtapa,
  onLimparFiltros
}) => {
  // Handlers para filtros
  const handleBuscaChange = (valor: string) => {
    onFiltrosChange({ ...filtros, busca: valor });
  };

  const handleStatusChange = (status: string) => {
    onFiltrosChange({ ...filtros, status: status === 'todos' ? '' : status });
  };

  const handleEtapaChange = (etapaId: string) => {
    onFiltrosChange({ ...filtros, etapaId: etapaId === 'todas' ? '' : etapaId });
  };

  const handleSubnivelChange = (subnivelId: string) => {
    onFiltrosChange({ ...filtros, subnivelId: subnivelId === 'todos' ? '' : subnivelId });
  };

  const handleCheckboxChange = (checked: boolean) => {
    onFiltrosChange({ ...filtros, apenasSemEtapa: checked });
  };

  const limparFiltrosInterno = () => {
    if (onLimparFiltros) {
      onLimparFiltros();
    } else {
      onFiltrosChange({});
    }
  };

  const getSubniveisPorEtapa = (etapaId: string) => {
    return subniveis.filter(s => s.etapa_id === etapaId);
  };

  return (
    <aside className="w-80 bg-background border-r border-border h-full overflow-y-auto flex flex-col">
      {/* Filtros no topo */}
      <div className="p-4 pb-2 flex flex-col gap-3 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar parceiros..."
              value={filtros.busca || ''}
              onChange={(e) => handleBuscaChange(e.target.value)}
              className="pl-8 rounded-md h-9 bg-muted border w-full"
              // Ícone de busca embutido (opcional, pode ajustar visual)
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="gray" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M21.71 20.29l-3.388-3.388A9.953 9.953 0 0 0 19 11c0-5.523-4.477-10-10-10S-1 5.477-1 11s4.477 10 10 10a9.953 9.953 0 0 0 5.902-1.678l3.388 3.388a1 1 0 0 0 1.415-1.415z"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '8px center',
              }}
            />
            <Select value={filtros.status || 'todos'} onValueChange={handleStatusChange}>
              <SelectTrigger className="rounded-md h-9 bg-muted border min-w-[100px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtros.etapaId || 'todas'} onValueChange={handleEtapaChange}>
              <SelectTrigger className="rounded-md h-9 bg-muted border min-w-[100px]">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Etapa</SelectItem>
                {etapas.map((etapa) => (
                  <SelectItem key={etapa.id} value={etapa.id}>
                    {etapa.ordem}. {etapa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtros.subnivelId || 'todos'} onValueChange={handleSubnivelChange}>
              <SelectTrigger className="rounded-md h-9 bg-muted border min-w-[100px]">
                <SelectValue placeholder="Subnível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Subnível</SelectItem>
                {subniveis.map((subnivel) => (
                  <SelectItem key={subnivel.id} value={subnivel.id}>
                    {subnivel.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Checkbox: apenas parceiros SEM etapa atribuída */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="apenasSemEtapa"
              checked={!!filtros.apenasSemEtapa}
              onChange={(e) => handleCheckboxChange(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="apenasSemEtapa" className="text-xs text-muted-foreground">
              Apenas parceiros sem etapa da jornada atribuída
            </label>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparFiltrosInterno}
            className="w-full text-xs"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Jornada do E-commerce */}
      <div className="p-4 pt-2 flex-1 flex flex-col">
        <div>
          <div className="text-sm flex items-center gap-2 font-semibold mb-2">
            <Users className="h-4 w-4" />
            Jornada do E-commerce
          </div>
          <div>
            {etapas.map((etapa) => {
              const subnivelsDaEtapa = getSubniveisPorEtapa(etapa.id);
              const isExpanded = expandedEtapas.has(etapa.id);
              const isSelecionada = etapaSelecionada === etapa.id;
              const totalParceiros = stats.parceirosPorEtapa[etapa.id] || 0;

              return (
                <Collapsible key={etapa.id} open={isExpanded}>
                  <div
                    className={`rounded-lg border transition-colors mb-2 ${
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
                          {subnivelsDaEtapa.map((subnivel) => {
                            const parceirosSubnivel = stats.parceirosPorSubnivel[subnivel.id] || 0;
                            return (
                              <div
                                key={subnivel.id}
                                className={`flex items-center gap-2 py-1 px-2 rounded text-xs hover:bg-muted/30 cursor-pointer ${
                                  filtros.subnivelId === subnivel.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                }`}
                                onClick={() => handleSubnivelChange(subnivel.id)}
                              >
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                                <span className="truncate">{subnivel.nome}</span>
                                {parceirosSubnivel > 0 && (
                                  <Badge variant="outline" className="text-[10px]">
                                    {parceirosSubnivel}
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    )}
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default MapaParceirosSidebar;
