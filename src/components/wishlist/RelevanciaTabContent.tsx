import React from 'react';
import ParceiroRelevanceCard from './ParceiroRelevanceCard';
import { TrendingUp } from 'lucide-react';

interface ParceiroRelevance {
  id: string;
  nome: string;
  // Add other properties as needed
}

interface RelevanciaTabContentProps {
  loadingRelevance: boolean;
  filteredParceiros: ParceiroRelevance[];
  searchTerm: string;
}

const CONSOLE_PREFIX = "[RelevanciaTabContent]";

const RelevanciaTabContent: React.FC<RelevanciaTabContentProps> = ({
  loadingRelevance,
  filteredParceiros,
  searchTerm,
}) => {
  React.useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Rendering with:`, {
      loading: loadingRelevance,
      parceiros: filteredParceiros.length,
      searchTerm: searchTerm
    });
  }, [loadingRelevance, filteredParceiros.length, searchTerm]);

  if (loadingRelevance) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Calculando relevância...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredParceiros.map((parceiro) => (
        <ParceiroRelevanceCard key={parceiro.id} parceiro={parceiro} />
      ))}

      {filteredParceiros.length === 0 && (
        <div className="col-span-full py-12 text-center text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
          <div className="text-lg font-semibold mb-1">
            Nenhum parceiro encontrado
          </div>
          <div>
            {searchTerm
              ? "Tente ajustar os filtros de busca"
              : "Aguarde o cálculo da relevância dos parceiros"}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelevanciaTabContent;