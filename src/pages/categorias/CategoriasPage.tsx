
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Categoria } from '@/types';
import CategoriasList from '@/pages/repositorio/CategoriasList';

const CategoriasPage: React.FC = () => {
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        setCategorias(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as categorias.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategorias();
  }, [toast]);

  const handleSelectCategoria = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-muted-foreground">Gerencie as categorias do sistema</p>
      </div>
      
      <CategoriasList
        categorias={categorias}
        selectedCategoria={selectedCategoria}
        onSelectCategoria={handleSelectCategoria}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CategoriasPage;
