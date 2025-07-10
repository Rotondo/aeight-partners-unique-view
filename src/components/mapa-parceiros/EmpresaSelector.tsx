import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface Empresa {
  id: string;
  nome: string;
  descricao?: string;
  tipo: string;
}

interface EmpresaSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: { empresa_id: string; status: string; performance_score: number; observacoes?: string }) => Promise<void>;
}

interface EmpresaSelection extends Empresa {
  selected: boolean;
}

const EmpresaSelector: React.FC<EmpresaSelectorProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [empresas, setEmpresas] = useState<EmpresaSelection[]>([]);
  const [empresasParceiros, setEmpresasParceiros] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    status: 'ativo' as 'ativo' | 'inativo' | 'pendente',
    performance_score: 80,
    observacoes: ''
  });

  // Carrega empresas já parceiras antes das empresas disponíveis
  useEffect(() => {
    if (isOpen) {
      carregarEmpresasParceiros();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      carregarEmpresas();
    }
    // eslint-disable-next-line
  }, [empresasParceiros, isOpen]);

  const carregarEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, descricao, tipo')
        .eq('status', true)
        .neq('tipo', 'cliente')
        .order('nome');
      if (error) throw error;
      const empresasDisponiveis = (data || []).filter(empresa => !empresasParceiros.has(empresa.id));
      setEmpresas(empresasDisponiveis.map(empresa => ({ ...empresa, selected: false })));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as empresas.",
        variant: "destructive",
      });
    }
  };

  const carregarEmpresasParceiros = async () => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .select('empresa_id');
      if (error) throw error;
      setEmpresasParceiros(new Set(data?.map(p => p.empresa_id) || []));
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas já parceiras.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const empresasSelecionadas = empresas.filter(emp => emp.selected);
    if (empresasSelecionadas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma empresa.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      for (const empresa of empresasSelecionadas) {
        await onSave({
          empresa_id: empresa.id,
          status: formData.status,
          performance_score: formData.performance_score,
          observacoes: formData.observacoes
        });
      }
      toast({
        title: "Sucesso",
        description: `${empresasSelecionadas.length} parceiros adicionados com sucesso.`,
      });
      onClose();
      setFormData({
        status: 'ativo',
        performance_score: 80,
        observacoes: ''
      });
      setEmpresas(prev => prev.map(emp => ({ ...emp, selected: false })));
      setSearchTerm('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar parceiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const empresasSelecionadas = empresas.filter(emp => emp.selected);

  // Corrige seleção: clique no checkbox ou na linha, mas sem eventos duplicados
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, empresaId: string) => {
    e.stopPropagation();
    setEmpresas(prev =>
      prev.map(emp =>
        emp.id === empresaId ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const handleRowClick = (empresaId: string) => {
    setEmpresas(prev =>
      prev.map(emp =>
        emp.id === empresaId ? { ...emp, selected: !emp.selected } : emp
      )
    );
  };

  const toggleTodos = () => {
    const todosNaoSelecionados = empresasFiltradas.some(emp => !emp.selected);
    setEmpresas(prev =>
      prev.map(emp =>
        empresasFiltradas.find(filtered => filtered.id === emp.id)
          ? { ...emp, selected: todosNaoSelecionados }
          : emp
      )
    );
  };

  const limparSelecao = () => {
    setEmpresas(prev => prev.map(emp => ({ ...emp, selected: false })));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Adicionar Empresas como Parceiros
            {empresasSelecionadas.length > 0 && (
              <Badge variant="secondary">
                {empresasSelecionadas.length} selecionadas
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Busca e Controles */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="search">Buscar Empresas</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou tipo da empresa..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleTodos}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                {empresasFiltradas.some(emp => !emp.selected) ? 'Selecionar Todas' : 'Desmarcar Todas'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={limparSelecao}
                disabled={empresasSelecionadas.length === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Lista de Empresas */}
          <div>
            <Label>Empresas Disponíveis ({empresasFiltradas.length})</Label>
            <ScrollArea className="h-64 mt-2 border rounded-md p-2">
              {empresasFiltradas.length > 0 ? (
                <div className="space-y-2">
                  {empresasFiltradas.map((empresa) => (
                    <div
                      key={empresa.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => handleRowClick(empresa.id)}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={empresa.selected}
                    >
                      <Checkbox
                        checked={empresa.selected}
                        onChange={e => handleCheckboxChange(e, empresa.id)}
                        onClick={e => e.stopPropagation()}
                        tabIndex={-1}
                        aria-label={`Selecionar empresa ${empresa.nome}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{empresa.nome}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {empresa.tipo} {empresa.descricao && `• ${empresa.descricao}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nenhuma empresa encontrada' : 'Todas as empresas já são parceiros'}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Performance Score */}
          <div>
            <Label htmlFor="performance_score">
              Performance Inicial: {formData.performance_score}%
            </Label>
            <Slider
              value={[formData.performance_score]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, performance_score: value[0] }))}
              max={100}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Será aplicado a todos os parceiros selecionados
            </p>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre o parceiro..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || empresasSelecionadas.length === 0}
            >
              {loading
                ? 'Adicionando...'
                : `Adicionar ${empresasSelecionadas.length} Parceiro${empresasSelecionadas.length !== 1 ? 's' : ''}`
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaSelector;
