
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import { usePartners } from '@/hooks/usePartners';
import { StatusAcaoCrm } from '@/types/diario';

export const CrmFormText: React.FC = () => {
  const { createAcaoCrm } = useCrm();
  const { partners, loading: loadingPartners } = usePartners();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    conteudoTexto: '',
    parceiroId: '',
    status: 'pendente' as StatusAcaoCrm,
    proximosPassos: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAcaoCrm({
        titulo: formData.titulo,
        descricao: formData.descricao,
        tipo: 'texto',
        status: formData.status,
        parceiro_id: formData.parceiroId || undefined,
        conteudo_texto: formData.conteudoTexto,
        proximos_passos: formData.proximosPassos || undefined,
      });

      // Reset form
      setFormData({
        titulo: '',
        descricao: '',
        conteudoTexto: '',
        parceiroId: '',
        status: 'pendente',
        proximosPassos: ''
      });
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          placeholder="Ex: Anotações da reunião"
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Breve descrição do registro..."
          rows={2}
          required
        />
      </div>

      {/* Conteúdo principal */}
      <div className="space-y-2">
        <Label htmlFor="conteudo_texto">Conteúdo</Label>
        <Textarea
          id="conteudo_texto"
          value={formData.conteudoTexto}
          onChange={(e) => setFormData({ ...formData, conteudoTexto: e.target.value })}
          placeholder="Digite o conteúdo detalhado aqui..."
          rows={8}
          required
          className="min-h-[200px]"
        />
      </div>

      {/* Parceiro */}
      <div className="space-y-2">
        <Label>Parceiro (Opcional)</Label>
        <Select value={formData.parceiroId} onValueChange={(value) => setFormData({ ...formData, parceiroId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um parceiro" />
          </SelectTrigger>
          <SelectContent>
            {partners.map((partner) => (
              <SelectItem key={partner.id} value={partner.id}>
                {partner.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as StatusAcaoCrm })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Próximos passos */}
      <div className="space-y-2">
        <Label htmlFor="proximos_passos">Próximos Passos</Label>
        <Textarea
          id="proximos_passos"
          value={formData.proximosPassos}
          onChange={(e) => setFormData({ ...formData, proximosPassos: e.target.value })}
          placeholder="Defina as próximas ações..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Salvar Registro
      </Button>
    </form>
  );
};
