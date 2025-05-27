import React from 'react';
import { Empresa } from '@/types';

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
        <p className="text-gray-500">Carregando parceiros...</p>
      </div>
    );
  }

  if (parceiros.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Nenhum parceiro disponível.</p>
      </div>
    );
  }

  return (
    <ul className="p-4 space-y-2">
      {parceiros.map((parceiro) => (
        <li key={parceiro.id}>
          <button
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              selectedParceiro?.id === parceiro.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onSelectParceiro(parceiro)}
          >
            {parceiro.nome}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ParceirosList;
