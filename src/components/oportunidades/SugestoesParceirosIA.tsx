
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Empresa, IndicadoresParceiro } from "@/types";
import { Star, TrendingUp, Users, Target, Brain, Loader2 } from "lucide-react";

interface SugestoesParceirosIAProps {
  oportunidadeId: string;
  onClose: () => void;
}

interface ParceiroComScoreIA extends Empresa {
  indicadores?: IndicadoresParceiro;
  performance?: {
    totalGanhas: number;
    valorTotal: number;
  };
  score_compatibilidade: number;
  motivos_score: string;
  ai_reasoning?: string;
}

interface SuggestionResponse {
  suggestions: ParceiroComScoreIA[];
  aiAnalysis?: string;
  oportunidade: any;
}

export const SugestoesParceirosIA: React.FC<SugestoesParceirosIAProps> = ({
  oportunidadeId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ParceiroComScoreIA[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [oportunidade, setOportunidade] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, [oportunidadeId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-partners', {
        body: { oportunidadeId }
      });

      if (error) throw error;

      const response: SuggestionResponse = data;
      setSuggestions(response.suggestions || []);
      setAiAnalysis(response.aiAnalysis || "");
      setOportunidade(response.oportunidade);

    } catch (error) {
      console.error("Erro ao buscar sugestões de IA:", error);
      toast({
        title: "Erro",
        description: "Não foi possível obter sugestões de parceiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sugestões Inteligentes de Parceiros
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Analisando compatibilidade com IA...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações da Oportunidade */}
            {oportunidade && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Oportunidade Analisada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">Nome:</span> {oportunidade.nome_lead}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span> {oportunidade.valor ? `R$ ${oportunidade.valor.toLocaleString('pt-BR')}` : 'Não informado'}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Origem → Destino:</span> {oportunidade.empresa_origem?.nome} → {oportunidade.empresa_destino?.nome}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Análise Geral da IA */}
            {aiAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Análise Inteligente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{aiAnalysis}</p>
                </CardContent>
              </Card>
            )}

            {/* Sugestões de Parceiros */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parceiros Recomendados</h3>
              
              {suggestions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhuma sugestão disponível para esta oportunidade.</p>
                  </CardContent>
                </Card>
              ) : (
                suggestions.map((parceiro, index) => (
                  <Card key={parceiro.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                              #{index + 1}
                            </span>
                            <h4 className="font-medium text-lg">{parceiro.nome}</h4>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getScoreColor(parceiro.score_compatibilidade)}`}
                            >
                              {getScoreIcon(parceiro.score_compatibilidade)}
                              {Math.round(parceiro.score_compatibilidade)}%
                            </Badge>
                          </div>
                          
                          {parceiro.descricao && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {parceiro.descricao}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        {/* Indicadores */}
                        {parceiro.indicadores && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Indicadores</h5>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Engajamento:</span>
                                <span>{parceiro.indicadores.engajamento}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Potencial Leads:</span>
                                <span>{parceiro.indicadores.potencial_leads}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tamanho:</span>
                                <span>{parceiro.indicadores.tamanho}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Performance */}
                        {parceiro.performance && parceiro.performance.totalGanhas > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Performance</h5>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Oportunidades Ganhas:</span>
                                <span>{parceiro.performance.totalGanhas}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Valor Total:</span>
                                <span>R$ {parceiro.performance.valorTotal.toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Justificativas */}
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-sm">Critérios de Score:</span>
                          <p className="text-xs text-muted-foreground">{parceiro.motivos_score}</p>
                        </div>
                        
                        {parceiro.ai_reasoning && (
                          <div>
                            <span className="font-medium text-sm flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              Análise IA:
                            </span>
                            <p className="text-xs text-muted-foreground">{parceiro.ai_reasoning}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={fetchSuggestions} disabled={loading}>
                <Brain className="h-4 w-4 mr-2" />
                Reanalizar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
