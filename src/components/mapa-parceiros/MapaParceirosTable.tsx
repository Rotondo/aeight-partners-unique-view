
import React, { useState } from 'react';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, SubnivelEtapa, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface MapaParceirosTableProps {
  parceiros: ParceiroMapa[];
  associacoes: AssociacaoParceiroEtapa[];
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  filtros: MapaParceirosFiltros;
  onParceiroClick: (parceiro: ParceiroMapa) => void;
  onDeletarParceiro: (parceiro: ParceiroMapa) => void;
  onFiltrosChange: (filtros: MapaParceirosFiltros) => void;
  onLimparFiltros: () => void;
}

type OrderBy = 'nome' | 'status' | 'etapa' | 'subnivel';
type OrderDirection = 'asc' | 'desc';

function getEtapasParceiro(parceiroId: string, associacoes: AssociacaoParceiroEtapa[], etapas: EtapaJornada[]) {
  const assocs = associacoes.filter(a => a.parceiro_id === parceiroId);
  return assocs.map(a => {
    const etapa = etapas.find(e => e.id === a.etapa_id);
    return etapa ? `${etapa.ordem}. ${etapa.nome}` : '';
  }).filter(Boolean);
}

function getSubniveisParceiro(parceiroId: string, associacoes: AssociacaoParceiroEtapa[], subniveis: SubnivelEtapa[]) {
  const assocs = associacoes.filter(a => a.parceiro_id === parceiroId);
  return assocs.map(a => {
    const subnivel = subniveis.find(s => s.id === a.subnivel_id);
    return subnivel ? subnivel.nome : '';
  }).filter(Boolean);
}

const MapaParceirosTable: React.FC<MapaParceirosTableProps> = ({
  parceiros,
  associacoes,
  etapas,
  subniveis,
  filtros,
  onParceiroClick,
  onDeletarParceiro,
  onFiltrosChange,
  onLimparFiltros
}) => {
  const [orderBy, setOrderBy] = useState<OrderBy>('nome');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('asc');

  const sortedParceiros = [...parceiros].sort((a, b) => {
    let compare = 0;
    if (orderBy === 'nome') {
      compare = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
    } else if (orderBy === 'status') {
      compare = (a.status || '').localeCompare(b.status || '');
    } else if (orderBy === 'etapa') {
      const etapaA = getEtapasParceiro(a.id, associacoes, etapas).join(',') || '';
      const etapaB = getEtapasParceiro(b.id, associacoes, etapas).join(',') || '';
      compare = etapaA.localeCompare(etapaB);
    } else if (orderBy === 'subnivel') {
      const subnivelA = getSubniveisParceiro(a.id, associacoes, subniveis).join(',') || '';
      const subnivelB = getSubniveisParceiro(b.id, associacoes, subniveis).join(',') || '';
      compare = subnivelA.localeCompare(subnivelB);
    }
    return orderDirection === 'asc' ? compare : -compare;
  });

  const handleSort = (by: OrderBy) => {
    if (orderBy === by) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(by);
      setOrderDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500 text-white';
      case 'inativo':
        return 'bg-red-500 text-white';
      case 'pendente':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">
          Lista de Parceiros ({sortedParceiros.length})
        </h3>
        <Button variant="ghost" size="sm" onClick={onLimparFiltros}>
          Limpar Filtros
        </Button>
      </div>
      <div className="overflow-x-auto rounded border border-border bg-background">
        <table className="min-w-full divide-y divide-border text-xs">
          <thead>
            <tr className="bg-muted">
              <th className="p-1 font-semibold cursor-pointer text-left" onClick={() => handleSort('nome')}>
                Nome {orderBy === 'nome' && (orderDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-1 font-semibold cursor-pointer text-left" onClick={() => handleSort('etapa')}>
                Etapa da Jornada {orderBy === 'etapa' && (orderDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-1 font-semibold cursor-pointer text-left" onClick={() => handleSort('subnivel')}>
                Subnível {orderBy === 'subnivel' && (orderDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-1 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedParceiros.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted-foreground text-xs">
                  Nenhum parceiro encontrado.<br />
                  Adicione novos parceiros ou ajuste os filtros.
                </td>
              </tr>
            ) : (
              sortedParceiros.map((parceiro) => {
                const nomeEmpresa = parceiro.empresa?.nome || 'Empresa sem nome';
                const etapasParceiro = getEtapasParceiro(parceiro.id, associacoes, etapas);
                const subniveisParceiro = getSubniveisParceiro(parceiro.id, associacoes, subniveis);

                return (
                  <tr key={parceiro.id} className="hover:bg-muted/30 transition-colors cursor-pointer min-h-8" onClick={() => onParceiroClick(parceiro)}>
                    <td className="p-1 min-w-[120px] font-medium whitespace-nowrap">
                      {nomeEmpresa}
                    </td>
                    <td className="p-1 whitespace-nowrap">
                      {etapasParceiro.length > 0
                        ? etapasParceiro.join(", ")
                        : <span className="italic text-muted-foreground">Sem etapa</span>
                      }
                    </td>
                    <td className="p-1 whitespace-nowrap">
                      {subniveisParceiro.length > 0
                        ? subniveisParceiro.join(", ")
                        : <span className="italic text-muted-foreground">Sem subnível</span>
                      }
                    </td>
                    <td className="p-1 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1"
                        title="Editar"
                        onClick={(e) => { e.stopPropagation(); onParceiroClick(parceiro); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remover"
                        onClick={(e) => { e.stopPropagation(); onDeletarParceiro(parceiro); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MapaParceirosTable;
