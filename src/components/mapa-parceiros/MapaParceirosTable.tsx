
import React, { useState } from 'react';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada, SubnivelEtapa, MapaParceirosFiltros } from '@/types/mapa-parceiros';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ParceiroDetalhesSimplificado from './ParceiroDetalhesSimplificado';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

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
  onAssociarEtapa: (parceiroId: string, etapaId: string, subnivelId?: string) => Promise<any>;
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
  onLimparFiltros,
  onAssociarEtapa
}) => {
  const { toast } = useToast();
  const [orderBy, setOrderBy] = useState<OrderBy>('nome');
  const [orderDirection, setOrderDirection] = useState<OrderDirection>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; parceiro: ParceiroMapa | null }>({ open: false, parceiro: null });
  const [editParceiro, setEditParceiro] = useState<ParceiroMapa | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<string, { etapaId: string; subnivelId: string }>>({});
  const [showDetalhes, setShowDetalhes] = useState<ParceiroMapa | null>(null);
  const [selectedParceiros, setSelectedParceiros] = React.useState<string[]>([]);
  const [loadingLote, setLoadingLote] = React.useState(false);

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

  // Função para atualizar etapa/subnível inline
  const handleUpdateEtapa = (parceiroId: string, etapaId: string) => {
    setPendingEdits(prev => ({
      ...prev,
      [parceiroId]: {
        etapaId,
        subnivelId: prev[parceiroId]?.subnivelId ?? (associacoes.find(a => a.parceiro_id === parceiroId)?.subnivel_id || '')
      }
    }));
  };
  const handleUpdateSubnivel = (parceiroId: string, subnivelId: string) => {
    setPendingEdits(prev => ({
      ...prev,
      [parceiroId]: {
        etapaId: prev[parceiroId]?.etapaId ?? (associacoes.find(a => a.parceiro_id === parceiroId)?.etapa_id || ''),
        subnivelId
      }
    }));
  };

  const handleSalvarAlteracoes = async () => {
    let erro = false;
    for (const parceiroId in pendingEdits) {
      const { etapaId, subnivelId } = pendingEdits[parceiroId];
      try {
        await onAssociarEtapa(parceiroId, etapaId, subnivelId || undefined);
      } catch (err) {
        erro = true;
        toast({
          title: 'Erro ao salvar',
          description: `Erro ao salvar alterações para o parceiro: ${parceiroId}`,
          variant: 'destructive',
        });
      }
    }
    setPendingEdits({});
    if (!erro) {
      toast({
        title: 'Alterações salvas',
        description: 'Todas as alterações foram salvas com sucesso.',
      });
    }
  };

  const handleSelectParceiro = (parceiroId: string, checked: boolean) => {
    setSelectedParceiros(prev => checked ? [...prev, parceiroId] : prev.filter(id => id !== parceiroId));
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParceiros(sortedParceiros.map(p => p.id));
    } else {
      setSelectedParceiros([]);
    }
  };
  const handleSalvarLote = async (etapaId: string, subnivelId: string) => {
    setLoadingLote(true);
    let erro = false;
    for (const parceiroId of selectedParceiros) {
      try {
        await onAssociarEtapa(parceiroId, etapaId, subnivelId || undefined);
      } catch (err) {
        erro = true;
        toast({
          title: 'Erro ao salvar',
          description: `Erro ao salvar alterações para o parceiro: ${parceiroId}`,
          variant: 'destructive',
        });
      }
    }
    setLoadingLote(false);
    setSelectedParceiros([]);
    if (!erro) {
      toast({
        title: 'Alterações em lote salvas',
        description: 'Todos os parceiros selecionados foram atualizados.',
      });
    }
  };

  // Checkbox com indeterminate manual
  const IndeterminateCheckbox = React.forwardRef<HTMLButtonElement, { checked: boolean; indeterminate: boolean; onChange: (checked: boolean) => void }>(({ checked, indeterminate, onChange }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      if (buttonRef.current) {
        // O input real é o primeiro filho do button
        const input = buttonRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
        if (input) input.indeterminate = indeterminate;
      }
    }, [indeterminate]);
    return (
      <Checkbox
        ref={el => {
          if (typeof ref === 'function') ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          buttonRef.current = el;
        }}
        checked={checked}
        onCheckedChange={onChange}
      />
    );
  });
  IndeterminateCheckbox.displayName = 'IndeterminateCheckbox';

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
              <th className="p-1 text-center">
                <IndeterminateCheckbox checked={selectedParceiros.length === sortedParceiros.length && sortedParceiros.length > 0} indeterminate={selectedParceiros.length > 0 && selectedParceiros.length < sortedParceiros.length} onChange={handleSelectAll} />
              </th>
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
                <td colSpan={5} className="text-center py-8 text-muted-foreground text-base">
                  <div className="flex flex-col items-center gap-2">
                    <span role="img" aria-label="Sem parceiros" style={{fontSize: '2rem'}}>🤝</span>
                    <div>Nenhum parceiro associado a esta etapa ou subnível.</div>
                    <div className="text-xs text-muted-foreground">Associe parceiros para visualizar aqui ou navegue entre as etapas na barra lateral.</div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedParceiros.map((parceiro) => {
                const nomeEmpresa = parceiro.empresa?.nome || 'Empresa sem nome';
                const etapasParceiro = getEtapasParceiro(parceiro.id, associacoes, etapas);
                const subniveisParceiro = getSubniveisParceiro(parceiro.id, associacoes, subniveis);
                const etapaIdAtual = (pendingEdits[parceiro.id]?.etapaId) ?? ((associacoes.find(a => a.parceiro_id === parceiro.id)?.etapa_id) || '');
                const subnivelIdAtual = (pendingEdits[parceiro.id]?.subnivelId) ?? ((associacoes.find(a => a.parceiro_id === parceiro.id)?.subnivel_id) || '');
                const isEdited = !!pendingEdits[parceiro.id];
                const subniveisFiltrados = etapaIdAtual ? subniveis.filter(s => s.etapa_id === etapaIdAtual) : [];
                return (
                  <tr key={parceiro.id} className={`hover:bg-muted/30 transition-colors cursor-pointer min-h-8 ${isEdited ? 'bg-yellow-50' : ''}`} onClick={() => setEditParceiro(parceiro)}>
                    <td className="p-1 text-center">
                      <Checkbox checked={selectedParceiros.includes(parceiro.id)} onCheckedChange={checked => handleSelectParceiro(parceiro.id, !!checked)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td className="p-1 min-w-[120px] font-medium whitespace-nowrap">
                      {nomeEmpresa}
                      {isEdited && <span className="ml-2 text-xs text-yellow-600">(pendente)</span>}
                    </td>
                    <td className="p-1 whitespace-nowrap">
                      <Select value={etapaIdAtual || "none"} onValueChange={v => handleUpdateEtapa(parceiro.id, v === "none" ? "" : v)}>
                        <SelectTrigger className="h-7 w-full text-xs">
                          <SelectValue placeholder={etapasParceiro[0] || 'Selecionar etapa'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem etapa</SelectItem>
                          {etapas.map(etapa => (
                            <SelectItem key={etapa.id} value={etapa.id}>{etapa.ordem}. {etapa.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-1 whitespace-nowrap">
                      <Select value={subnivelIdAtual || "none"} onValueChange={v => handleUpdateSubnivel(parceiro.id, v === "none" ? "" : v)} disabled={!etapaIdAtual}>
                        <SelectTrigger className="h-7 w-full text-xs">
                          <SelectValue placeholder={subniveisParceiro[0] || 'Selecionar subnível'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem subnível</SelectItem>
                          {subniveisFiltrados.map(subnivel => (
                            <SelectItem key={subnivel.id} value={subnivel.id}>{subnivel.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-1 text-center whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1"
                        title="Editar"
                        onClick={e => { e.stopPropagation(); setShowDetalhes(parceiro); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remover"
                        onClick={e => { e.stopPropagation(); setDeleteConfirm({ open: true, parceiro }); }}>
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
      {selectedParceiros.length > 0 && (
        <div className="flex items-center gap-2 mt-2">
          <Select onValueChange={etapaId => handleSalvarLote(etapaId, '')}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Atribuir etapa em lote" />
            </SelectTrigger>
            <SelectContent>
              {etapas.map(etapa => (
                <SelectItem key={etapa.id} value={etapa.id}>{etapa.ordem}. {etapa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={subnivelId => handleSalvarLote('', subnivelId)} disabled={selectedParceiros.length === 0}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Atribuir subnível em lote" />
            </SelectTrigger>
            <SelectContent>
              {subniveis.map(subnivel => (
                <SelectItem key={subnivel.id} value={subnivel.id}>{subnivel.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="default" onClick={() => handleSalvarLote('', '')} disabled={loadingLote}>
            {loadingLote ? 'Salvando...' : `Salvar em lote (${selectedParceiros.length})`}
          </Button>
        </div>
      )}
      {Object.keys(pendingEdits).length > 0 && (
        <div className="flex justify-end mt-2">
          <Button variant="default" onClick={handleSalvarAlteracoes}>
            Salvar alterações ({Object.keys(pendingEdits).length})
          </Button>
        </div>
      )}
      {/* Confirmação de exclusão */}
      <Dialog open={deleteConfirm.open} onOpenChange={open => !open && setDeleteConfirm({ open: false, parceiro: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Parceiro</DialogTitle>
          </DialogHeader>
          <div>Tem certeza que deseja remover o parceiro <b>{deleteConfirm.parceiro?.empresa?.nome}</b>?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ open: false, parceiro: null })}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm.parceiro) onDeletarParceiro(deleteConfirm.parceiro); setDeleteConfirm({ open: false, parceiro: null }); }}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!showDetalhes} onOpenChange={open => !open && setShowDetalhes(null)}>
        <DialogContent className="max-w-md w-full sm:w-[420px]">
          {showDetalhes && (
            <ParceiroDetalhesSimplificado
              parceiro={showDetalhes}
              etapas={etapas}
              subniveis={subniveis}
              associacoes={associacoes}
              onClose={() => setShowDetalhes(null)}
              onSave={async () => setShowDetalhes(null)}
              onAssociarEtapa={async () => {}}
              onRemoverAssociacao={async () => {}}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MapaParceirosTable;
