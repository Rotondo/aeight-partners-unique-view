import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

const EmpresaSelector: React.FC<EmpresaSelectorProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasParceiros, setEmpresasParceiros] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    empresa_id: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'pendente',
    performance_score: 0,
    observacoes: ''
  });

  useEffect(() => {
    if (isOpen) {
      carregarEmpresas();
      carregarEmpresasParceiros();
    }
  }, [isOpen]);

  const carregarEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, descricao, tipo')
        .eq('status', true)
        .neq('tipo', 'cliente')
        .order('nome');
      
      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
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
      const idsEmpresasParceiros = new Set(data?.map(p => p.empresa_id) || []);
      setEmpresasParceiros(idsEmpresasParceiros);
    } catch (error) {
      console.error('Erro ao carregar empresas parceiros:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa_id) {
      toast({
        title: "Erro",
        description: "Selecione uma empresa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
      setFormData({
        empresa_id: '',
        status: 'ativo',
        performance_score: 0,
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const empresasDisponiveis = empresas.filter(empresa => !empresasParceiros.has(empresa.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Empresa como Parceiro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seleção de Empresa */}
          <div>
            <Label htmlFor="empresa">Empresa *</Label>
            <Select value={formData.empresa_id} onValueChange={(value) => setFormData(prev => ({ ...prev, empresa_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresasDisponiveis.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    <div>
                      <div className="font-medium">{empresa.nome}</div>
                      <div className="text-xs text-muted-foreground capitalize">{empresa.tipo}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {empresasDisponiveis.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Todas as empresas disponíveis já são parceiros
              </p>
            )}
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
              Performance Score: {formData.performance_score}%
            </Label>
            <Slider
              value={[formData.performance_score]}
              onValueChange={(value) => setFormData(prev => ({ ...prev, performance_score: value[0] }))}
              max={100}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
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
              disabled={loading || !formData.empresa_id}
            >
              {loading ? 'Adicionando...' : 'Adicionar Parceiro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaSelector;