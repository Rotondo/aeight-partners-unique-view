import React from 'react';
import { Categoria } from '@/types';

interface CategoriasListProps {
  categorias: Categoria[];
  selectedCategoria: Categoria | null;
  onSelectCategoria: (categoria: Categoria) => void;
  isLoading: boolean;
}

const CategoriasList: React.FC<CategoriasListProps> = ({
  categorias,
  selectedCategoria,
  onSelectCategoria,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Carregando categorias...</p>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Nenhuma categoria disponível.</p>
      </div>
    );
  }

  return (
    <ul className="p-4 space-y-2">
      {categorias.map((categoria) => (
        <li key={categoria.id}>
          <button
            className={`w-full text-left px-4 py-2 rounded-lg transition ${
              selectedCategoria?.id === categoria.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onSelectCategoria(categoria)}
          >
            {categoria.nome}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CategoriasList;
