
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send, AlertTriangle } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexFeedbackFormData } from '@/types/vtex';

interface VtexFeedbackFormProps {
  oportunidade: Oportunidade;
  onVoltar: () => void;
  onFeedbackSalvo: () => void;
}

export const VtexFeedbackForm: React.FC<VtexFeedbackFormProps> = ({
  oportunidade,
  onVoltar,
  onFeedbackSalvo
}) => {
  const { camposCustomizados, salvarFeedback, loading, getUltimoFeedback } = useVtexFeedback();
  const [formData, setFormData] = useState<VtexFeedbackFormData>({
    empresa_lead: '',
    nome_lead: '',
    sobrenome_lead: '',
    email_lead: '',
    telefone_lead: '',
    conseguiu_contato: false,
    contexto_breve: '',
    campos_customizados: {}
  });

  // Verificar se é realmente uma oportunidade VTEX
  const isVtexOportunidade = () => {
    const origemNome = oportunidade.empresa_origem?.nome?.toLowerCase() || '';
    const destinoNome = oportunidade.empresa_destino?.nome?.toLowerCase() || '';
    return origemNome.includes('vtex') || destinoNome.includes('vtex');
  };

  useEffect(() => {
    // Preencher com dados da oportunidade
    const nomeCompleto = oportunidade.nome_lead?.split(' ') || [];
    const nome = nomeCompleto[0] || '';
    const sobrenome = nomeCompleto.slice(1).join(' ') || '';

    setFormData({
      empresa_lead: oportunidade.empresa_destino?.nome || '',
      nome_lead: nome,
      sobrenome_lead: sobrenome,
      email_lead: '',
      telefone_lead: '',
      conseguiu_contato: false,
      contexto_breve: '',
      campos_customizados: {}
    });
  }, [oportunidade]);

  const handleSubmit = async (status: 'rascunho' | 'enviado') => {
    // Validações básicas
    if (!formData.nome_lead.trim() || !formData.sobrenome_lead.trim()) {
      alert('Nome e sobrenome são obrigatórios');
      return;
    }

    if (!formData.email_lead.trim() || !formData.telefone_lead.trim()) {
      alert('Email e telefone são obrigatórios');
      return;
    }

    if (!formData.contexto_breve.trim()) {
      alert('O contexto breve é obrigatório');
      return;
    }

    try {
      await salvarFeedback(oportunidade.id, formData, status);
      onFeedbackSalvo();
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
    }
  };

  const handleCampoCustomizado = (nome: string, valor: any) => {
    setFormData(prev => ({
      ...prev,
      campos_customizados: {
        ...prev.campos_customizados,
        [nome]: valor
      }
    }));
  };

  const renderCampoCustomizado = (campo: any) => {
    const valor = formData.campos_customizados[campo.nome] || '';

    switch (campo.tipo) {
      case 'texto':
      case 'email':
      case 'telefone':
        return (
          <Input
            type={campo.tipo === 'email' ? 'email' : campo.tipo === 'telefone' ? 'tel' : 'text'}
            value={valor}
            onChange={(e) => handleCampoCustomizado(campo.nome, e.target.value)}
            placeholder={campo.label}
            required={campo.obrigatorio}
          />
        );
      
      case 'texto_longo':
        return (
          <Textarea
            value={valor}
            onChange={(e) => handleCampoCustomizado(campo.nome, e.target.value)}
            placeholder={campo.label}
            required={campo.obrigatorio}
            rows={3}
          />
        );
      
      case 'selecao':
        return (
          <Select
            value={valor}
            onValueChange={(value) => handleCampoCustomizado(campo.nome, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${campo.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {campo.opcoes?.map((opcao: string) => (
                <SelectItem key={opcao} value={opcao}>
                  {opcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'data':
        return (
          <Input
            type="date"
            value={valor}
            onChange={(e) => handleCampoCustomizado(campo.nome, e.target.value)}
            required={campo.obrigatorio}
          />
        );
      
      case 'boolean':
        return (
          <Select
            value={valor ? 'true' : 'false'}
            onValueChange={(value) => handleCampoCustomizado(campo.nome, value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        return null;
    }
  };

  // Verificar se não é uma oportunidade VTEX
  if (!isVtexOportunidade()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onVoltar}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">Erro - Oportunidade Inválida</h2>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Oportunidade não é VTEX</h3>
            <p className="text-muted-foreground text-center mb-4">
              Esta oportunidade não possui empresas relacionadas à VTEX.
            </p>
            <Button onClick={onVoltar}>Voltar à Lista</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">Feedback VTEX</h2>
          <p className="text-sm text-muted-foreground">
            {oportunidade.nome_lead} - {oportunidade.empresa_destino?.nome}
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Seção 1: Dados do Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Lead</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa_lead">Empresa do Lead *</Label>
                <Input
                  id="empresa_lead"
                  value={formData.empresa_lead}
                  onChange={(e) => setFormData(prev => ({ ...prev, empresa_lead: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nome_lead">Nome do Lead *</Label>
                <Input
                  id="nome_lead"
                  value={formData.nome_lead}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_lead: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sobrenome_lead">Sobrenome do Lead *</Label>
                <Input
                  id="sobrenome_lead"
                  value={formData.sobrenome_lead}
                  onChange={(e) => setFormData(prev => ({ ...prev, sobrenome_lead: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email_lead">Email do Lead *</Label>
                <Input
                  id="email_lead"
                  type="email"
                  value={formData.email_lead}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_lead: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefone_lead">Telefone do Lead *</Label>
                <Input
                  id="telefone_lead"
                  type="tel"
                  value={formData.telefone_lead}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone_lead: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Andamento da Oportunidade */}
        <Card>
          <CardHeader>
            <CardTitle>Andamento da Oportunidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conseguiu_contato">Conseguiu contato com o lead? *</Label>
              <Select
                value={formData.conseguiu_contato ? 'true' : 'false'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, conseguiu_contato: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="contexto_breve">Contexto breve *</Label>
              <Textarea
                id="contexto_breve"
                value={formData.contexto_breve}
                onChange={(e) => setFormData(prev => ({ ...prev, contexto_breve: e.target.value }))}
                placeholder="Descreva brevemente o status atual, tentativas de contato ou ações em andamento com o lead."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Campos Customizados */}
        {camposCustomizados.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {camposCustomizados.map((campo) => (
                <div key={campo.id}>
                  <Label htmlFor={campo.nome}>
                    {campo.label} {campo.obrigatorio && '*'}
                  </Label>
                  {campo.descricao && (
                    <p className="text-sm text-muted-foreground mb-2">{campo.descricao}</p>
                  )}
                  {renderCampoCustomizado(campo)}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('rascunho')}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit('enviado')}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Enviar Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};
