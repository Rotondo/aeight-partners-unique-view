
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Save, X } from 'lucide-react';
import { useAgenda } from '@/contexts/AgendaContext';
import { usePartners } from '@/hooks/usePartners';
import { AgendaEvento } from '@/types/diario';

interface AgendaEventFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Partial<AgendaEvento>;
}

export const AgendaEventForm: React.FC<AgendaEventFormProps> = ({ 
  onClose, 
  onSuccess,
  initialData 
}) => {
  const { createEvento, updateEvento } = useAgenda();
  const { partners } = usePartners();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start: initialData?.start || '',
    end: initialData?.end || '',
    partner_id: initialData?.partner_id || 'none',
    status: initialData?.status || 'scheduled' as const
  });

  // CORREÇÃO: Filtrar parceiros com validação mais rigorosa
  const validPartners = partners.filter(partner => {
    const hasValidId = partner.id && 
                      typeof partner.id === 'string' && 
                      partner.id.trim() !== '' && 
                      partner.id !== 'undefined' && 
                      partner.id !== 'null';
    const hasValidName = partner.nome && 
                        typeof partner.nome === 'string' && 
                        partner.nome.trim() !== '';
    
    console.log('[AgendaEventForm] Partner validation:', { 
      id: partner.id, 
      nome: partner.nome, 
      hasValidId, 
      hasValidName,
      isValid: hasValidId && hasValidName 
    });
    
    return hasValidId && hasValidName;
  });

  console.log('[AgendaEventForm] Total partners:', partners.length, 'Valid partners:', validPartners.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.start || !formData.end) {
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        partner_id: formData.partner_id === 'none' ? undefined : formData.partner_id
      };

      if (initialData?.id) {
        await updateEvento(initialData.id, eventData);
      } else {
        await createEvento(eventData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {initialData?.id ? 'Editar Evento' : 'Novo Evento'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Reunião de planejamento"
              required
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva os objetivos e pontos principais..."
              rows={3}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Data/Hora Início *</Label>
              <Input
                id="start"
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({...formData, start: e.target.value})}
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end">Data/Hora Fim *</Label>
              <Input
                id="end"
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({...formData, end: e.target.value})}
                required
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Parceiro (Opcional)</Label>
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
                    // Verificação adicional antes do render
                    if (!partner.id || partner.id.trim() === '') {
                      console.error('[AgendaEventForm] Skipping partner with invalid ID:', partner);
                      return null;
                    }
                    
                    console.log('[AgendaEventForm] Rendering SelectItem:', { id: partner.id, nome: partner.nome });
                    return (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.nome}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as any})}
              >
                <SelectTrigger className="border border-gray-300 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="completed">Realizado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.start || !formData.end}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : (initialData?.id ? 'Atualizar' : 'Criar Evento')}
            </Button>
            
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
