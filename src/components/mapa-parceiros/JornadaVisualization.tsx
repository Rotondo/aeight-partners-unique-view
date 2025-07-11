
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronRight, Star } from 'lucide-react';
import { EtapaJornada, SubnivelEtapa, ParceiroMapa, AssociacaoParceiroEtapa } from '@/types/mapa-parceiros';

interface JornadaVisualizationProps {
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  parceiros: ParceiroMapa[];
  associacoes: AssociacaoParceiroEtapa[];
  expandedEtapas: Set<string>;
  onToggleEtapa: (etapaId: string) => void;
  onParceiroClick: (parceiro: ParceiroMapa) => void;
}

function getParceirosPorEtapa(etapaId: string, associacoes: AssociacaoParceiroEtapa[], parceiros: ParceiroMapa[]) {
  const parceirosDaEtapa = associacoes
    .filter(a => a.etapa_id === etapaId && !a.subnivel_id)
    .map(a => parceiros.find(p => p.id === a.parceiro_id))
    .filter(Boolean) as ParceiroMapa[];
  return parceirosDaEtapa;
}

function getParceirosPorSubnivel(subnivelId: string, associacoes: AssociacaoParceiroEtapa[], parceiros: ParceiroMapa[]) {
  const parceirosDoSubnivel = associacoes
    .filter(a => a.subnivel_id === subnivelId)
    .map(a => parceiros.find(p => p.id === a.parceiro_id))
    .filter(Boolean) as ParceiroMapa[];
  return parceirosDoSubnivel;
}

const getInitials = (nome: string | undefined) => {
  if (!nome) return "";
  return nome
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getPerformanceColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
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

const renderStars = (score: number) => {
  const stars = Math.round(score / 20);
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ));
};

