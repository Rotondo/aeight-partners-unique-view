
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/contexts/WishlistContext";
import { ChevronLeft, Plus, ExternalLink, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WishlistApresentacao, PipelineFase, StatusApresentacao } from "@/types";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { WishlistOportunidadeIntegration } from "@/components/wishlist/WishlistOportunidadeIntegration";
import { toast } from "@/hooks/use-toast";

const CONSOLE_PREFIX = "[ApresentacoesPage]";

const ApresentacoesPage: React.FC = () => {
  const {
    apresentacoes,
    loading,
    fetchApresentacoes,
    updateApresentacao,
  } = useWishlist();

  const navigate = useNavigate();
  const [selectedApresentacao, setSelectedApresentacao] = useState<WishlistApresentacao | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleFaseChange = async (apresentacao: WishlistApresentacao, novaFase: PipelineFase) => {
    setUpdatingId(apresentacao.id);
    try {
      await updateApresentacao?.(apresentacao.id, { fase_pipeline: novaFase });
      
      // Se mudou para "apresentado", mostra toast explicativo sobre criação da oportunidade
      if (novaFase === "apresentado" && !apresentacao.oportunidade_id) {
        toast({
          title: "🎯 Apresentação realizada!",
          description: "Uma oportunidade será criada automaticamente e aparecerá na seção de Oportunidades.",
          duration: 5000,
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate("/oportunidades")}>
              <Target className="h-3 w-3 mr-1" />
              Ver Oportunidades
            </Button>
          ),
        });
      }
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao atualizar fase:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a fase da apresentação.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeColor = (status: StatusApresentacao) => {
    switch (status) {
      case "realizada":
        return "bg-green-100 text-green-700 border-green-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-200";
      case "agendada":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getFaseBadgeColor = (fase: PipelineFase) => {
    switch (fase) {
      case "apresentado":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "aguardando_feedback":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "convertido":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejeitado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Apresentações carregadas:`, apresentacoes?.length);
  }, [apresentacoes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando apresentações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/wishlist")} className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar ao Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pipeline de Apresentações</h1>
            <p className="text-muted-foreground">
              Gerencie o progresso das apresentações e acompanhe a criação de oportunidades
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoModeToggle />
          <Button
            variant="outline"
            onClick={() => navigate("/oportunidades")}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver Oportunidades
          </Button>
          <Button onClick={() => navigate("/wishlist/itens")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Explicação da Integração */}
      <WishlistOportunidadeIntegration showDetailedFlow={false} className="mb-6" />

      {/* Lista de Apresentações */}
      <div className="grid gap-4">
        {apresentacoes && apresentacoes.length > 0 ? (
          apresentacoes.map((apresentacao) => (
            <Card key={apresentacao.id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">
                      {apresentacao.wishlist_item?.empresa_interessada?.nome} 
                      {" → "} 
                      {apresentacao.wishlist_item?.empresa_desejada?.nome}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusBadgeColor(apresentacao.status_apresentacao)}>
                        {apresentacao.status_apresentacao}
                      </Badge>
                      <Badge className={getFaseBadgeColor(apresentacao.fase_pipeline)}>
                        {apresentacao.fase_pipeline}
                      </Badge>
                      {apresentacao.oportunidade_id && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <Target className="h-3 w-3 mr-1" />
                          Oportunidade Criada
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {apresentacao.oportunidade_id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate("/oportunidades")}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver Oportunidade
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Facilitador:</span>{" "}
                      {apresentacao.empresa_facilitadora?.nome || "Não informado"}
                    </div>
                    <div>
                      <span className="font-medium">Data Planejada:</span>{" "}
                      {apresentacao.data_planejada 
                        ? new Date(apresentacao.data_planejada).toLocaleDateString("pt-BR") 
                        : "Não definida"
                      }
                    </div>
                  </div>

                  {apresentacao.feedback && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{apresentacao.feedback}</p>
                    </div>
                  )}

                  {/* Botões de mudança de fase */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Alterar fase:</span>
                      <div className="flex gap-1">
                        {["planejado", "aprovado", "apresentado", "aguardando_feedback", "convertido", "rejeitado"].map((fase) => (
                          <Button
                            key={fase}
                            variant={apresentacao.fase_pipeline === fase ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFaseChange(apresentacao, fase as PipelineFase)}
                            disabled={updatingId === apresentacao.id}
                            className="text-xs"
                          >
                            {updatingId === apresentacao.id && apresentacao.fase_pipeline === fase ? "..." : fase}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Nenhuma apresentação encontrada</p>
                <Button onClick={() => navigate("/wishlist/itens")}>
                  Criar Nova Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApresentacoesPage;
