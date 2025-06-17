
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Edit } from 'lucide-react';
import { useIA } from '@/contexts/IAContext';
import type { IaSugestao } from '@/types/diario';

interface IaApproveFieldProps {
  sugestao: IaSugestao;
}

export const IaApproveField: React.FC<IaApproveFieldProps> = ({ sugestao }) => {
  const { reviewSugestao, approveSugestao, rejectSugestao } = useIA();
  
  const [isEditing, setIsEditing] = useState(false);
  const [conteudoEditado, setConteudoEditado] = useState(sugestao.conteudo_sugerido);
  const [observacoes, setObservacoes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async () => {
    setIsProcessing(true);
    try {
      await reviewSugestao(sugestao.id, conteudoEditado, observacoes);
      setIsEditing(false);
      setObservacoes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await approveSugestao(sugestao.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!observacoes.trim()) {
      alert('Por favor, adicione uma observação ao rejeitar a sugestão.');
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectSugestao(sugestao.id, observacoes);
      setObservacoes('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Conteúdo editável */}
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor="conteudo_editado">Editar Sugestão</Label>
            <Textarea
              id="conteudo_editado"
              value={conteudoEditado}
              onChange={(e) => setConteudoEditado(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione suas observações sobre as alterações..."
              rows={2}
              className="mt-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleReview}
              disabled={isProcessing}
              size="sm"
            >
              Salvar Revisão
            </Button>
            
            <Button 
              onClick={() => {
                setIsEditing(false);
                setConteudoEditado(sugestao.conteudo_sugerido);
                setObservacoes('');
              }}
              variant="outline"
              size="sm"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Ações principais */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              disabled={isProcessing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            
            <Button
              onClick={handleApprove}
              variant="default"
              size="sm"
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
            
            <Button
              onClick={() => {
                // Mostrar campo de observações para rejeição
                if (!observacoes) {
                  setIsEditing(true);
                } else {
                  handleReject();
                }
              }}
              variant="destructive"
              size="sm"
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </div>
          
          {/* Campo de observações para rejeição rápida */}
          {sugestao.status === 'pendente' && (
            <div className="space-y-2">
              <Label htmlFor="observacoes_rejeicao">Observações (obrigatório para rejeição)</Label>
              <Textarea
                id="observacoes_rejeicao"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Explique o motivo da rejeição ou aprovação..."
                rows={2}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
