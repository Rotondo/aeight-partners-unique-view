
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import { Oportunidade } from '@/types';
import { useVtexFeedback } from '@/hooks/useVtexFeedback';
import { VtexFeedbackOportunidade } from '@/types/vtex';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VtexFeedbackHistoryProps {
  oportunidade?: Oportunidade;
  onVoltar: () => void;
}

export const VtexFeedbackHistory: React.FC<VtexFeedbackHistoryProps> = ({
  oportunidade,
  onVoltar
}) => {
  const { feedbacks, fetchFeedbacks, loading } = useVtexFeedback();
  const [feedbacksFiltrados, setFeedbacksFiltrados] = useState<VtexFeedbackOportunidade[]>([]);

  useEffect(() => {
    if (oportunidade) {
      fetchFeedbacks(oportunidade.id);
    } else {
      fetchFeedbacks();
    }
  }, [oportunidade]);

  useEffect(() => {
    if (oportunidade) {
      setFeedbacksFiltrados(feedbacks.filter(f => f.oportunidade_id === oportunidade.id));
    } else {
      setFeedbacksFiltrados(feedbacks);
    }
  }, [feedbacks, oportunidade]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
        </div>
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
          <h2 className="text-lg font-semibold">
            {oportunidade ? 'Histórico de Feedback' : 'Histórico Geral de Feedbacks'}
          </h2>
          {oportunidade && (
            <p className="text-sm text-muted-foreground">
              {oportunidade.nome_lead} - {oportunidade.empresa_destino?.nome}
            </p>
          )}
        </div>
      </div>

      {/* Histórico */}
      {feedbacksFiltrados.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum feedback encontrado</h3>
            <p className="text-muted-foreground text-center">
              {oportunidade 
                ? 'Esta oportunidade ainda não possui feedbacks registrados.'
                : 'Não há feedbacks registrados no sistema.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbacksFiltrados.map((feedback) => (
            <Card key={feedback.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {feedback.nome_lead} {feedback.sobrenome_lead}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {feedback.empresa_lead}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={feedback.status === 'enviado' ? 'default' : 'secondary'}>
                      {feedback.status === 'enviado' ? 'Enviado' : 'Rascunho'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(feedback.data_feedback), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Email:</p>
                    <p className="text-sm text-muted-foreground">{feedback.email_lead}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telefone:</p>
                    <p className="text-sm text-muted-foreground">{feedback.telefone_lead}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Conseguiu contato:</p>
                    <Badge variant={feedback.conseguiu_contato ? 'default' : 'secondary'}>
                      {feedback.conseguiu_contato ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Contexto:</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {feedback.contexto_breve}
                  </p>
                </div>

                {/* Campos customizados */}
                {Object.keys(feedback.campos_customizados).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Informações adicionais:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(feedback.campos_customizados).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span>{' '}
                          <span className="text-muted-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
