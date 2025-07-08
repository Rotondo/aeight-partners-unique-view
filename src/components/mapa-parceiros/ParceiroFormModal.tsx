import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ParceiroMapa } from '@/types/mapa-parceiros';

interface ParceiroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dados: Partial<ParceiroMapa>) => Promise<void>;
  parceiro?: ParceiroMapa | null;
}

const ParceiroFormModal: React.FC<ParceiroFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parceiro = null
}) => {
  const [formData, setFormData] = useState<{
    nome: string;
    descricao: string;
    website: string;
    contato_email: string;
    contato_telefone: string;
    logo_url: string;
    status: 'ativo' | 'inativo' | 'pendente';
    performance_score: number;
    observacoes: string;
  }>({
    nome: '',
    descricao: '',
    website: '',
    contato_email: '',
    contato_telefone: '',
    logo_url: '',
    status: 'ativo',
    performance_score: 0,
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parceiro) {
      setFormData({
        nome: parceiro.nome || '',
        descricao: parceiro.descricao || '',
        website: parceiro.website || '',
        contato_email: parceiro.contato_email || '',
        contato_telefone: parceiro.contato_telefone || '',
        logo_url: parceiro.logo_url || '',
        status: parceiro.status,
        performance_score: parceiro.performance_score,
        observacoes: parceiro.observacoes || ''
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        website: '',
        contato_email: '',
        contato_telefone: '',
        logo_url: '',
        status: 'ativo',
        performance_score: 0,
        observacoes: ''
      });
    }
  }, [parceiro, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {parceiro ? 'Editar Parceiro' : 'Novo Parceiro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome do Parceiro *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome da empresa parceira"
                required
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Breve descrição da empresa e seus serviços..."
                rows={3}
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://exemplo.com"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
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

            {/* Email */}
            <div>
              <Label htmlFor="contato_email">Email de Contato</Label>
              <Input
                id="contato_email"
                type="email"
                value={formData.contato_email}
                onChange={(e) => handleChange('contato_email', e.target.value)}
                placeholder="contato@exemplo.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="contato_telefone">Telefone</Label>
              <Input
                id="contato_telefone"
                value={formData.contato_telefone}
                onChange={(e) => handleChange('contato_telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Logo URL */}
            <div className="md:col-span-2">
              <Label htmlFor="logo_url">URL do Logo</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            {/* Performance Score */}
            <div className="md:col-span-2">
              <Label htmlFor="performance_score">
                Performance Score: {formData.performance_score}%
              </Label>
              <Slider
                value={[formData.performance_score]}
                onValueChange={(value) => handleChange('performance_score', value[0])}
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
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais sobre o parceiro..."
                rows={3}
              />
            </div>
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
              disabled={loading || !formData.nome.trim()}
            >
              {loading ? 'Salvando...' : parceiro ? 'Atualizar' : 'Criar Parceiro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ParceiroFormModal;