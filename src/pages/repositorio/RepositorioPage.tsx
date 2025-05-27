import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Categoria, Empresa, RepositorioMaterial, RepositorioTag } from '@/types';
// Corrigido: imports agora da pasta pages/repositorio
import CategoriasList from './CategoriasList';
import ParceirosList from './ParceirosList';
import MateriaisList from './MateriaisList';
import MaterialUpload from './MaterialUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

const RepositorioPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);
  const [materiais, setMateriais] = useState<RepositorioMaterial[]>([]);
  const [tags, setTags] = useState<RepositorioTag[]>([]);

  // Carrega categorias ao abrir a página
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data, error } = await supabase.from('categorias').select('*').order('nome');
        if (error) throw error;
        setCategorias(data || []);
        if (data && data.length > 0) setSelectedCategoria(data[0]);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as categorias.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  // Carrega parceiros vinculados à categoria selecionada
  useEffect(() => {
    if (!selectedCategoria) {
      setParceiros([]);
      setSelectedParceiro(null);
      return;
    }

    const fetchParceiros = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('empresa_categoria')
          .select('empresa_id')
          .eq('categoria_id', selectedCategoria.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const empresaIds = data.map((item: any) => item.empresa_id);
          const { data: empresas, error: empresasError } = await supabase
            .from('empresas')
            .select('*')
            .in('id', empresaIds)
            .eq('tipo', 'parceiro')
            .order('nome');

          if (empresasError) throw empresasError;

          setParceiros(empresas || []);
          if (empresas && empresas.length > 0) setSelectedParceiro(empresas[0]);
        } else {
          setParceiros([]);
          setSelectedParceiro(null);
        }
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os parceiros desta categoria.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParceiros();
  }, [selectedCategoria]);

  // Carrega materiais para o parceiro e categoria selecionados
  useEffect(() => {
    if (!selectedParceiro || !selectedCategoria) {
      setMateriais([]);
      return;
    }

    const fetchMateriais = async () => {
      try {
        const { data, error } = await supabase
          .from('repositorio_materiais')
          .select('*')
          .eq('empresa_id', selectedParceiro.id)
          .eq('categoria_id', selectedCategoria.id);

        if (error) throw error;
        setMateriais(data || []);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os materiais.',
          variant: 'destructive',
        });
      }
    };

    fetchMateriais();
  }, [selectedParceiro, selectedCategoria]);

  // Carrega tags para exibição no formulário de upload
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data, error } = await supabase.from('repositorio_tags').select('*').order('nome');
        if (error) throw error;
        setTags(data || []);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as tags.',
          variant: 'destructive',
        });
      }
    };

    fetchTags();
  }, []);

  // Atualiza os materiais ao realizar upload
  const handleUploadSuccess = () => {
    if (selectedParceiro && selectedCategoria) {
      const fetchMateriais = async () => {
        const { data } = await supabase
          .from('repositorio_materiais')
          .select('*')
          .eq('empresa_id', selectedParceiro.id)
          .eq('categoria_id', selectedCategoria.id);

        setMateriais(data || []);
      };
      fetchMateriais();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="view" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Repositório de Parceiros</h1>
          <TabsList>
            <TabsTrigger value="view">Visualizar</TabsTrigger>
            {user?.papel === 'admin' && <TabsTrigger value="upload">Upload</TabsTrigger>}
          </TabsList>
        </div>

        {/* Aba Visualizar */}
        <TabsContent value="view" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
            {/* Categorias */}
            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <CategoriasList
                categorias={categorias}
                selectedCategoria={selectedCategoria}
                onSelectCategoria={setSelectedCategoria}
                isLoading={loading}
              />
            </div>
            {/* Parceiros */}
            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <ParceirosList
                parceiros={parceiros}
                selectedParceiro={selectedParceiro}
                onSelectParceiro={setSelectedParceiro}
                isLoading={loading}
              />
            </div>
            {/* Materiais */}
            <div className="md:col-span-2 bg-card rounded-lg border shadow-sm overflow-auto">
              <MateriaisList materiais={materiais} isLoading={loading} />
            </div>
          </div>
        </TabsContent>

        {/* Aba Upload */}
        {user?.papel === 'admin' && (
          <TabsContent value="upload" className="mt-0">
            <MaterialUpload
              categorias={categorias}
              parceiros={parceiros}
              tags={tags}
              onSuccess={handleUploadSuccess}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default RepositorioPage;