const JornadaVisualization: React.FC<JornadaVisualizationProps> = ({
  etapas,
  subniveis,
  parceiros,
  associacoes,
  expandedEtapas,
  onToggleEtapa,
  onParceiroClick
}) => {
  const getSubniveisPorEtapa = (etapaId: string) => {
    return subniveis.filter(s => s.etapa_id === etapaId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Jornada do E-commerce</h2>
        <p className="text-muted-foreground">Visualize os parceiros em cada etapa da jornada</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
        
        {etapas.filter(Boolean).map((etapa) => {
          if (!etapa || !etapa.id) return null; // Pular etapas inválidas

          const isExpanded = expandedEtapas.has(etapa.id);
          const subniveisDaEtapa = getSubniveisPorEtapa(etapa.id);
          const parceirosDaEtapa = getParceirosPorEtapa(etapa.id, associacoes, parceiros);

          const parceirosPorSubnivel = subniveisDaEtapa.filter(Boolean).map(subnivel => {
            if (!subnivel || !subnivel.id) return { subnivel: {id: '', nome: 'Inválido'}, parceiros: [] }; // Fallback para subnível inválido
            return {
              subnivel,
              parceiros: getParceirosPorSubnivel(subnivel.id, associacoes, parceiros)
            };
          }).filter(item => item.subnivel.id); // Remover fallbacks se não quisermos renderizá-los

          const totalParceiros = parceirosDaEtapa.length +
                                 parceirosPorSubnivel.reduce((acc, item) => acc + (item.parceiros?.length || 0), 0);

          return (
            <div key={etapa.id} className="relative mb-8">
              <div 
                className="absolute left-6 w-4 h-4 rounded-full border-4 border-background z-10 hidden md:block"
                style={{ backgroundColor: etapa.cor || '#3B82F6' }}
              />

              <Card className="ml-0 md:ml-16 cursor-pointer hover:shadow-md transition-shadow">
                <CardContent 
                  className="p-6"
                  onClick={() => etapa && etapa.id && onToggleEtapa(etapa.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: etapa.cor || '#3B82F6' }}
                      >
                        {etapa.ordem || '?'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{etapa.nome || 'Etapa sem nome'}</h3>
                        {etapa.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{etapa.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {totalParceiros > 0 && (
                        <Badge variant="secondary">
                          {totalParceiros} parceiro{totalParceiros > 1 ? 's' : ''}
                        </Badge>
                      )}
                      {subniveisDaEtapa.length > 0 && (
                        isExpanded ? 
                          <ChevronDown className="h-5 w-5 text-muted-foreground" /> :
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isExpanded && (
                <div className="ml-4 md:ml-20 mt-4 space-y-4">
                  {parceirosDaEtapa && parceirosDaEtapa.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Parceiros da etapa</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {parceirosDaEtapa.filter(Boolean).map((parceiro) => {
                          if (!parceiro || !parceiro.id) return null;
                          const empresaNome = parceiro.empresa?.nome || 'Parceiro sem nome';
                          const statusParceiro = parceiro.status || 'desconhecido';
                          const performanceScore = parceiro.performance_score || 0;

                          return (
                            <Card 
                              key={parceiro.id}
                              className="cursor-pointer hover:bg-muted transition-colors"
                              onClick={(e) => {e.stopPropagation(); onParceiroClick(parceiro);}}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage 
                                      src={parceiro.empresa?.logo_url} 
                                      alt={empresaNome}
                                      className="object-contain"
                                    />
                                    <AvatarFallback className="text-xs">
                                      {getInitials(empresaNome)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{empresaNome}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={`text-xs px-2 py-1 ${getStatusColor(statusParceiro)}`}>
                                        {statusParceiro.charAt(0).toUpperCase() + statusParceiro.slice(1)}
                                      </Badge>
                                    </div>
                                    {performanceScore > 0 && (
                                      <div className="flex items-center gap-1 mt-1">
                                        {renderStars(performanceScore)}
                                        <span className={`text-xs font-medium ml-1 ${getPerformanceColor(performanceScore)}`}>
                                          {performanceScore}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {parceirosPorSubnivel.filter(Boolean).map(({ subnivel, parceiros: parceirosDosSubniveis }) => {
                    if (!subnivel || !subnivel.id) return null;

                    return (
                      <div key={subnivel.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                          <h4 className="text-sm font-medium">{subnivel.nome || 'Subnível sem nome'}</h4>
                          {parceirosDosSubniveis && parceirosDosSubniveis.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {parceirosDosSubniveis.length}
                            </Badge>
                          )}
                        </div>

                        {parceirosDosSubniveis && parceirosDosSubniveis.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ml-4">
                            {parceirosDosSubniveis.filter(Boolean).map((parceiro) => {
                              if (!parceiro || !parceiro.id) return null;
                              const empresaNome = parceiro.empresa?.nome || 'Parceiro sem nome';
                              const statusParceiro = parceiro.status || 'desconhecido';
                              const performanceScore = parceiro.performance_score || 0;

                              return (
                                <Card
                                  key={parceiro.id}
                                  className="cursor-pointer hover:bg-muted transition-colors"
                                  onClick={(e) => {e.stopPropagation(); onParceiroClick(parceiro);}}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage
                                          src={parceiro.empresa?.logo_url}
                                          alt={empresaNome}
                                          className="object-contain"
                                        />
                                        <AvatarFallback className="text-xs">
                                          {getInitials(empresaNome)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{empresaNome}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge className={`text-xs px-2 py-1 ${getStatusColor(statusParceiro)}`}>
                                            {statusParceiro.charAt(0).toUpperCase() + statusParceiro.slice(1)}
                                          </Badge>
                                        </div>
                                        {performanceScore > 0 && (
                                          <div className="flex items-center gap-1 mt-1">
                                            {renderStars(performanceScore)}
                                            <span className={`text-xs font-medium ml-1 ${getPerformanceColor(performanceScore)}`}>
                                              {performanceScore}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JornadaVisualization;
