
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, Users, Presentation, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WishlistDashboard: React.FC = () => {
  const { stats, loading } = useWishlist();
  const navigate = useNavigate();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist & Networking</h1>
          <p className="text-muted-foreground">
            Gerencie relacionamentos estratégicos e facilite networking entre parceiros
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/wishlist/clientes")} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Gerenciar Clientes
          </Button>
          <Button onClick={() => navigate("/wishlist/items")}>
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
              +20% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Badge variant="outline" className="px-2 py-1">
              {stats?.solicitacoesPendentes || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.solicitacoesPendentes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando aprovação
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => navigate("/wishlist/clientes")}>
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
              onClick={() => navigate("/wishlist/items")}>
          <CardHeader>
            <CardTitle className="text-lg">Wishlist Items</CardTitle>
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
              onClick={() => navigate("/wishlist/apresentacoes")}>
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
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Nova solicitação de apresentação
                </p>
                <p className="text-sm text-muted-foreground">
                  B8one interessada em cliente da Blip
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">2h atrás</div>
            </div>
            <div className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Apresentação realizada
                </p>
                <p className="text-sm text-muted-foreground">
                  Empresa facilitada pela Blip converteu em oportunidade
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">1d atrás</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistDashboard;
