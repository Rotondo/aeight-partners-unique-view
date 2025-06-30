
import React from 'react';
import { Categoria } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Folder } from 'lucide-react';

interface CategoriasListProps {
  categorias: Categoria[];
  selectedCategoria: Categoria | null;
  onSelectCategoria: (categoria: Categoria | null) => void;
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
          <FolderOpen className="h-4 w-4" />
          Categorias
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto px-3 pb-3">
        <div className="space-y-1">
          <Button
            variant={!selectedCategoria ? "default" : "ghost"}
            size="sm"
            onClick={() => onSelectCategoria(null)}
            className="w-full justify-start text-xs h-8 px-2"
          >
            <Folder className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">Todas as categorias</span>
          </Button>
          
          {categorias.map((categoria) => (
            <Button
              key={categoria.id}
              variant={selectedCategoria?.id === categoria.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectCategoria(categoria)}
              className="w-full justify-start text-xs h-8 px-2"
              title={categoria.nome}
            >
              <Folder className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{categoria.nome}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </div>
  );
};

export default CategoriasList;
