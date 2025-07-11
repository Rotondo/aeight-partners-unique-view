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
    <div className="w-full max-w-md p-4 space-y-3 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(nomeEmpresa)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold leading-tight">{nomeEmpresa}</div>
            <div className="text-xs text-muted-foreground">{descricaoEmpresa}</div>
            <div className="text-[10px] text-muted-foreground capitalize">{parceiro.empresa?.tipo}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Performance */}
      <div className="flex items-center gap-2">
        <span className="w-24">Performance</span>
        <div className="flex items-center gap-1">{renderStars(editandoParceiro.performance_score)}</div>
        <span className="text-xs font-medium">{editandoParceiro.performance_score}%</span>
      </div>
      <Slider
        value={[editandoParceiro.performance_score]}
        onValueChange={(value) => setEditandoParceiro(prev => ({ ...prev, performance_score: value[0] }))}
        max={100}
        step={1}
        className="h-4"
      />

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="w-24">Status</span>
        <Select 
          value={editandoParceiro.status} 
          onValueChange={(value) => setEditandoParceiro(prev => ({ ...prev, status: value as any }))}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Observações */}
      <div>
        <span className="block mb-1">Observações</span>
        <Textarea
          value={editandoParceiro.observacoes || ''}
          onChange={(e) => setEditandoParceiro(prev => ({ ...prev, observacoes: e.target.value }))}
          placeholder="Observações sobre o parceiro..."
          rows={2}
          className="text-xs"
        />
      </div>

      {/* Etapas Associadas */}
      <div>
        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3" />
          <span className="font-medium text-xs">Etapas da Jornada</span>
        </div>
        {associacoesParceiro.length > 0 ? (
          <ul className="space-y-1 mb-1">
            {associacoesParceiro.map((associacao) => {
              const etapa = etapas.find(e => e.id === associacao.etapa_id);
              const subnivel = associacao.subnivel_id ? 
                subniveis.find(s => s.id === associacao.subnivel_id) : null;
              return (
                <li key={associacao.id} className="flex items-center justify-between px-2 py-1 bg-muted rounded">
                  <div>
                    <span className="text-xs font-medium">{etapa?.nome || "Etapa desconhecida"}</span>
                    {subnivel && (
                      <span className="ml-2 text-[10px] text-muted-foreground">{subnivel?.nome || "Subnível desconhecido"}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 p-0"
                    onClick={() => onRemoverAssociacao(associacao.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-xs text-muted-foreground mb-1">Nenhuma etapa associada.</div>
        )}
        {/* Adicionar nova etapa */}
        <div className="flex gap-1 items-center mt-1">
          <Select value={novaEtapa} onValueChange={setNovaEtapa}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue placeholder="Selecionar etapa" />
            </SelectTrigger>
            <SelectContent>
              {etapas.map(etapa => (
                <SelectItem key={etapa.id} value={etapa.id}>{etapa.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={novoSubnivel} onValueChange={setNovoSubnivel} disabled={!novaEtapa}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue placeholder="Subnível" />
            </SelectTrigger>
            <SelectContent>
              {subniveisEtapa.map(subnivel => (
                <SelectItem key={subnivel.id} value={subnivel.id}>{subnivel.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="h-7 w-7 p-0" onClick={handleAdicionarEtapa} disabled={!novaEtapa}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Salvar */}
      <Button className="w-full mt-2 h-8 text-xs" onClick={handleSalvar}>
        Salvar Alterações
      </Button>
    </div>
  );
};

export default ParceiroDetalhesSimplificado;