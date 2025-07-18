
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Categoria, Empresa, OnePager } from '@/types';
import CategoriasList from '@/components/onepager/CategoriasList';
import ParceirosList from '@/components/onepager/ParceirosList';
import OnePagerViewer from '@/components/onepager/OnePagerViewer';
import OnePagerUpload from '@/components/onepager/OnePagerUpload';
import OnePagerSearch from '@/components/onepager/OnePagerSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrivateData } from '@/components/privacy/PrivateData';
import { Button } from '@/components/ui/button';

const OnePagerPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);
  const [onePager, setOnePager] = useState<OnePager | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Carrega categorias ao abrir a página
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nome');

        if (error) throw error;

        if (data) {
          setCategorias(data as Categoria[]);
          // Seleciona a primeira categoria por padrão
          if (data.length > 0) {
            setSelectedCategoria(data[0] as Categoria);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
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
  }, [toast]);

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
        console.log('Fetching parceiros for categoria:', selectedCategoria.id);

        // Busca IDs das empresas vinculadas à categoria
        const { data: empresaCategoriaData, error: empresaCategoriaError } = await supabase
          .from('empresa_categoria')
          .select('empresa_id')
          .eq('categoria_id', selectedCategoria.id);

        if (empresaCategoriaError) {
          console.error('Error fetching empresa_categoria:', empresaCategoriaError);
          throw empresaCategoriaError;
        }

        console.log('Empresa categoria data:', empresaCategoriaData);

        if (empresaCategoriaData && empresaCategoriaData.length > 0) {
          const empresaIds = empresaCategoriaData.map((item: any) => item.empresa_id);
          console.log('Empresa IDs:', empresaIds);

          // Busca dados das empresas parceiras
          const { data: empresas, error: empresasError } = await supabase
            .from('empresas')
            .select('*')
            .in('id', empresaIds)
            .eq('tipo', 'parceiro')
            .eq('status', true)
            .order('nome');

          if (empresasError) {
            console.error('Error fetching empresas:', empresasError);
            throw empresasError;
          }

          console.log('Empresas found:', empresas);

          if (empresas && empresas.length > 0) {
            setParceiros(empresas as Empresa[]);
            setSelectedParceiro(empresas[0] as Empresa);
          } else {
            setParceiros([]);
            setSelectedParceiro(null);
          }
        } else {
          setParceiros([]);
          setSelectedParceiro(null);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
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
  }, [selectedCategoria, toast]);

  // Carrega OnePager para o parceiro selecionado e categoria selecionada
  useEffect(() => {
    if (!selectedParceiro || !selectedCategoria) {
      setOnePager(null);
      return;
    }

    const fetchOnePager = async () => {
      try {
        console.log('Fetching OnePager for:', {
          empresa_id: selectedParceiro.id,
          categoria_id: selectedCategoria.id
        });

        const { data, error } = await supabase
          .from('onepager')
          .select('*')
          .eq('empresa_id', selectedParceiro.id)
          .eq('categoria_id', selectedCategoria.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching onepager:', error);
          throw error;
        }

        console.log('OnePager data found:', data);
        setOnePager(data as OnePager || null);

        if (!data) {
          console.log('No OnePager found for this partner and category combination');
        }
      } catch (error) {
        console.error('Error fetching onepager:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o OnePager.',
          variant: 'destructive',
        });
        setOnePager(null);
      }
    };

    fetchOnePager();
  }, [selectedParceiro, selectedCategoria, toast]);

  // Ao clicar em um parceiro, apenas seleciona (não abre modal!)
  const handleSelectParceiro = (parceiro: Empresa) => {
    setSelectedParceiro(parceiro);
  };

  // Ao clicar na imagem reduzida, abre o modal
  const handleOpenModal = () => {
    if (onePager) setModalAberto(true);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="view" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">OnePager de Parceiros</h1>
          <TabsList>
            <TabsTrigger value="view">Visualizar</TabsTrigger>
            <TabsTrigger value="search">Buscar</TabsTrigger>
            {user?.papel === 'admin' && (
              <TabsTrigger value="upload">Upload</TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Aba Visualizar */}
        <TabsContent value="view" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
            {/* Menu lateral esquerdo - Categorias */}
            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <CategoriasList
                categorias={categorias}
                selectedCategoria={selectedCategoria}
                onSelectCategoria={setSelectedCategoria}
                isLoading={loading}
              />
            </div>
            {/* Centro - Lista de Parceiros */}
            <div className="md:col-span-1 bg-card rounded-lg border shadow-sm overflow-auto">
              <ParceirosList
                parceiros={parceiros}
                selectedParceiro={selectedParceiro}
                onSelectParceiro={handleSelectParceiro}
                isLoading={loading}
              />
            </div>
            {/* Direita - Versão reduzida do OnePager OU mensagem */}
            <div className="md:col-span-2 bg-card rounded-lg border shadow-sm flex items-center justify-center">
              {selectedParceiro ? (
                onePager ? (
                  <div
                    className="w-full max-w-3xl cursor-pointer hover:shadow-lg transition"
                    onClick={handleOpenModal}
                    title="Clique para ampliar"
                  >
                    <OnePagerViewer
                      onePager={onePager}
                      parceiro={selectedParceiro}
                      isLoading={false}
                    />
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <span className="text-gray-400 text-lg">
                      OnePager não encontrado para{' '}
                      <PrivateData type="company">
                        {selectedParceiro.nome}
                      </PrivateData>
                      {' '}na categoria{' '}
                      <PrivateData type="generic">
                        {selectedCategoria?.nome}
                      </PrivateData>
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Verifique se existe um OnePager cadastrado para este parceiro nesta categoria específica.
                    </p>
                  </div>
                )
              ) : (
                <span className="text-gray-400 text-lg text-center w-full">
                  Selecione um parceiro para visualizar o One Pager
                </span>
              )}
            </div>
          </div>

          {/* Modal One Pager */}
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0">
              <DialogHeader>
                <DialogTitle>
                  {selectedParceiro ? (
                    <>
                      OnePager:{' '}
                      <PrivateData type="company">
                        {selectedParceiro.nome}
                      </PrivateData>
                    </>
                  ) : (
                    "OnePager"
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-full overflow-auto">
                <OnePagerViewer
                  onePager={onePager}
                  parceiro={selectedParceiro}
                  isLoading={loading}
                />
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Aba Buscar */}
        <TabsContent value="search" className="mt-0">
          <OnePagerSearch categorias={categorias} />
        </TabsContent>

        {/* Aba Upload (apenas admin) */}
        {user?.papel === 'admin' && (
          <TabsContent value="upload" className="mt-0">
            <OnePagerUpload
              categorias={categorias}
              onSuccess={() => {
                // Refaz o carregamento caso faça upload de novo arquivo
                if (selectedParceiro && selectedCategoria) {
                  const fetchOnePager = async () => {
                    const { data } = await supabase
                      .from('onepager')
                      .select('*')
                      .eq('empresa_id', selectedParceiro.id)
                      .eq('categoria_id', selectedCategoria.id)
                      .maybeSingle();

                    setOnePager(data as OnePager || null);
                  };
                  fetchOnePager();
                }
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default OnePagerPage;
