
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EtapaFormData {
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

interface EtapaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: EtapaFormData;
  setFormData: (data: EtapaFormData) => void;
  isEditing: boolean;
  title: string;
}

const EtapaForm: React.FC<EtapaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
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
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              placeholder="Nome da etapa"
            />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descrição da etapa"
            />
          </div>
          <div>
            <Label htmlFor="cor">Cor</Label>
            <Input
              id="cor"
              type="color"
              value={formData.cor}
              onChange={(e) => setFormData({...formData, cor: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="ordem">Ordem</Label>
            <Input
              id="ordem"
              type="number"
              value={formData.ordem}
              onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value)})}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={!formData.nome}>
              {isEditing ? 'Salvar Alterações' : 'Criar Etapa'}
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

export default EtapaForm;
