
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EtapaJornada } from '@/types/mapa-parceiros';

interface SubnivelFormData {
  nome: string;
  descricao: string;
  ordem: number;
  ativo: boolean;
  etapa_id: string;
}

interface SubnivelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: SubnivelFormData;
  setFormData: (data: SubnivelFormData) => void;
  etapas: EtapaJornada[];
  isEditing: boolean;
  title: string;
}

const SubnivelForm: React.FC<SubnivelFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  etapas,
  isEditing,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="etapa">Etapa *</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={formData.etapa_id}
              onChange={(e) => setFormData({...formData, etapa_id: e.target.value})}
            >
              <option value="">Selecione uma etapa</option>
              {etapas.map(etapa => (
                <option key={etapa.id} value={etapa.id}>
                  {etapa.ordem}. {etapa.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="nome-subnivel">Nome *</Label>
            <Input
              id="nome-subnivel"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Nome do subnível"
            />
          </div>
          <div>
            <Label htmlFor="descricao-subnivel">Descrição</Label>
            <Textarea
              id="descricao-subnivel"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição do subnível"
            />
          </div>
          <div>
            <Label htmlFor="ordem-subnivel">Ordem</Label>
            <Input
              id="ordem-subnivel"
              type="number"
              value={formData.ordem}
              onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo-subnivel"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
            />
            <Label htmlFor="ativo-subnivel">Ativo</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={!formData.nome || !formData.etapa_id}>
              {isEditing ? 'Salvar Alterações' : 'Criar Subnível'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubnivelForm;
