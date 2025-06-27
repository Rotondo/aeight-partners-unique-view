import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, Users, Presentation, TrendingUp, Plus, Eye, Monitor, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientesSobrepostos } from "@/hooks/useClientesSobrepostos";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";

const WishlistDashboard: React.FC = () => {
  const { stats, loading, apresentacoes, wishlistItems } = useWishlist();
  const { totalSobrepostos, getClientesMaisCompartilhados } = useClientesSobrepostos();
  const navigate = useNavigate();

  // Buscar atividades recentes reais
  const getRecentActivities = () => {
    const activities = [];

    // Adicionar wishlist items recentes
    const recentWishlistItems = wishlistItems
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    recentWishlistItems.forEach(item => {
      activities.push({
        type: 'wishlist',
        message: `Nova solicitação de apresentação`,
        detail: `${item.empresa_interessada?.nome} interessada em cliente da ${item.empresa_proprietaria?.nome}`,
        time: new Date(item.created_at)
      });
    });

    // Adicionar apresentações recentes
    const recentApresentacoes = apresentacoes
      .filter(a => a.converteu_oportunidade)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 2);

    recentApresentacoes.forEach(apresentacao => {
      activities.push({
        type: 'apresentacao',
        message: 'Apresentação realizada',
        detail: `Empresa facilitada pela ${apresentacao.empresa_facilitadora?.nome} converteu em oportunidade`,
        time: new Date(apresentacao.created_at)
      });
    });

    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 5);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d atrás`;
    if (diffHours > 0) return `${diffHours}h atrás`;
    return 'Agora mesmo';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist - Networking Inteligente</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DemoModeToggle />
          <Button onClick={() => navigate("modo-apresentacao")} variant="outline">
            <Monitor className="mr-2 h-4 w-4" />
            Troca & Apresentação
          </Button>
          <Button onClick={() => navigate("sobrepostos")} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Clientes Sobrepostos
          </Button>
          <Button onClick={() => navigate("itens")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSolicitacoes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de itens na wishlist
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apresentações</CardTitle>
            <Presentation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.apresentacoesRealizadas || 0}</div>
            <p className="text-xs text-muted-foreground">
              Realizadas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversaoOportunidades || 0}</div>
            <p className="text-xs text-muted-foreground">
              Para oportunidades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.empresasMaisDesejadas?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Empresas cadastradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow - atualizado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("sobrepostos")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Eye className="mr-2 h-5 w-5 text-orange-500" />
              1. Identificar Sobreposições
            </CardTitle>
            <CardDescription>
              Detecte clientes compartilhados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">Fase 1</Badge>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("modo-apresentacao")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Monitor className="mr-2 h-5 w-5 text-blue-500" />
              2. Troca & Apresentação
            </CardTitle>
            <CardDescription>
              Interface unificada para reuniões e negociação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Monitor className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("qualificacao")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Star className="mr-2 h-5 w-5 text-purple-500" />
              3. Qualificação
            </CardTitle>
            <CardDescription>
              Avalie e converta clientes em oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Star className="mr-2 h-4 w-4" />
              Qualificar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Acesso Rápido - Funcionalidades Originais */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Adicionais</CardTitle>
          <CardDescription>
            Acesso rápido às funcionalidades complementares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" onClick={() => navigate("clientes")} className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Base de Clientes</div>
                  <div className="text-sm text-muted-foreground">Gerencie carteiras</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" onClick={() => navigate("itens")} className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Heart className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Wishlist Itens</div>
                  <div className="text-sm text-muted-foreground">Solicitações de interesse</div>
                </div>
              </div>
            </Button>

            <Button variant="outline" onClick={() => navigate("apresentacoes")} className="h-auto p-4">
              <div className="flex flex-col items-center gap-2">
                <Presentation className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Apresentações</div>
                  <div className="text-sm text-muted-foreground">Facilitações realizadas</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas movimentações na wishlist e networking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <PrivateData type="generic">
                        {activity.detail}
                      </PrivateData>
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {formatTimeAgo(activity.time)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade recente encontrada
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-muted-foreground text-right pt-2">
        Desenvolvido por Thiago Rotondo
      </div>
    </div>
  );
};

export default WishlistDashboard;
