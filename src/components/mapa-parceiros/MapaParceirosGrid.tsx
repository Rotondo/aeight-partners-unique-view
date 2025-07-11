
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, MapPin, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ParceiroMapa, AssociacaoParceiroEtapa, EtapaJornada } from '@/types/mapa-parceiros';
import { useIsMobile } from '@/hooks/use-mobile';

interface MapaParceirosGridProps {
  parceiros: ParceiroMapa[];
  associacoes?: AssociacaoParceiroEtapa[];
  etapas?: EtapaJornada[];
  onParceiroClick: (parceiro: ParceiroMapa) => void;
  onDeletarParceiro: (parceiro: ParceiroMapa) => void;
}

const MapaParceirosGrid: React.FC<MapaParceirosGridProps> = ({
  parceiros,
  associacoes = [],
  etapas = [],
  onParceiroClick,
  onDeletarParceiro
}) => {
  const isMobile = useIsMobile();

  const getInitials = (nome: string | undefined) => {
    if (!nome) return "";
    return nome
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500 text-white";
      case "inativo":
        return "bg-red-500 text-white";
      case "pendente":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-300 text-gray-800";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const getAssociacoesParceiro = (parceiroId: string) => {
    return associacoes.filter(a => a.parceiro_id === parceiroId);
  };

  const getEtapasNomes = (parceiroId: string) => {
    const associacoesParceiro = getAssociacoesParceiro(parceiroId);
    const etapasNomes = associacoesParceiro
      .map(a => {
        const etapa = etapas.find(e => e.id === a.etapa_id);
        return etapa ? `${etapa.ordem}. ${etapa.nome}` : null;
      })
      .filter(Boolean);
    
    return etapasNomes;
  };

  if (parceiros.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Nenhum parceiro encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Adicione novos parceiros ou ajuste os filtros para ver os resultados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Todos os Parceiros ({parceiros.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {parceiros.map((parceiro) => {
          const etapasAssociadas = getEtapasNomes(parceiro.id);
          const nomeEmpresa = parceiro.empresa?.nome || "Empresa sem nome";
          const tipoEmpresa = parceiro.empresa?.tipo || "";

          return (
            <Card 
              key={parceiro.id}
              className="group cursor-pointer hover:shadow-md transition-all duration-200 border border-border"
              onClick={() => onParceiroClick(parceiro)}
            >
              <CardContent className="p-4">
                {/* Header com Avatar e Ações */}
                <div className="flex items-start justify-between mb-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage 
                      src={parceiro.empresa?.logo_url} 
                      alt={nomeEmpresa}
                      className="object-contain"
                    />
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(nomeEmpresa)}
                    </AvatarFallback>
                  </Avatar>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onParceiroClick(parceiro); }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); onDeletarParceiro(parceiro); }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Nome da Empresa */}
                <div className="mb-2">
                  <h4 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                    {nomeEmpresa}
                  </h4>
                  {tipoEmpresa && (
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      {tipoEmpresa}
                    </p>
                  )}
                </div>

                {/* Performance Score */}
                {parceiro.performance_score > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {renderStars(parceiro.performance_score)}
                    </div>
                    <span className={`text-xs font-bold ${getPerformanceColor(parceiro.performance_score)}`}>
                      {parceiro.performance_score}%
                    </span>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`text-xs px-2 py-1 ${getStatusColor(parceiro.status)}`}>
                    {parceiro.status.charAt(0).toUpperCase() + parceiro.status.slice(1)}
                  </Badge>
                </div>

                {/* Etapas Associadas */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Etapas da Jornada:</span>
                  </div>
                  
                  {etapasAssociadas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {etapasAssociadas.slice(0, 2).map((etapa, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-0.5 truncate max-w-[120px]"
                          title={etapa}
                        >
                          {etapa}
                        </Badge>
                      ))}
                      {etapasAssociadas.length > 2 && (
                        <Badge 
                          variant="outline" 
                          className="text-xs px-2 py-0.5"
                        >
                          +{etapasAssociadas.length - 2}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Não associado a nenhuma etapa
                    </p>
                  )}
                </div>

                {/* Observações (se houver) */}
                {parceiro.observacoes && (
                  <div className="mt-3 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {parceiro.observacoes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MapaParceirosGrid;
