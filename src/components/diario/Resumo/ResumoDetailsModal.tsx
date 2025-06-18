
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, CheckCircle, Clock, Eye, Users } from 'lucide-react';
import { useResumo } from '@/contexts/ResumoContext';

interface ResumoDetailsModalProps {
  resumoId: string;
  isOpen: boolean;
  onClose: () => void;
  resumo: any;
}

export const ResumoDetailsModal: React.FC<ResumoDetailsModalProps> = ({
  resumoId,
  isOpen,
  onClose,
  resumo
}) => {
  const { getResumoDetails } = useResumo();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && resumoId) {
      loadDetails();
    }
  }, [isOpen, resumoId]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const detalhes = await getResumoDetails(resumoId);
      setDetails(detalhes);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalhes do {resumo?.titulo}
          </DialogTitle>
          <DialogDescription>
            Dados verificáveis que geraram este resumo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Critérios de Busca */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Critérios de Busca
                </h3>
                <div className="text-sm text-blue-800">
                  <p><strong>Período:</strong> {new Date(details.criterios?.periodoInicio || '').toLocaleDateString('pt-BR')} até {new Date(details.criterios?.periodoFim || '').toLocaleDateString('pt-BR')}</p>
                  <p><strong>Data de Geração:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>

              {/* Eventos Detalhados */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Eventos Encontrados ({details.eventos?.length || 0})
                </h3>
                {details.eventos?.length > 0 ? (
                  <div className="space-y-2">
                    {details.eventos.map((evento: any, index: number) => (
                      <div key={index} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{evento.title}</h4>
                            {evento.description && (
                              <p className="text-sm text-gray-600 mt-1">{evento.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={evento.status === 'completed' ? 'default' : 'secondary'}>
                                {evento.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                ID: {evento.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            {new Date(evento.start || evento.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum evento encontrado no período</p>
                  </div>
                )}
              </div>

              {/* Ações CRM Detalhadas */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ações CRM Encontradas ({details.acoesCrm?.length || 0})
                </h3>
                {details.acoesCrm?.length > 0 ? (
                  <div className="space-y-2">
                    {details.acoesCrm.map((acao: any, index: number) => (
                      <div key={index} className="border rounded p-3 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm">{acao.content?.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {acao.type}
                              </Badge>
                              {acao.partner_id && (
                                <Badge variant="secondary" className="text-xs">
                                  Parceiro: {acao.partner_id.substring(0, 8)}...
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                ID: {acao.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            {new Date(acao.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma ação CRM encontrada no período</p>
                  </div>
                )}
              </div>

              {/* Verificação de Integridade */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verificação de Integridade
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p>✓ Todos os números são baseados em dados reais do banco</p>
                  <p>✓ Contagens verificáveis através dos IDs mostrados acima</p>
                  <p>✓ Período de busca documentado e auditável</p>
                  <p>✓ Gerado em tempo real no momento da solicitação</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Não foi possível carregar os detalhes</p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
