import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, X, MapPin, Plus } from 'lucide-react';
import { ParceiroMapa, EtapaJornada, SubnivelEtapa, AssociacaoParceiroEtapa } from '@/types/mapa-parceiros';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ParceiroDetalhesSimplificadoProps {
  parceiro: ParceiroMapa;
  etapas: EtapaJornada[];
  subniveis: SubnivelEtapa[];
  associacoes: AssociacaoParceiroEtapa[];
  onClose: () => void;
  onSave: (dados: Partial<ParceiroMapa>) => Promise<void>;
  onAssociarEtapa: (parceiroId: string, etapaId: string, subnivelId?: string) => Promise<any>;
  onRemoverAssociacao: (associacaoId: string) => Promise<void>;
}

const ParceiroDetalhesSimplificado: React.FC<ParceiroDetalhesSimplificadoProps> = ({
  parceiro,
  etapas,
  subniveis,
  associacoes,
  onClose,
  onSave,
  onAssociarEtapa,
  onRemoverAssociacao
}) => {
  const [editandoParceiro, setEditandoParceiro] = useState(parceiro);
  const [novaEtapa, setNovaEtapa] = useState('');
  const [novoSubnivel, setNovoSubnivel] = useState('');

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const nomeEmpresa = parceiro.empresa?.nome || 'Empresa sem nome';
  const descricaoEmpresa = parceiro.empresa?.descricao || 'Sem descrição';

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

  const handleSalvar = async () => {
    try {
      await onSave({
        status: editandoParceiro.status,
        performance_score: editandoParceiro.performance_score,
        observacoes: editandoParceiro.observacoes
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleAdicionarEtapa = async () => {
    if (novaEtapa) {
      try {
        await onAssociarEtapa(parceiro.id, novaEtapa, novoSubnivel || undefined);
        setNovaEtapa('');
        setNovoSubnivel('');
      } catch (error) {
        console.error('Erro ao associar etapa:', error);
      }
    }
  };

  const associacoesParceiro = associacoes.filter(a => a.parceiro_id === parceiro.id);
  const subniveisEtapa = subniveis.filter(s => s.etapa_id === novaEtapa);

  return (
    <div className="w-96 bg-background border-l border-border h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(nomeEmpresa)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{nomeEmpresa}</h2>
              <p className="text-sm text-muted-foreground">{descricaoEmpresa}</p>
              <p className="text-xs text-muted-foreground capitalize">{parceiro.empresa?.tipo}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Performance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex">{renderStars(editandoParceiro.performance_score)}</div>
              <span className="text-sm font-medium">{editandoParceiro.performance_score}%</span>
            </div>
            
            <Slider
              value={[editandoParceiro.performance_score]}
              onValueChange={(value) => setEditandoParceiro(prev => ({ ...prev, performance_score: value[0] }))}
              max={100}
              step={1}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={editandoParceiro.status} 
              onValueChange={(value) => setEditandoParceiro(prev => ({ ...prev, status: value as any }))}
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
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editandoParceiro.observacoes || ''}
              onChange={(e) => setEditandoParceiro(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre o parceiro..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Etapas Associadas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Etapas da Jornada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Lista de associações */}
            {associacoesParceiro.length > 0 ? (
              <div className="space-y-2">
                {associacoesParceiro.map((associacao) => {
                  const etapa = etapas.find(e => e.id === associacao.etapa_id);
                  const subnivel = associacao.subnivel_id ? 
                    subniveis.find(s => s.id === associacao.subnivel_id) : null;
                  
                  return (
                    <div key={associacao.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{etapa?.nome || "Etapa desconhecida"}</p>
                        {subnivel && (
                          <p className="text-xs text-muted-foreground">{subnivel?.nome || "Subnível desconhecido"}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoverAssociacao(associacao.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma etapa associada</p>
            )}

            {/* Adicionar nova etapa */}
            <div className="space-y-2 pt-2 border-t">
              <Select value={novaEtapa} onValueChange={(value) => {
                setNovaEtapa(value);
                setNovoSubnivel('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {etapas.map((etapa) => (
                    <SelectItem key={etapa.id} value={etapa.id}>
                      {etapa.ordem}. {etapa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {subniveisEtapa.length > 0 && (
                <Select value={novoSubnivel} onValueChange={setNovoSubnivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar subnível (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subniveisEtapa.map((subnivel) => (
                      <SelectItem key={subnivel.id} value={subnivel.id}>
                        {subnivel.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button 
                onClick={handleAdicionarEtapa} 
                disabled={!novaEtapa}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar à Etapa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <Button onClick={handleSalvar} className="w-full">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default ParceiroDetalhesSimplificado;