
import React from 'react';
import { Categoria } from '@/types';
import { cn } from '@/lib/utils';
import { FolderIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="font-medium text-lg mb-4">Categorias</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-medium text-lg mb-4">Categorias</h3>
      <nav>
        <ul className="space-y-1">
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <li key={categoria.id}>
                <button
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-left text-sm rounded-md transition",
                    selectedCategoria?.id === categoria.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => onSelectCategoria(categoria)}
                >
                  <FolderIcon size={18} className="mr-2" />
                  <span>{categoria.nome}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma categoria disponível
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default CategoriasList;
