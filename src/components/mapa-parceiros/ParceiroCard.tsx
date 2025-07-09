import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Globe, 
  Mail, 
  Phone, 
  Star,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ParceiroMapa } from '@/types/mapa-parceiros';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500';
      case 'inativo':
        return 'bg-red-500';
      case 'pendente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
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

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20); // Converte 0-100 para 0-5 estrelas
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
        style={{ borderLeftColor: getStatusColor(parceiro.status) }}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(nomeEmpresa)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{nomeEmpresa}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {descricaoEmpresa}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(parceiro.performance_score)}</div>
              <Badge 
                variant="secondary" 
                className={`text-white ${getStatusColor(parceiro.status)}`}
              >
                {getStatusText(parceiro.status)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3" onClick={onClick}>
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(nomeEmpresa)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{nomeEmpresa}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {descricaoEmpresa}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
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
        {/* Performance Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Performance:</span>
            <div className="flex">{renderStars(parceiro.performance_score)}</div>
            <span className="text-sm font-medium">{parceiro.performance_score}%</span>
          </div>
          
          <Badge 
            variant="secondary" 
            className={`text-white ${getStatusColor(parceiro.status)}`}
          >
            {getStatusText(parceiro.status)}
          </Badge>
        </div>

        {/* Informações da Empresa */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">Tipo:</span>
            <span className="capitalize">{parceiro.empresa?.tipo}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParceiroCard;