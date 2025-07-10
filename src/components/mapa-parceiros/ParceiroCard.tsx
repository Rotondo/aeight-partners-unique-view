import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
}

const ParceiroCard: React.FC<ParceiroCardProps> = ({
  parceiro,
  onClick,
  onEdit,
  onDelete,
  compact = false,
  showActions = false,
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500";
      case "inativo":
        return "bg-red-500";
      case "pendente":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "inativo":
        return "Inativo";
      case "pendente":
        return "Pendente";
      default:
        return status;
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

  const nomeEmpresa = parceiro.empresa?.nome || "Empresa sem nome";
  const descricaoEmpresa = parceiro.empresa?.descricao || "";
  const tipoEmpresa = parceiro.empresa?.tipo || "";

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

  // --- MOBILE FIRST CARD ---
  if (compact || isMobile) {
    return (
      <Card
        className="flex flex-row items-center gap-3 px-3 py-2 rounded-lg border border-border shadow-none hover:bg-muted transition cursor-pointer"
        onClick={onClick}
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
            {parceiro.performance_score > 0 && (
              <span
                className={`text-xs font-semibold ml-1 ${getPerformanceColor(parceiro.performance_score)}`}
                title={`Performance: ${parceiro.performance_score}%`}
              >
                {parceiro.performance_score}%
              </span>
            )}
          </div>
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
      <Card className="group rounded-xl border border-border p-3 hover:shadow-md hover:bg-muted transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[112px]">
        <div className="flex items-start gap-3" onClick={onClick}>
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="font-semibold text-lg">
              {getInitials(nomeEmpresa)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-semibold text-lg truncate cursor-help">{nomeEmpresa}</div>
              </TooltipTrigger>
              <TooltipContent>
                <div>{nomeEmpresa}</div>
                {descricaoEmpresa && <div className="text-xs text-muted-foreground">{descricaoEmpresa}</div>}
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs capitalize text-muted-foreground">{tipoEmpresa}</span>
              {parceiro.performance_score > 0 && (
                <div className="flex items-center gap-1 ml-2">
                  {renderStars(parceiro.performance_score)}
                  <span className={`text-xs ml-1 font-bold ${getPerformanceColor(parceiro.performance_score)}`}>
                    {parceiro.performance_score}%
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
        <div className="flex items-center justify-between mt-3">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 ${getStatusColor(parceiro.status)} text-white font-semibold`}
          >
            {getStatusText(parceiro.status)}
          </Badge>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default ParceiroCard;
