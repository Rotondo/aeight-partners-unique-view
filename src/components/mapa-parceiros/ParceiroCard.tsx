import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Star,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ParceiroMapa } from '@/types/mapa-parceiros';
import { useIsMobile } from '@/hooks/use-mobile';

interface ParceiroCardProps {
  parceiro: ParceiroMapa;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}

const ParceiroCard: React.FC<ParceiroCardProps> = ({
  parceiro,
  onClick,
  onEdit,
  onDelete,
  compact = false
}) => {
  const isMobile = useIsMobile();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'hsl(var(--success))';
      case 'inativo':
        return 'hsl(var(--destructive))';
      case 'pendente':
        return 'hsl(var(--warning))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nomeEmpresa = parceiro.empresa?.nome || 'Empresa sem nome';
  const descricaoEmpresa = parceiro.empresa?.descricao || 'Sem descrição';

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  if (compact || isMobile) {
    return (
      <TooltipProvider>
        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 hover:scale-[1.02]"
          style={{ borderLeftColor: getStatusColor(parceiro.status) }}
          onClick={onClick}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarFallback className="text-xs sm:text-sm font-medium">
                  {getInitials(nomeEmpresa)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4 className="text-sm sm:text-base font-medium truncate cursor-help">
                      {nomeEmpresa}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{nomeEmpresa}</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground capitalize truncate">
                    {parceiro.empresa?.tipo}
                  </span>
                  {parceiro.performance_score > 0 && (
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPerformanceColor(parceiro.performance_score) }}
                      title={`Performance: ${parceiro.performance_score}%`}
                    />
                  )}
                </div>
              </div>
              
              <Badge 
                variant="secondary" 
                className="text-xs flex-shrink-0"
                style={{ 
                  backgroundColor: getStatusColor(parceiro.status),
                  color: 'white'
                }}
              >
                {getStatusText(parceiro.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0" onClick={onClick}>
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarFallback className="font-semibold">
                  {getInitials(nomeEmpresa)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-semibold text-lg truncate cursor-help">
                      {nomeEmpresa}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{nomeEmpresa}</p>
                  </TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground capitalize">
                    {parceiro.empresa?.tipo}
                  </span>
                  {parceiro.performance_score > 0 && (
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getPerformanceColor(parceiro.performance_score) }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {parceiro.performance_score}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0" onClick={onClick}>
          <div className="flex items-center justify-between">
            <Badge 
              variant="secondary" 
              style={{ 
                backgroundColor: getStatusColor(parceiro.status),
                color: 'white'
              }}
            >
              {getStatusText(parceiro.status)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default ParceiroCard;