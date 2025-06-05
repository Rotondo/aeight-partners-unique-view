
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { OnePager, Categoria, Empresa } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import CategoriasList from '@/components/onepager/CategoriasList';
import ParceirosList from '@/components/onepager/ParceirosList';
import { OnePagerUpload } from '@/components/onepager/OnePagerUpload';
import { OnePagerViewer } from '@/components/onepager/OnePagerViewer';
import { OnePagerSearch } from '@/components/onepager/OnePagerSearch';

const OnePagerPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [allParceiros, setAllParceiros] = useState<Empresa[]>([]);
  const [onePagers, setOnePagers] = useState<OnePager[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);
  const [selectedOnePager, setSelectedOnePager] = useState<OnePager | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [categoriasResult, parceirosResult] = await Promise.all([
        supabase.from('categorias').select('*').order('nome'),
        supabase.from('empresas').select('*').eq('tipo', 'parceiro').eq('status', true).order('nome'),
      ]);

      if (categoriasResult.error) throw categoriasResult.error;
      if (parceirosResult.error) throw parceirosResult.error;

      setCategorias(categoriasResult.data || []);
      setAllParceiros(parceirosResult.data || []);
      setParceiros(parceirosResult.data || []);

      fetchOnePagers();
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

  const fetchOnePagers = async () => {
    try {
      let query = supabase
        .from('onepager')
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

      setOnePagers(data || []);
    } catch (error) {
      console.error('Error fetching OnePagers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os OnePagers.',
        variant: 'destructive',
      });
    }
  };

  const fetchOnePagersByFilters = async () => {
    try {
      let query = supabase
        .from('onepager')
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

      setOnePagers(data || []);
    } catch (error) {
      console.error('Error fetching OnePagers by filters:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchOnePagersByFilters();
    }
  }, [selectedCategoria, selectedParceiro, loading]);

  const handleViewOnePager = (onePager: OnePager) => {
    setSelectedOnePager(onePager);
    setViewerOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="browse" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">OnePager</h1>
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
              <OnePagerSearch
                onePagers={onePagers}
                categorias={categorias}
                parceiros={allParceiros}
                isLoading={loading}
                onView={handleViewOnePager}
                onRefresh={fetchOnePagers}
              />
            </div>
          </div>
        </TabsContent>

        {user?.papel === 'admin' && (
          <TabsContent value="upload" className="mt-0">
            <OnePagerUpload
              categorias={categorias}
              parceiros={parceiros}
              onSuccess={() => {
                fetchOnePagers();
                toast({
                  title: 'Sucesso',
                  description: 'OnePager enviado com sucesso!',
                });
              }}
            />
          </TabsContent>
        )}
      </Tabs>

      {selectedOnePager && (
        <OnePagerViewer
          onePager={selectedOnePager}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </div>
  );
};

export default OnePagerPage;
