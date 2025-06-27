import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, Users, Presentation, TrendingUp, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientesSobrepostos } from "@/hooks/useClientesSobrepostos";
import ClientesSobrepostosAlert from "@/components/wishlist/ClientesSobrepostosAlert";

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
  const clientesMaisCompartilhados = getClientesMaisCompartilhados(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WishLift - Networking Inteligente</h1>
          <p className="text-muted-foreground">
            Centralize clientes, identifique sobreposições e facilite networking estratégico
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("sobrepostos")} variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Clientes Sobrepostos
          </Button>
          <Button onClick={() => navigate("clientes")} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Gerenciar Clientes
          </Button>
          <Button onClick={() => navigate("itens")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Alert de Clientes Sobrepostos */}
      <ClientesSobrepostosAlert
        totalSobrepostos={totalSobrepostos}
        novosSobrepostos={clientesMaisCompartilhados.map(c => c.nome)}
      />

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
            <CardTitle className="text-sm font-medium">Clientes Compartilhados</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalSobrepostos}</div>
            <p className="text-xs text-muted-foreground">
              Oportunidades de networking
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
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate("sobrepostos")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Eye className="mr-2 h-5 w-5 text-orange-500" />
              Clientes Compartilhados
            </CardTitle>
            <CardDescription>
              Veja intersecções e oportunidades de networking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-600">{totalSobrepostos}</span>
              <Badge variant="secondary">Novo!</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate("clientes")}>
          <CardHeader>
            <CardTitle className="text-lg">Base de Clientes</CardTitle>
            <CardDescription>
              Gerencie a base de clientes de cada parceiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate("itens")}>
          <CardHeader>
            <CardTitle className="text-lg">Wishlist Itens</CardTitle>
            <CardDescription>
              Visualize e gerencie todas as solicitações de interesse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Heart className="mr-2 h-4 w-4" />
              Acessar
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate("apresentacoes")}>
          <CardHeader>
            <CardTitle className="text-lg">Apresentações</CardTitle>
            <CardDescription>
              Acompanhe apresentações e facilitações realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Presentation className="mr-2 h-4 w-4" />
              Acessar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity - Agora com dados reais */}
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
                      {activity.detail}
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
    </div>
  );
};

export default WishlistDashboard;
