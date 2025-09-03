import React from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

interface ClienteHeadProps {
  cliente: {
    id: string;
    nome: string;
    descricao?: string;
    logo_url?: string;
  };
  stats: {
    totalEtapas: number;
    totalFornecedores: number;
    totalParceiros: number;
    coberturaPorcentual: number;
  };
  position: { x: number; y: number };
}

const ClienteHead: React.FC<ClienteHeadProps> = ({
  cliente,
  stats,
  position
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <foreignObject
      x={position.x - 100}
      y={position.y - 60}
      width="200"
      height="120"
    >
      <Card className="h-full w-full p-4 bg-primary/5 border-primary shadow-lg">
        <div className="flex flex-col items-center h-full justify-center">
          {/* Avatar */}
          <Avatar className="h-12 w-12 mb-2">
            <AvatarImage 
              src={cliente.logo_url || ''} 
              alt={cliente.nome}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(cliente.nome)}
            </AvatarFallback>
          </Avatar>
          
          {/* Nome */}
          <div className="text-center mb-2">
            <h3 className="text-sm font-bold text-primary truncate max-w-[160px]">
              {cliente.nome}
            </h3>
            {cliente.descricao && (
              <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                {cliente.descricao}
              </p>
            )}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="text-xs">
              <Building className="h-3 w-3 mr-1" />
              {stats.totalEtapas}
            </Badge>
            <Badge 
              variant={stats.coberturaPorcentual > 80 ? "default" : "destructive"}
              className="text-xs"
            >
              {stats.coberturaPorcentual}%
            </Badge>
          </div>
        </div>
      </Card>
    </foreignObject>
  );
};

export default ClienteHead;