
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, Phone, Mail, Users, Video, Plus } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { MetodoComunicacao, StatusAcaoCrm } from '@/types/diario';

interface CrmActionFormProps {
  onSuccess?: () => void;
}

export const CrmActionForm: React.FC<CrmActionFormProps> = ({ onSuccess }) => {
  const { createAcaoCrm } = useCrm();
  const { partners } = usePartners();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    communication_method: 'email' as MetodoComunicacao,
    content: '',
    status: 'pendente' as StatusAcaoCrm,
    partner_id: 'none',
    next_steps: '',
    next_step_date: ''
  });

  const comunicacaoOptions = [
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { value: 'ligacao', label: 'Ligação', icon: Phone },
    { value: 'email', label: 'E-mail', icon: Mail },
    { value: 'encontro', label: 'Encontro Presencial', icon: Users },
    { value: 'reuniao_meet', label: 'Reunião Meet/Online', icon: Video }
  ];

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluida', label: 'Concluída' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.communication_method || !formData.content) return;

    setLoading(true);
    try {
      await createAcaoCrm({
        description: formData.description,
        communication_method: formData.communication_method,
        content: formData.content,
        status: formData.status,
        partner_id: formData.partner_id === 'none' ? undefined : formData.partner_id,
        next_steps: formData.next_steps || undefined,
        next_step_date: formData.next_step_date || undefined,
        metadata: {
          created_via: 'form'
        }
      });

      // Reset form
      setFormData({
        description: '',
        communication_method: 'email' as MetodoComunicacao,
        content: '',
        status: 'pendente',
        partner_id: 'none',
        next_steps: '',
        next_step_date: ''
      });

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar ação:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedIcon = () => {
    const option = comunicacaoOptions.find(opt => opt.value === formData.communication_method);
    return option?.icon || MessageSquare;
  };

  // CORREÇÃO: Filtrar parceiros válidos para evitar IDs vazios
  const validPartners = partners.filter(partner => {
    const isValid = partner.id && partner.id.trim() !== '';
    console.log('[CrmActionForm] Partner validation:', { id: partner.id, nome: partner.nome, isValid });
    return isValid;
  });

  console.log('[CrmActionForm] Total partners:', partners.length, 'Valid partners:', validPartners.length);

  return (
    <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Ação CRM
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Título/Resumo *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Reunião de alinhamento com cliente"
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="communication">Meio de Comunicação *</Label>
              <Select 
                value={formData.communication_method} 
                onValueChange={(value) => setFormData({...formData, communication_method: value as MetodoComunicacao})}
              >
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder="Selecione o meio">
                    {formData.communication_method && (
                      <div className="flex items-center gap-2">
                        {React.createElement(getSelectedIcon(), { className: "h-4 w-4" })}
                        {comunicacaoOptions.find(opt => opt.value === formData.communication_method)?.label}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  {comunicacaoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Descrição/Conteúdo *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Descreva o que aconteceu, principais pontos discutidos, decisões tomadas..."
              rows={4}
              required
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as StatusAcaoCrm})}
              >
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner">Parceiro</Label>
              <Select 
                value={formData.partner_id} 
                onValueChange={(value) => setFormData({...formData, partner_id: value})}
              >
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue placeholder="Selecione um parceiro" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <SelectItem value="none">Nenhum parceiro</SelectItem>
                  {validPartners.map((partner) => {
                    console.log('[CrmActionForm] Rendering SelectItem:', { id: partner.id, nome: partner.nome });
                    return (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.nome}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_steps">Próximos Passos</Label>
            <Textarea
              id="next_steps"
              value={formData.next_steps}
              onChange={(e) => setFormData({...formData, next_steps: e.target.value})}
              placeholder="Defina as próximas ações necessárias..."
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {formData.next_steps && (
            <div className="space-y-2">
              <Label htmlFor="next_step_date">Data do Próximo Passo</Label>
              <Input
                id="next_step_date"
                type="datetime-local"
                value={formData.next_step_date}
                onChange={(e) => setFormData({...formData, next_step_date: e.target.value})}
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={loading || !formData.description || !formData.communication_method || !formData.content}
            >
              {loading ? 'Salvando...' : 'Salvar Ação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

