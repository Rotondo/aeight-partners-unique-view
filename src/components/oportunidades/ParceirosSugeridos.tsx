
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empresa, IndicadoresParceiro } from "@/types";
import { Star, TrendingUp, Users, Target } from "lucide-react";

interface ParceirosSugeridosProps {
  categoriaId?: string;
  valorOportunidade?: number;
  onSelectParceiro: (parceiro: Empresa) => void;
}

interface ParceiroComScore extends Empresa {
  indicadores?: IndicadoresParceiro;
  score_compatibilidade: number;
  motivo_sugestao: string;
}

export const ParceirosSugeridos: React.FC<ParceirosSugeridosProps> = ({
  categoriaId,
  valorOportunidade,
  onSelectParceiro,
}) => {
  const [parceiros, setParceiros] = useState<ParceiroComScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoriaId) {
      fetchParceirosSugeridos();
    }
  }, [categoriaId, valorOportunidade]);

  const fetchParceirosSugeridos = async () => {
    setLoading(true);
    try {
      // Buscar parceiros com indicadores
      const { data: parceirosData, error } = await supabase
        .from("empresas")
        .select(`
          *,
          indicadores_parceiro (*)
        `)
        .eq("tipo", "parceiro")
        .eq("status", true);

      if (error) throw error;

      // Calcular score de compatibilidade (algoritmo simples por enquanto)
      const parceirosComScore: ParceiroComScore[] = (parceirosData || []).map(parceiro => {
        const indicadores = parceiro.indicadores_parceiro?.[0];
        let score = 0;
        let motivo = "";

        if (indicadores) {
          // Score baseado no engajamento e potencial de leads
          score += indicadores.engajamento * 0.3;
          score += indicadores.potencial_leads * 0.25;
          score += indicadores.alinhamento * 0.25;
          score += indicadores.potencial_investimento * 0.2;

          // Ajuste baseado no valor da oportunidade
          if (valorOportunidade) {
            if (valorOportunidade > 50000 && indicadores.tamanho === "G") {
              score += 10;
              motivo = "Adequado para oportunidades de alto valor";
            } else if (valorOportunidade <= 10000 && indicadores.tamanho === "P") {
              score += 8;
              motivo = "Especializado em pequenas oportunidades";
            } else {
              motivo = "Bom alinhamento geral";
            }
          } else {
            motivo = "Parceiro bem avaliado";
          }
        } else {
          score = 50; // Score padrão para parceiros sem indicadores
          motivo = "Parceiro cadastrado";
        }

        return {
          ...parceiro,
          indicadores,
          score_compatibilidade: Math.min(100, Math.max(0, score)),
          motivo_sugestao: motivo,
        };
      });

      // Ordenar por score
      parceirosComScore.sort((a, b) => b.score_compatibilidade - a.score_compatibilidade);

      setParceiros(parceirosComScore.slice(0, 5)); // Top 5
    } catch (error) {
      console.error("Erro ao buscar parceiros sugeridos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Star className="h-4 w-4" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  if (!categoriaId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-2" />
          <p>Selecione uma categoria para ver sugestões de parceiros</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Parceiros Sugeridos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Baseado na categoria e valor da oportunidade
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center p-4">Analisando parceiros...</div>
        ) : parceiros.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            Nenhum parceiro encontrado para esta categoria
          </div>
        ) : (
          <div className="space-y-3">
            {parceiros.map((parceiro) => (
              <div
                key={parceiro.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{parceiro.nome}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getScoreColor(parceiro.score_compatibilidade)}`}
                      >
                        {getScoreIcon(parceiro.score_compatibilidade)}
                        {Math.round(parceiro.score_compatibilidade)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {parceiro.motivo_sugestao}
                    </p>
                    {parceiro.indicadores && (
                      <div className="flex gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Engajamento: {parceiro.indicadores.engajamento}/10
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Tamanho: {parceiro.indicadores.tamanho}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectParceiro(parceiro)}
                  >
                    Selecionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
