
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { RepositorioMaterial, RepositorioLink, Categoria, Empresa, RepositorioTag } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAuth } from '@/hooks/useAuth';
import CategoriasList from './CategoriasList';
import ParceirosList from './ParceirosList';
import MateriaisList from './MateriaisList';
import MaterialUpload from './MaterialUpload';
import LinksList from './LinksList';
import LinkUpload from './LinkUpload';

const RepositorioPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [allParceiros, setAllParceiros] = useState<Empresa[]>([]);
  const [tags, setTags] = useState<RepositorioTag[]>([]);
  const [materiais, setMateriais] = useState<RepositorioMaterial[]>([]);
  const [links, setLinks] = useState<RepositorioLink[]>([]);
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

  const normalizeLinks = (data: any[]): RepositorioLink[] => {
    return data.map(link => ({
      ...link,
      tag_categoria: Array.isArray(link.tag_categoria) 
        ? link.tag_categoria 
        : link.tag_categoria 
          ? [link.tag_categoria] 
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
        supabase.from('empresas').select('*').eq('tipo', 'parceiro').eq('status', true).order('nome'),
        supabase.from('repositorio_tags').select('*').order('nome'),
      ]);

      if (categoriasResult.error) throw categoriasResult.error;
      if (parceirosResult.error) throw parceirosResult.error;
      if (tagsResult.error) throw tagsResult.error;

      setCategorias(categoriasResult.data || []);
      setAllParceiros(parceirosResult.data || []);
      setParceiros(parceirosResult.data || []);
      setTags(tagsResult.data || []);

      fetchMateriais();
      fetchLinks();
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

  // Filtrar parceiros quando categoria é selecionada
  useEffect(() => {
    const filterParceiros = async () => {
      if (!selectedCategoria) {
        setParceiros(allParceiros);
        setSelectedParceiro(null);
        return;
      }

      try {
        console.log('Filtering parceiros for categoria:', selectedCategoria.id);
        
        // Buscar empresas vinculadas à categoria
        const { data: empresaCategoriaData, error } = await supabase
          .from('empresa_categoria')
          .select('empresa_id')
          .eq('categoria_id', selectedCategoria.id);

        if (error) {
          console.error('Error fetching empresa_categoria:', error);
          throw error;
        }

        console.log('Empresa categoria data:', empresaCategoriaData);

        if (empresaCategoriaData && empresaCategoriaData.length > 0) {
          const empresaIds = empresaCategoriaData.map(item => item.empresa_id);
          console.log('Empresa IDs for filtering:', empresaIds);
          
          // Filtrar parceiros que estão vinculados à categoria
          const parceirosFiltrados = allParceiros.filter(parceiro => 
            empresaIds.includes(parceiro.id)
          );
          
          console.log('Filtered parceiros:', parceirosFiltrados);
          setParceiros(parceirosFiltrados);
          
          // Reset seleção de parceiro se o atual não estiver na lista filtrada
          if (selectedParceiro && !empresaIds.includes(selectedParceiro.id)) {
            setSelectedParceiro(null);
          }
        } else {
          console.log('No parceiros found for this categoria');
          setParceiros([]);
          setSelectedParceiro(null);
        }
      } catch (error) {
        console.error('Error filtering parceiros:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao filtrar parceiros por categoria.',
          variant: 'destructive',
        });
      }
    };

    filterParceiros();
  }, [selectedCategoria, allParceiros, selectedParceiro]);

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

  const fetchLinks = async () => {
    try {
      let query = supabase
        .from('repositorio_links')
        .select('*')
        .eq('status', 'ativo')
        .order('data_upload', { ascending: false });

      if (selectedCategoria) {
        query = query.eq('categoria_id', selectedCategoria.id);
      }

      if (selectedParceiro) {
        query = query.eq('empresa_id', selectedParceiro.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLinks(normalizeLinks(data || []));
    } catch (error) {
      console.error('Error fetching links:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os links.',
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

  const fetchLinksByFilters = async () => {
    try {
      let query = supabase
        .from('repositorio_links')
        .select('*')
        .eq('status', 'ativo')
        .order('data_upload', { ascending: false });

      if (selectedCategoria) {
        query = query.eq('categoria_id', selectedCategoria.id);
      }

      if (selectedParceiro) {
        query = query.eq('empresa_id', selectedParceiro.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLinks(normalizeLinks(data || []));
    } catch (error) {
      console.error('Error fetching links by filters:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchMateriaisByFilters();
      fetchLinksByFilters();
    }
  }, [selectedCategoria, selectedParceiro, loading]);

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="browse" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Repositório de Materiais</h1>
          <TabsList>
            <TabsTrigger value="browse">Navegar</TabsTrigger>
            {user?.papel === 'admin' && (
              <>
                <TabsTrigger value="upload">Upload Arquivo</TabsTrigger>
                <TabsTrigger value="links">Adicionar Link</TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="browse" className="mt-0">
          <div className="h-[calc(100vh-200px)]">
            <ResizablePanelGroup direction="horizontal" className="min-h-full">
              {/* Painel de Categorias */}
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                <div className="h-full bg-card rounded-lg border shadow-sm overflow-auto">
                  <CategoriasList
                    categorias={categorias}
                    selectedCategoria={selectedCategoria}
                    onSelectCategoria={setSelectedCategoria}
                    isLoading={loading}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Painel de Parceiros */}
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                <div className="h-full bg-card rounded-lg border shadow-sm overflow-auto">
                  <ParceirosList
                    parceiros={parceiros}
                    selectedParceiro={selectedParceiro}
                    onSelectParceiro={setSelectedParceiro}
                    isLoading={loading}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Painel de Materiais */}
              <ResizablePanel defaultSize={50} minSize={30}>
                <div className="h-full bg-card rounded-lg border shadow-sm overflow-auto">
                  <MateriaisList
                    materiais={materiais}
                    categorias={categorias}
                    parceiros={allParceiros}
                    tags={tags}
                    isLoading={loading}
                    onRefresh={fetchMateriais}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Painel de Links */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full bg-card rounded-lg border shadow-sm overflow-auto">
                  <LinksList
                    links={links}
                    categorias={categorias}
                    parceiros={allParceiros}
                    tags={tags}
                    isLoading={loading}
                    onRefresh={fetchLinks}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </TabsContent>

        {user?.papel === 'admin' && (
          <>
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

            <TabsContent value="links" className="mt-0">
              <LinkUpload
                categorias={categorias}
                parceiros={parceiros}
                tags={tags}
                onSuccess={() => {
                  fetchLinks();
                  toast({
                    title: 'Sucesso',
                    description: 'Link adicionado com sucesso!',
                  });
                }}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default RepositorioPage;
