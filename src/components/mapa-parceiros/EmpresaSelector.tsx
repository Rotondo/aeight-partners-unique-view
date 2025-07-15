
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
import { Check, X, Users } from 'lucide-react';

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
  jaParceiro?: boolean;
  recemAdicionada?: boolean;
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
  const [adicionados, setAdicionados] = useState<string[]>([]);

  // Onboarding microcopy
  const onboardingText = (
    <div className="mb-2 text-xs text-muted-foreground">
      <b>Selecione empresas para adicionar como parceiros.</b> Apenas empresas que ainda não são parceiras aparecerão listadas abaixo.
    </div>
  );

  // Carrega empresas já parceiras antes das empresas disponíveis
  useEffect(() => {
    if (isOpen) {
      carregarEmpresasParceiros();
      setAdicionados([]);
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
        .select('id, nome, descricao, tipo, status')
        .neq('tipo', 'cliente')
        .order('nome');
      if (error) throw error;
      const empresasDisponiveis = (data || []).map(empresa => ({
        ...empresa,
        selected: false,
        jaParceiro: empresasParceiros.has(empresa.id),
        recemAdicionada: false
      }));
      setEmpresas(empresasDisponiveis); // Não filtra mais por !jaParceiro nem por status
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

  // Adiciona parceiros, destaca os recém-adicionados
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
      setAdicionados(empresasSelecionadas.map(e => e.id));
      toast({
        title: "Sucesso",
        description: `${empresasSelecionadas.length} parceiros adicionados com sucesso.`,
      });
      setEmpresas(prev =>
        prev.map(emp =>
          empresasSelecionadas.some(e => e.id === emp.id)
            ? { ...emp, selected: false, recemAdicionada: true }
            : { ...emp, selected: false }
        )
      );
      setFormData({
        status: 'ativo',
        performance_score: 80,
        observacoes: ''
      });
      setSearchTerm('');
      setTimeout(() => {
        onClose();
        setAdicionados([]);
      }, 1500);
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

  // Filtro + status visual
  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const empresasSelecionadas = empresas.filter(emp => emp.selected);

  // Corrige seleção: clique no checkbox ou na linha, mas sem eventos duplicados
  const handleCheckboxChange = (checked: boolean, empresaId: string) => {
    setEmpresas(prev =>
      prev.map(emp =>
        emp.id === empresaId ? { ...emp, selected: checked } : emp
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
    <Dialog open={isOpen} onOpenChange={onClose} aria-label="Adicionar Empresas como Parceiros">
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]" role="dialog">
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
        {onboardingText}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Busca e Controles */}
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="search">Buscar Empresas</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome ou tipo da empresa..."
                  className="mt-1"
                  aria-label="Buscar empresa"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={carregarEmpresas}
                disabled={loading}
                aria-label="Recarregar empresas"
              >
                {loading ? 'Recarregando...' : 'Recarregar'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleTodos}
                className="flex-1"
                aria-label={empresasFiltradas.some(emp => !emp.selected) ? 'Selecionar todas' : 'Desmarcar todas'}
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
                aria-label="Limpar seleção"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Lista de Empresas */}
          <div>
            <Label>Empresas Disponíveis ({empresasFiltradas.length})</Label>
            <ScrollArea className="h-64 mt-2 border rounded-md p-2" aria-label="Lista de empresas">
              {empresasFiltradas.length > 0 ? (
                <div className="space-y-2">
                  {empresasFiltradas.map((empresa) => (
                    <div
                      key={empresa.id}
                      className={`flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer border-l-4 ${
                        empresa.recemAdicionada ? "border-green-400 bg-green-50" : "border-transparent"
                      }`}
                      onClick={() => handleRowClick(empresa.id)}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={empresa.selected}
                    >
                      <Checkbox
                        checked={empresa.selected}
                        onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, empresa.id)}
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
                      {empresa.recemAdicionada && (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">Adicionada</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <Users className="h-8 w-8 mb-2" />
                  <span>
                    {searchTerm
                      ? 'Nenhuma empresa encontrada'
                      : 'Todas as empresas já estão cadastradas como parceiros.'}
                  </span>
                  <span className="mt-2 text-xs">
                    Para cadastrar novas, adicione empresas no sistema.
                  </span>
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
              aria-label="Performance inicial"
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
              aria-label="Observações"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              aria-label="Cancelar"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || empresasSelecionadas.length === 0}
              aria-label="Adicionar parceiros"
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
