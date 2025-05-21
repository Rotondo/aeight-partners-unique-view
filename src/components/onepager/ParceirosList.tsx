import React from 'react';
import { Empresa } from '@/types';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ParceirosListProps {
  parceiros: Empresa[];
  selectedParceiro: Empresa | null;
  onSelectParceiro: (parceiro: Empresa) => void;
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
      <div className="p-4">
        <h3 className="font-medium text-lg mb-4">Parceiros</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="font-medium text-lg mb-4">Parceiros</h3>
      <nav>
        <ul className="space-y-1">
          {parceiros.length > 0 ? (
            parceiros.map((parceiro) => (
              <li key={parceiro.id}>
                <button
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-left text-sm rounded-md transition",
                    selectedParceiro?.id === parceiro.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => onSelectParceiro(parceiro)}
                >
                  <Building2 size={18} className="mr-2" />
                  <span>{parceiro.nome}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum parceiro disponível nesta categoria
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default ParceirosList;
