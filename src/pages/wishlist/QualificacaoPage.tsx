
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { Clock, CheckCircle, ArrowRight, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const QualificacaoPage: React.FC = () => {
  const { loading } = useWishlist();

  // TODO: Implementar busca de dados de qualificação do backend
  // Por enquanto, mantendo apenas a estrutura visual
  const clientesPendentes: never[] = [];
  const clientesQualificados: never[] = [];
  const clientesConvertidos: never[] = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando qualificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Qualificação Colaborativa
          </h1>
          <p className="text-muted-foreground text-sm">
            Avalie o potencial de cada cliente e converta os melhores em oportunidades
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesPendentes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{clientesQualificados.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{clientesConvertidos.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Qualificação */}
      <Tabs defaultValue="pendentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({clientesPendentes.length})</TabsTrigger>
          <TabsTrigger value="qualificados">Qualificados ({clientesQualificados.length})</TabsTrigger>
          <TabsTrigger value="convertidos">Convertidos ({clientesConvertidos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente para qualificação</h3>
              <p className="text-muted-foreground">
                Os dados de qualificação serão carregados do backend quando disponíveis
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualificados" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente qualificado</h3>
              <p className="text-muted-foreground">
                Os dados de qualificação serão carregados do backend quando disponíveis
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convertidos" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <ArrowRight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum cliente convertido</h3>
              <p className="text-muted-foreground">
                Os dados de qualificação serão carregados do backend quando disponíveis
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualificacaoPage;
