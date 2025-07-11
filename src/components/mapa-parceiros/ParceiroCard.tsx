import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ParceiroMapa } from "@/types/mapa-parceiros";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParceiroCardProps {
  parceiro: ParceiroMapa;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
  showActions?: boolean;
  etapaAssociada?: string[]; // NOVO: nomes das etapas/subníveis associadas
  quadranteScore?: number; // NOVO: score calculado pelo quadrante
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ativo": return "bg-green-500";
    case "inativo": return "bg-red-500";
    case "pendente": return "bg-yellow-500";
    default: return "bg-gray-300";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ativo": return "Ativo";
    case "inativo": return "Inativo";
    case "pendente": return "Pendente";
    default: return status;
  }
};

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

const renderStars = (score: number) => {
  const stars = Math.max(1, Math.round(score / 20));
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
    />
  ));
};

const ParceiroCard: React.FC<ParceiroCardProps> = ({
  parceiro,
  onClick,
  onEdit,
  onDelete,
  compact = false,
  showActions = false,
  etapaAssociada = [],
  quadranteScore = parceiro.performance_score
}) => {
  const isMobile = useIsMobile();

  const nomeEmpresa = parceiro.empresa?.nome || "Empresa sem nome";
  const tipoEmpresa = parceiro.empresa?.tipo || "";
  const descricaoEmpresa = parceiro.empresa?.descricao || "";

  // --- MOBILE FIRST CARD ---
  if (compact || isMobile) {
    return (
      <Card
        className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg border border-border shadow-none hover:bg-muted transition cursor-pointer"
        onClick={onClick}
        aria-label={`Parceiro ${nomeEmpresa}`}
      >
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="font-semibold text-md">
            {getInitials(nomeEmpresa)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate text-base">{nomeEmpresa}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs capitalize text-muted-foreground truncate">{tipoEmpresa}</span>
            {quadranteScore > 0 && (
              <span
                className={`text-xs font-semibold ml-1 ${getPerformanceColor(quadranteScore)}`}
                title={`Score Quadrante: ${quadranteScore}`}
              >
                {quadranteScore} pts
              </span>
            )}
          </div>
          {etapaAssociada.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {etapaAssociada.slice(0, 2).map((etapa, idx) => (
                <Badge
                  key={etapa}
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 border"
                  title={`Associado à etapa: ${etapa}`}
                >
                  {etapa}
                </Badge>
              ))}
              {etapaAssociada.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0.5">+{etapaAssociada.length-2}</Badge>
              )}
            </div>
          )}
        </div>
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 ${getStatusColor(parceiro.status)} text-white font-semibold`}
        >
          {getStatusText(parceiro.status)}
        </Badge>
        {/* Menu de ações SEMPRE visível no mobile */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} aria-label="Ações">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Card>
    );
  }

  // --- DESKTOP CARD ---
  return (
    <TooltipProvider>
      <Card
        className="group rounded-xl border border-border p-3 hover:shadow-md hover:bg-muted transition-all duration-150 cursor-pointer flex flex-col min-h-[132px] justify-between"
        aria-label={`Parceiro ${nomeEmpresa}`}
        tabIndex={0}
      >
        <div className="flex items-start gap-3" onClick={onClick}>
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="font-semibold text-lg">
              {getInitials(nomeEmpresa)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-semibold text-lg truncate cursor-help" tabIndex={0}>{nomeEmpresa}</div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="font-bold">{nomeEmpresa}</div>
                {descricaoEmpresa && <div className="text-xs text-muted-foreground">{descricaoEmpresa}</div>}
                {etapaAssociada.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[12px] text-muted-foreground">Etapas:</span>
                    {etapaAssociada.map(etapa => (
                      <Badge key={etapa} variant="outline" className="text-[10px] px-2 py-0.5 border">{etapa}</Badge>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs capitalize text-muted-foreground">{tipoEmpresa}</span>
              {quadranteScore > 0 && (
                <div className="flex items-center gap-1 ml-2">
                  {renderStars(quadranteScore)}
                  <span className={`text-xs ml-1 font-bold ${getPerformanceColor(quadranteScore)}`}>
                    {quadranteScore} pts
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Menu de ações só aparece no hover no desktop */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Ações"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-2 justify-between mt-3">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 ${getStatusColor(parceiro.status)} text-white font-semibold`}
          >
            {getStatusText(parceiro.status)}
          </Badge>
          {etapaAssociada.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {etapaAssociada.slice(0, 2).map(etapa => (
                <Badge key={etapa} variant="outline" className="text-[10px] px-2 py-0.5 border">{etapa}</Badge>
              ))}
              {etapaAssociada.length > 2 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0.5">+{etapaAssociada.length-2}</Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ParceiroCard;
