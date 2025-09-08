import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FornecedorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: string;
  etapaId: string;
  subnivelId?: string;
  onFornecedorAdded: () => void;
}

interface Empresa {
  id: string;
  nome: string;
  tipo: 'cliente' | 'parceiro' | 'intragrupo';
  descricao?: string;
}

const FornecedorSelectionModal: React.FC<FornecedorSelectionModalProps> = ({
  isOpen,
  onClose,
  clienteId,
  etapaId,
  subnivelId,
  onFornecedorAdded
}) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchEmpresas();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = empresas.filter(empresa =>
      empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      ['parceiro', 'intragrupo'].includes(empresa.tipo)
    );
    setFilteredEmpresas(filtered);
  }, [searchTerm, empresas]);

  const fetchEmpresas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, tipo, descricao')
        .eq('status', true)
        .in('tipo', ['parceiro', 'intragrupo'])
        .order('nome');

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFornecedor = async (empresaId: string) => {
    setAdding(empresaId);
    try {
      const { error } = await supabase
        .from('cliente_etapa_fornecedores')
        .insert({
          cliente_id: clienteId,
          etapa_id: etapaId,
          subnivel_id: subnivelId || null,
          empresa_fornecedora_id: empresaId,
          ativo: true,
          data_mapeamento: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado com sucesso",
      });

      onFornecedorAdded();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fornecedor",
        variant: "destructive"
      });
    } finally {
      setAdding(null);
    }
  };

  const EmpresaCard = ({ empresa }: { empresa: Empresa }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ 
            backgroundColor: empresa.tipo === 'parceiro' 
              ? 'hsl(var(--fishbone-partner))' 
              : 'hsl(var(--fishbone-supplier))' 
          }}
        />
        <div>
          <div className="font-medium text-sm">{empresa.nome}</div>
          {empresa.descricao && (
            <div className="text-xs text-muted-foreground truncate max-w-xs">
              {empresa.descricao}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={empresa.tipo === 'parceiro' ? "default" : "secondary"}>
          {empresa.tipo === 'parceiro' ? 'Parceiro' : 'Intragrupo'}
        </Badge>
        <Button
          size="sm"
          onClick={() => handleAddFornecedor(empresa.id)}
          disabled={adding === empresa.id}
          className="flex items-center gap-1"
        >
          {adding === empresa.id ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          Adicionar
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Selecionar Fornecedor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Results */}
          <ScrollArea className="max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredEmpresas.length > 0 ? (
              <div className="space-y-2">
                {filteredEmpresas.map(empresa => (
                  <EmpresaCard key={empresa.id} empresa={empresa} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa disponível'}
              </div>
            )}
          </ScrollArea>

          {/* Add new company option */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "A criação de novas empresas será implementada em breve"
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Empresa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FornecedorSelectionModal;