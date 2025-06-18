
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { StatusAcaoCrm, MetodoComunicacao } from '@/types/diario';

export const CrmFormText: React.FC = () => {
  const { createAcaoCrm } = useCrm();
  // CORREÇÃO: Usar apenas parceiros reais, não incluir clientes
  const { partners, loading: loadingPartners } = usePartners();
  
  const [formData, setFormData] = useState({
    description: '',
    content: '',
    communication_method: 'email' as MetodoComunicacao,
    partner_id: 'none',
    status: 'pendente' as StatusAcaoCrm,
    next_steps: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAcaoCrm({
        description: formData.description,
        content: formData.content,
        communication_method: formData.communication_method,
        status: formData.status,
        partner_id: formData.partner_id === 'none' ? undefined : formData.partner_id,
        next_steps: formData.next_steps || undefined,
      });

      // Reset form
      setFormData({
        description: '',
        content: '',
        communication_method: 'email' as MetodoComunicacao,
        partner_id: 'none',
        status: 'pendente',
        next_steps: ''
      });
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
    }
  };

  // CORREÇÃO ROBUSTA: Filtrar parceiros com validação mais rigorosa
  const validPartners = partners.filter(partner => {
    const hasValidId = partner.id && 
                      typeof partner.id === 'string' && 
                      partner.id.trim() !== '' && 
                      partner.id !== 'undefined' && 
                      partner.id !== 'null';
    const hasValidName = partner.nome && 
                        typeof partner.nome === 'string' && 
                        partner.nome.trim() !== '';
    
    console.log('[CrmFormText] Partner validation:', { 
      id: partner.id, 
      nome: partner.nome, 
      hasValidId, 
      hasValidName,
      isValid: hasValidId && hasValidName 
    });
    
    return hasValidId && hasValidName;
  });

  console.log('[CrmFormText] Total partners:', partners.length, 'Valid partners:', validPartners.length);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Reunião de alinhamento"
          required
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Método de Comunicação */}
      <div className="space-y-2">
        <Label>Método de Comunicação</Label>
        <Select value={formData.communication_method} onValueChange={(value) => setFormData({ ...formData, communication_method: value as MetodoComunicacao })}>
          <SelectTrigger className="border border-gray-300 rounded-md">
            <SelectValue placeholder="Selecione o método" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="ligacao">Ligação</SelectItem>
            <SelectItem value="email">E-mail</SelectItem>
            <SelectItem value="encontro">Encontro Presencial</SelectItem>
            <SelectItem value="reuniao_meet">Reunião Meet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Digite o conteúdo detalhado aqui..."
          rows={8}
          required
          className="min-h-[200px] border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Parceiro - CORRIGIDO: Validação mais robusta */}
      <div className="space-y-2">
        <Label>Parceiro (Opcional)</Label>
        <Select value={formData.partner_id} onValueChange={(value) => setFormData({ ...formData, partner_id: value })}>
          <SelectTrigger className="border border-gray-300 rounded-md">
            <SelectValue placeholder="Selecione um parceiro" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <SelectItem value="none">Nenhum parceiro</SelectItem>
            {validPartners.map((partner) => {
              // Verificação adicional antes do render
              if (!partner.id || partner.id.trim() === '') {
                console.error('[CrmFormText] Skipping partner with invalid ID:', partner);
                return null;
              }
              
              console.log('[CrmFormText] Rendering SelectItem:', { id: partner.id, nome: partner.nome });
              return (
                <SelectItem key={partner.id} value={partner.id}>
                  {partner.nome} {partner.tipo === 'intragrupo' ? '(Intragrupo)' : '(Parceiro)'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {loadingPartners && (
          <p className="text-sm text-muted-foreground">Carregando parceiros...</p>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as StatusAcaoCrm })}>
          <SelectTrigger className="border border-gray-300 rounded-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Próximos passos */}
      <div className="space-y-2">
        <Label htmlFor="next_steps">Próximos Passos</Label>
        <Textarea
          id="next_steps"
          value={formData.next_steps}
          onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
          placeholder="Defina as próximas ações..."
          rows={3}
          className="border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Registro
      </Button>
    </form>
  );
};
