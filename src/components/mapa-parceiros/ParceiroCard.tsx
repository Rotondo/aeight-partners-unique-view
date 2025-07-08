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
              <AvatarImage src={parceiro.logo_url} alt={parceiro.nome} />
              <AvatarFallback className="text-xs">
                {getInitials(parceiro.nome)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{parceiro.nome}</h4>
              <p className="text-xs text-muted-foreground truncate">
                {parceiro.descricao || 'Sem descrição'}
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
              <AvatarImage src={parceiro.logo_url} alt={parceiro.nome} />
              <AvatarFallback>{getInitials(parceiro.nome)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{parceiro.nome}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {parceiro.descricao || 'Sem descrição disponível'}
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
              {parceiro.website && (
                <DropdownMenuItem 
                  onClick={() => window.open(parceiro.website, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visitar Site
                </DropdownMenuItem>
              )}
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

        {/* Contatos */}
        <div className="space-y-2">
          {parceiro.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="truncate">{parceiro.website}</span>
            </div>
          )}
          
          {parceiro.contato_email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{parceiro.contato_email}</span>
            </div>
          )}
          
          {parceiro.contato_telefone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{parceiro.contato_telefone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParceiroCard;