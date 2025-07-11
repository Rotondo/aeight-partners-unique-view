
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, SortAsc, SortDesc, Users } from 'lucide-react';
import ParceiroCard from '@/components/mapa-parceiros/ParceiroCard';
import { ParceiroMapa } from '@/types/mapa-parceiros';
import { useIsMobile } from '@/hooks/use-mobile';

type OrdenacaoParceiros = 'nome' | 'performance' | 'criado_em';

interface MapaParceirosGridProps {
  parceiros: ParceiroMapa[];
  onParceiroClick: (parceiro: ParceiroMapa) => void;
  onDeletarParceiro: (parceiro: ParceiroMapa) => void;
}

const MapaParceirosGrid: React.FC<MapaParceirosGridProps> = ({
  parceiros,
  onParceiroClick,
  onDeletarParceiro
}) => {
  const isMobile = useIsMobile();
  const [buscaRapida, setBuscaRapida] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoParceiros>('nome');
  const [ordemAsc, setOrdemAsc] = useState<boolean>(true);

  // Filtros
  const parceirosFiltrados = parceiros.filter((p) => {
    const termo = buscaRapida.trim().toLowerCase();
    const matchNome = p.empresa?.nome?.toLowerCase().includes(termo);
    const matchTipo = p.empresa?.tipo?.toLowerCase().includes(termo);
    const matchBusca = !termo || matchNome || matchTipo;
    
    const matchStatus = statusFiltro === 'todos' || p.status === statusFiltro;
    
    return matchBusca && matchStatus;
  });

  // Ordenação
  const parceirosOrdenados = [...parceirosFiltrados].sort((a, b) => {
    let resultado = 0;
    switch(ordenacao) {
      case 'nome':
        resultado = (a.empresa?.nome || '').localeCompare(b.empresa?.nome || '');
        break;
      case 'performance':
        resultado = (a.performance_score || 0) - (b.performance_score || 0);
        break;
      case 'criado_em':
        resultado = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return ordemAsc ? resultado : -resultado;
  });

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 flex gap-2 items-center">
          <h2 className="text-xl font-semibold whitespace-nowrap">
            Todos os Parceiros
          </h2>
          <Badge variant="secondary">
            {parceiros.length} parceiros
          </Badge>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar parceiro..."
              value={buscaRapida}
              onChange={e => setBuscaRapida(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          {/* Status */}
          <select
            value={statusFiltro}
            onChange={e => setStatusFiltro(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm bg-background"
          >
            <option value="todos">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="pendente">Pendente</option>
          </select>
          
          {/* Ordenação */}
          <div className="flex items-center gap-1">
            <select
              value={ordenacao}
              onChange={e => setOrdenacao(e.target.value as OrdenacaoParceiros)}
              className="rounded-md border px-3 py-2 text-sm bg-background"
            >
              <option value="nome">Nome</option>
              <option value="performance">Performance</option>
              <option value="criado_em">Data</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOrdemAsc(v => !v)}
              className="h-10 w-10"
            >
              {ordemAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de parceiros */}
      {parceirosOrdenados.length > 0 ? (
        <div className={`
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        `}>
          {parceirosOrdenados.map((parceiro) => (
            <ParceiroCard
              key={parceiro.id}
              parceiro={parceiro}
              onClick={() => onParceiroClick(parceiro)}
              onEdit={() => onParceiroClick(parceiro)}
              onDelete={() => onDeletarParceiro(parceiro)}
              compact={isMobile}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum parceiro encontrado</h3>
          <p className="text-muted-foreground">
            {buscaRapida || statusFiltro !== 'todos' 
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando seus primeiros parceiros'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MapaParceirosGrid;
