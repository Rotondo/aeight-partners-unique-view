import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';

export const CrmNextSteps: React.FC = () => {
  const { crmAcoes, updateAcaoCrm } = useCrm();

  // Filtrar ações com próximos passos pendentes
  const acoesComProximosPassos = crmAcoes.filter(acao => 
    acao.proximos_passos && 
    acao.status !== 'concluida' && 
    acao.status !== 'cancelada'
  );

  const marcarComoConcluida = async (acaoId: string) => {
    try {
      await updateAcaoCrm(acaoId, {
        status: 'concluida',
        data_realizada: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao marcar como concluída:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Próximos Passos
        </CardTitle>
        <CardDescription>
          Ações pendentes que requerem acompanhamento
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {acoesComProximosPassos.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Todas as ações estão em dia!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {acoesComProximosPassos.slice(0, 5).map((acao) => (
              <div key={acao.id} className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{acao.titulo}</h4>
                  <Badge 
                    variant={acao.status === 'pendente' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {acao.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {acao.proximos_passos}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(acao.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => marcarComoConcluida(acao.id)}
                    className="text-xs"
                  >
                    Concluir
                  </Button>
                </div>
              </div>
            ))}
            
            {acoesComProximosPassos.length > 5 && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                E mais {acoesComProximosPassos.length - 5} ações pendentes...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
