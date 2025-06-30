
import React from 'react';
import { Empresa } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users } from 'lucide-react';

interface ParceirosListProps {
  parceiros: Empresa[];
  selectedParceiro: Empresa | null;
  onSelectParceiro: (parceiro: Empresa | null) => void;
  isLoading: boolean;
}

const ParceirosList: React.FC<ParceirosListProps> = ({
  parceiros,
  selectedParceiro,
  onSelectParceiro,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3 px-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          Parceiros
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto px-3 pb-3">
        <div className="space-y-1">
          <Button
            variant={!selectedParceiro ? "default" : "ghost"}
            size="sm"
            onClick={() => onSelectParceiro(null)}
            className="w-full justify-start text-xs h-8 px-2"
          >
            <Users className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">Todos os parceiros</span>
          </Button>
          
          {parceiros.map((parceiro) => (
            <Button
              key={parceiro.id}
              variant={selectedParceiro?.id === parceiro.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectParceiro(parceiro)}
              className="w-full justify-start text-xs h-8 px-2"
              title={parceiro.nome}
            >
              <Building2 className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{parceiro.nome}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default ParceirosList;
