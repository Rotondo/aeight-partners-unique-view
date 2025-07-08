import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { 
  X, 
  Edit, 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  Star,
  Building,
  ExternalLink
} from 'lucide-react';
import { ParceiroMapa, EtapaJornada, SubnivelEtapa, AssociacaoParceiroEtapa } from '@/types/mapa-parceiros';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ParceiroDetalhesProps {
  parceiro: ParceiroMapa;
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  associacoes: AssociacaoParceiroEtapa[];
  onClose: () => void;
  onSave: (dadosAtualizados: Partial<ParceiroMapa>) => void;
  onAssociarEtapa: (etapaId: string, subnivelId?: string) => void;
  onRemoverAssociacao: (associacaoId: string) => void;
}

const ParceiroDetalhes: React.FC<ParceiroDetalhesProps> = ({
  parceiro,
  etapas,
  subniveis,
  associacoes,
  onClose,
  onSave,
  onAssociarEtapa,
  onRemoverAssociacao
}) => {
  const [editando, setEditando] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState(parceiro);

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-500';
      case 'inativo':
        return 'bg-red-500';
      case 'pendente':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'Ativo';
      case 'inativo':
        return 'Inativo';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const renderStars = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleSave = () => {
    onSave(dadosEdicao);
    setEditando(false);
  };

  const handleCancel = () => {
    setDadosEdicao(parceiro);
    setEditando(false);
  };

  const associacoesDoParceiro = associacoes.filter(a => a.parceiro_id === parceiro.id);

  const getEtapaAssociacao = (associacao: AssociacaoParceiroEtapa) => {
    return etapas.find(e => e.id === associacao.etapa_id);
  };

  const getSubnivelAssociacao = (associacao: AssociacaoParceiroEtapa) => {
    return associacao.subnivel_id 
      ? subniveis.find(s => s.id === associacao.subnivel_id)
      : null;
  };

  return (
    <div className="w-96 bg-background border-l border-border h-full overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Detalhes do Parceiro</h2>
        <div className="flex items-center gap-2">
          {editando ? (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarImage src={parceiro.logo_url} alt={parceiro.nome} />
                <AvatarFallback className="text-lg">
                  {getInitials(parceiro.nome)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                {editando ? (
                  <Input
                    value={dadosEdicao.nome}
                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                    className="font-semibold text-lg"
                  />
                ) : (
                  <h3 className="font-semibold text-lg">{parceiro.nome}</h3>
                )}
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-white ${getStatusColor(parceiro.status)}`}
                  >
                    {getStatusText(parceiro.status)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {renderStars(parceiro.performance_score)}
                    <span className="text-sm text-muted-foreground ml-1">
                      {parceiro.performance_score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Descrição */}
            <div>
              <Label>Descrição</Label>
              {editando ? (
                <Textarea
                  value={dadosEdicao.descricao || ''}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, descricao: e.target.value })}
                  placeholder="Descrição do parceiro..."
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {parceiro.descricao || 'Sem descrição disponível'}
                </p>
              )}
            </div>

            {/* Status */}
            {editando && (
              <div>
                <Label>Status</Label>
                <Select 
                  value={dadosEdicao.status} 
                  onValueChange={(value) => setDadosEdicao({ ...dadosEdicao, status: value as any })}
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
            )}

            {/* Performance Score */}
            {editando && (
              <div>
                <Label>Performance Score: {dadosEdicao.performance_score}%</Label>
                <Slider
                  value={[dadosEdicao.performance_score]}
                  onValueChange={(value) => setDadosEdicao({ ...dadosEdicao, performance_score: value[0] })}
                  max={100}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            {/* Website */}
            <div>
              <Label>Website</Label>
              {editando ? (
                <Input
                  value={dadosEdicao.website || ''}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, website: e.target.value })}
                  placeholder="https://example.com"
                />
              ) : parceiro.website ? (
                <div className="flex items-center gap-2 mt-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={parceiro.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {parceiro.website}
                  </a>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Não informado</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label>Email de Contato</Label>
              {editando ? (
                <Input
                  type="email"
                  value={dadosEdicao.contato_email || ''}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, contato_email: e.target.value })}
                  placeholder="contato@exemplo.com"
                />
              ) : parceiro.contato_email ? (
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${parceiro.contato_email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {parceiro.contato_email}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Não informado</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label>Telefone de Contato</Label>
              {editando ? (
                <Input
                  value={dadosEdicao.contato_telefone || ''}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, contato_telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              ) : parceiro.contato_telefone ? (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{parceiro.contato_telefone}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Não informado</p>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label>Observações</Label>
              {editando ? (
                <Textarea
                  value={dadosEdicao.observacoes || ''}
                  onChange={(e) => setDadosEdicao({ ...dadosEdicao, observacoes: e.target.value })}
                  placeholder="Observações sobre o parceiro..."
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {parceiro.observacoes || 'Nenhuma observação'}
                </p>
              )}
            </div>

            {/* Data de Criação */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Criado em {new Date(parceiro.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Etapas Associadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4" />
              Etapas da Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            {associacoesDoParceiro.length > 0 ? (
              <div className="space-y-2">
                {associacoesDoParceiro.map((associacao) => {
                  const etapa = getEtapaAssociacao(associacao);
                  const subnivel = getSubnivelAssociacao(associacao);
                  
                  return (
                    <div 
                      key={associacao.id}
                      className="flex items-center justify-between p-2 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: etapa?.cor }}
                        />
                        <div>
                          <span className="text-sm font-medium">
                            {etapa?.ordem}. {etapa?.nome}
                          </span>
                          {subnivel && (
                            <p className="text-xs text-muted-foreground">
                              {subnivel.nome}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoverAssociacao(associacao.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma etapa associada ainda
              </p>
            )}

            <Button 
              size="sm" 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => {
                // Aqui você pode abrir um modal para associar a uma nova etapa
                // Por simplicidade, vamos associar à primeira etapa
                if (etapas.length > 0) {
                  onAssociarEtapa(etapas[0].id);
                }
              }}
            >
              Associar a Etapa
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParceiroDetalhes;