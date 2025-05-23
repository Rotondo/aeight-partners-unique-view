import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Empresa, Categoria, OnePager } from "@/types";
import OnePagerViewer from "@/components/onepager/OnePagerViewer";
import { File } from "lucide-react";

const OnePagerPage: React.FC = () => {
  const { toast } = useToast();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);

  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [selectedParceiro, setSelectedParceiro] = useState<Empresa | null>(null);

  const [onePager, setOnePager] = useState<OnePager | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado do modal de visualização (tela cheia)
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
    // eslint-disable-next-line
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

          if (empresas) {
            setParceiros(empresas as Empresa[]);
            if (empresas.length > 0) {
              setSelectedParceiro(empresas[0] as Empresa);
            } else {
              setSelectedParceiro(null);
            }
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
    // eslint-disable-next-line
  }, [selectedCategoria]);

  // Carrega OnePager para o parceiro selecionado e categoria selecionada
  useEffect(() => {
    if (!selectedParceiro || !selectedCategoria) {
      setOnePager(null);
      return;
    }

    const fetchOnePager = async () => {
      try {
        const { data, error } = await supabase
          .from('onepager')
          .select('*')
          .eq('empresa_id', selectedParceiro.id)
          .eq('categoria_id', selectedCategoria.id)
          .maybeSingle();

        if (error) throw error;

        setOnePager(data as OnePager | null);
      } catch (error) {
        console.error('Error fetching OnePager:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o OnePager.',
          variant: 'destructive',
        });
      }
    };

    fetchOnePager();
    // eslint-disable-next-line
  }, [selectedParceiro, selectedCategoria]);

  // NOVO: função para abrir modal ao clicar no card
  const handleAbrirModal = () => {
    setModalAberto(true);
  };

  // NOVO: função para fechar modal
  const handleFecharModal = () => {
    setModalAberto(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc', padding: '40px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 32 }}>
        {/* Coluna categorias */}
        <div style={{ width: 240 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Categorias</h3>
          {categorias.length === 0 ? (
            <div style={{ color: '#888' }}>Nenhuma categoria disponível</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {categorias.map((cat) => (
                <li
                  key={cat.id}
                  style={{
                    padding: '10px 18px',
                    marginBottom: 8,
                    background: selectedCategoria?.id === cat.id ? '#e7e8fc' : 'transparent',
                    borderRadius: 8,
                    fontWeight: selectedCategoria?.id === cat.id ? 600 : 400,
                    color: selectedCategoria?.id === cat.id ? '#22223b' : '#444',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedCategoria(cat)}
                >
                  {cat.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna parceiros */}
        <div style={{ width: 260 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Parceiros</h3>
          {parceiros.length === 0 ? (
            <div style={{ color: '#888' }}>Nenhum parceiro disponível</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {parceiros.map((parc) => (
                <li
                  key={parc.id}
                  style={{
                    padding: '9px 16px',
                    marginBottom: 7,
                    background: selectedParceiro?.id === parc.id ? '#e8f9f1' : 'transparent',
                    borderRadius: 8,
                    fontWeight: selectedParceiro?.id === parc.id ? 600 : 400,
                    color: selectedParceiro?.id === parc.id ? '#187c5c' : '#444',
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedParceiro(parc)}
                >
                  {parc.nome}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna OnePager */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>OnePager</h3>
          {/* Versão reduzida (card) do OnePager */}
          <div
            style={{
              border: '1.5px solid #ececec',
              borderRadius: 12,
              padding: 24,
              background: '#fff',
              minHeight: 220,
              cursor: onePager ? 'pointer' : 'default',
              transition: 'box-shadow 0.2s',
              boxShadow: onePager ? '0 4px 16px rgba(0,0,0,0.07)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={onePager ? handleAbrirModal : undefined}
            title={onePager ? "Clique para ver em tela cheia" : undefined}
          >
            {loading ? (
              <div style={{ color: '#aaa', fontSize: 16 }}>Carregando...</div>
            ) : !selectedParceiro ? (
              <div style={{ color: '#aaa', textAlign: 'center' }}>
                <File size={48} className="mx-auto mb-4" />
                Selecione um parceiro para visualizar o OnePager
              </div>
            ) : !onePager ? (
              <div style={{ color: '#aaa', textAlign: 'center' }}>
                <File size={48} className="mx-auto mb-4" />
                Nenhum OnePager disponível para este parceiro
              </div>
            ) : (
              <OnePagerViewer
                onePager={onePager}
                parceiro={selectedParceiro}
                isLoading={loading}
                reduzido
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de visualização em tela cheia */}
      {modalAberto && onePager && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(24,28,34,0.77)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleFecharModal}
        >
          <div
            style={{
              background: '#fff',
              padding: 32,
              borderRadius: 18,
              minWidth: 320,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleFecharModal}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#eee',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontWeight: 700,
                fontSize: 20,
                color: '#222',
                cursor: 'pointer'
              }}
              aria-label="Fechar"
            >
              ×
            </button>
            <OnePagerViewer
              onePager={onePager}
              parceiro={selectedParceiro}
              isLoading={loading}
              reduzido={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OnePagerPage;
