
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { OnePager, Empresa, Categoria } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OnePagerViewer from './OnePagerViewer';
import OnePagerForm from './OnePagerForm';

interface OnePagerSearchProps {
  categorias: Categoria[];
}

const OnePagerSearch: React.FC<OnePagerSearchProps> = ({ categorias }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [onePagers, setOnePagers] = useState<OnePager[]>([]);
  const [empresas, setEmpresas] = useState<{[key: string]: Empresa}>({});
  const [loading, setLoading] = useState(false);
  const [selectedOnePager, setSelectedOnePager] = useState<OnePager | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchOnePagers();
    fetchEmpresas();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchOnePagers();
      } else {
        fetchOnePagers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*');
      
      if (error) throw error;
      
      const empresasMap = data.reduce((acc, empresa) => {
        acc[empresa.id] = empresa;
        return acc;
      }, {} as {[key: string]: Empresa});
      
      setEmpresas(empresasMap);
    } catch (error) {
      console.error('Error fetching empresas:', error);
    }
  };

  const fetchOnePagers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('onepager')
        .select('*')
        .order('data_upload', { ascending: false });
      
      if (error) throw error;
      setOnePagers(data || []);
    } catch (error) {
      console.error('Error fetching onepagers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os OnePagers.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const searchOnePagers = async () => {
    if (!searchTerm.trim()) {
      fetchOnePagers();
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('onepager')
        .select('*')
        .or(`nome.ilike.%${searchTerm}%,icp.ilike.%${searchTerm}%,oferta.ilike.%${searchTerm}%,diferenciais.ilike.%${searchTerm}%,cases_sucesso.ilike.%${searchTerm}%,big_numbers.ilike.%${searchTerm}%,ponto_forte.ilike.%${searchTerm}%,ponto_fraco.ilike.%${searchTerm}%`)
        .order('data_upload', { ascending: false });
      
      if (error) throw error;
      setOnePagers(data || []);
    } catch (error) {
      console.error('Error searching onepagers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a busca.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (onePager: OnePager) => {
    setSelectedOnePager(onePager);
    setViewModalOpen(true);
  };

  const handleEdit = (onePager: OnePager) => {
    setSelectedOnePager(onePager);
    setEditModalOpen(true);
  };

  const handleDelete = async (onePager: OnePager) => {
    if (!confirm('Tem certeza que deseja excluir este OnePager?')) {
      return;
    }

    try {
      // Remove relacionamentos com clientes
      await supabase
        .from('onepager_clientes')
        .delete()
        .eq('onepager_id', onePager.id);

      // Remove arquivo do storage se existir
      if (onePager.arquivo_upload) {
        await supabase.storage
          .from('onepagers')
          .remove([onePager.arquivo_upload]);
      }

      // Remove o OnePager
      const { error } = await supabase
        .from('onepager')
        .delete()
        .eq('id', onePager.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'OnePager excluído com sucesso.',
      });

      fetchOnePagers();
    } catch (error) {
      console.error('Error deleting onepager:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o OnePager.',
        variant: 'destructive',
      });
    }
  };

  const getCategoriaName = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria?.nome || 'N/A';
  };

  const getEmpresaName = (empresaId: string) => {
    return empresas[empresaId]?.nome || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, ICP, oferta, diferenciais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Carregando OnePagers...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {onePagers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum OnePager encontrado para sua busca.' : 'Nenhum OnePager cadastrado.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            onePagers.map((onePager) => (
              <Card key={onePager.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {onePager.nome || getEmpresaName(onePager.empresa_id)}
                        {onePager.nota_quadrante && (
                          <Badge variant="outline">
                            Nota: {onePager.nota_quadrante}
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary">
                          {getEmpresaName(onePager.empresa_id)}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoriaName(onePager.categoria_id)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(onePager)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(onePager)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(onePager)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {onePager.icp && (
                      <div>
                        <span className="font-medium text-sm">ICP:</span>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {onePager.icp}
                        </p>
                      </div>
                    )}
                    {onePager.oferta && (
                      <div>
                        <span className="font-medium text-sm">Oferta:</span>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {onePager.oferta}
                        </p>
                      </div>
                    )}
                    {onePager.contato_nome && (
                      <div>
                        <span className="font-medium text-sm">Contato:</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          {onePager.contato_nome}
                          {onePager.contato_email && ` (${onePager.contato_email})`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-5xl w-[90vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {selectedOnePager 
                ? `OnePager: ${selectedOnePager.nome || getEmpresaName(selectedOnePager.empresa_id)}`
                : "OnePager"
              }
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-auto">
            <OnePagerViewer
              onePager={selectedOnePager}
              parceiro={selectedOnePager ? empresas[selectedOnePager.empresa_id] : null}
              isLoading={false}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Editar OnePager</DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full overflow-auto p-6 pt-0">
            <OnePagerForm
              categorias={categorias}
              editingOnePager={selectedOnePager}
              onSuccess={() => {
                setEditModalOpen(false);
                fetchOnePagers();
                toast({
                  title: 'Sucesso',
                  description: 'OnePager atualizado com sucesso!',
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnePagerSearch;
