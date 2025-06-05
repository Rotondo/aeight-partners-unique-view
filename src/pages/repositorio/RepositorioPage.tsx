
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { RepositorioMaterial, Categoria, Empresa, RepositorioTag } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import CategoriasList from './CategoriasList';
import ParceirosList from './ParceirosList';
import MateriaisList from './MateriaisList';
import MaterialUpload from './MaterialUpload';

const RepositorioPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [tags, setTags] = useState<RepositorioTag[]>([]);
  const [materiais, setMateriais] = useState<RepositorioMaterial[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);

  // Helper function to normalize tag_categoria field
  const normalizeMateriais = (data: any[]): RepositorioMaterial[] => {
    return data.map(material => ({
      ...material,
      tag_categoria: Array.isArray(material.tag_categoria) 
        ? material.tag_categoria 
        : material.tag_categoria 
          ? [material.tag_categoria] 
          : []
    }));
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriasResult, parceirosResult, tagsResult] = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('empresas').select('*').eq('tipo', 'parceiro').order('nome'),
        supabase.from('repositorio_tags').select('*').order('nome'),
      ]);

      if (categoriasResult.error) throw categoriasResult.error;
      if (parceirosResult.error) throw parceirosResult.error;
      if (tagsResult.error) throw tagsResult.error;

      setCategorias(categoriasResult.data || []);
      setParceiros(parceirosResult.data || []);
      setTags(tagsResult.data || []);

      fetchMateriais();
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados iniciais.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMateriais = async () => {
    try {
      let query = supabase
        .from('repositorio_materiais')
        .select('*')
        .order('data_upload', { ascending: false });

      if (selectedCategoria) {
        query = query.eq('categoria_id', selectedCategoria.id);
      }

      if (selectedParceiro) {
        query = query.eq('empresa_id', selectedParceiro.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMateriais(normalizeMateriais(data || []));
    } catch (error) {
      console.error('Error fetching materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os materiais.',
        variant: 'destructive',
      });
    }
  };

  const fetchMateriaisByFilters = async () => {
    try {
      let query = supabase
        .from('repositorio_materiais')
        .select('*')
        .order('data_upload', { ascending: false });

      if (selectedCategoria) {
        query = query.eq('categoria_id', selectedCategoria.id);
      }

      if (selectedParceiro) {
        query = query.eq('empresa_id', selectedParceiro.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setMateriais(normalizeMateriais(data || []));
    } catch (error) {
      console.error('Error fetching materiais by filters:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchMateriaisByFilters();
    }
  }, [selectedCategoria, selectedParceiro, loading]);

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="browse" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Repositório de Materiais</h1>
          <TabsList>
            <TabsTrigger value="browse">Navegar</TabsTrigger>
            {user?.papel === 'admin' && (
              <TabsTrigger value="upload">Upload</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="browse" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <CategoriasList
                categorias={categorias}
                selectedCategoria={selectedCategoria}
                onSelectCategoria={setSelectedCategoria}
                isLoading={loading}
              />
            </div>

            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <ParceirosList
                parceiros={parceiros}
                selectedParceiro={selectedParceiro}
                onSelectParceiro={setSelectedParceiro}
                isLoading={loading}
              />
            </div>

            <div className="md:col-span-2 bg-card rounded-lg border shadow-sm overflow-auto">
              <MateriaisList
                materiais={materiais}
                categorias={categorias}
                parceiros={parceiros}
                tags={tags}
                isLoading={loading}
                onRefresh={fetchMateriais}
              />
            </div>
          </div>
        </TabsContent>

        {user?.papel === 'admin' && (
          <TabsContent value="upload" className="mt-0">
            <MaterialUpload
              categorias={categorias}
              parceiros={parceiros}
              tags={tags}
              onSuccess={() => {
                fetchMateriais();
                toast({
                  title: 'Sucesso',
                  description: 'Material enviado com sucesso!',
                });
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RepositorioPage;
