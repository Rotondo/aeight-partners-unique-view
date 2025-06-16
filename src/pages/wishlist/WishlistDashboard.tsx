import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, Users, Presentation, TrendingUp, Plus, CheckCircle, CornerUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const WishlistDashboard: React.FC = () => {
  const { stats, loading, wishlistItems, apresentacoes } = useWishlist();
  const navigate = useNavigate();

  // Atividade recente dinâmica baseada nas últimas ações reais
  const recentActivities = useMemo(() => {
    // Busca últimas 5 atividades relevantes: criação/edição de wishlist, aprovação, apresentação criada/realizada/conversão
    const activities: Array<{
      type: "wishlist" | "apresentacao" | "conversao";
      title: string;
      description: string;
      date: string;
      icon: React.ReactNode;
    }> = [];

    // Últimas solicitações de wishlist criadas
    wishlistItems
      .slice(0, 5)
      .forEach((item) => {
        activities.push({
          type: "wishlist",
          title: "Nova solicitação de apresentação",
          description: `${item.empresa_interessada?.nome || "Empresa"} interessada em ${item.empresa_desejada?.nome || "cliente"} (${item.empresa_proprietaria?.nome || "proprietário"})`,
          date: item.created_at,
          icon: <Heart className="h-4 w-4 text-pink-500" />,
        });
        if (item.status === "aprovado" && item.updated_at !== item.created_at) {
          activities.push({
            type: "wishlist",
            title: "Solicitação aprovada",
            description: `Solicitação para ${item.empresa_desejada?.nome || "cliente"} aprovada`,
            date: item.updated_at,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          });
        }
        if (item.status === "convertido" && item.updated_at !== item.created_at) {
          activities.push({
            type: "conversao",
            title: "Solicitação convertida em oportunidade",
            description: `Solicitação para ${item.empresa_desejada?.nome || "cliente"} convertida`,
            date: item.updated_at,
            icon: <CornerUpRight className="h-4 w-4 text-blue-600" />,
          });
        }
      });

    // Últimas apresentações
    apresentacoes
      .forEach((a) => {
        activities.push({
          type: "apresentacao",
          title: a.status_apresentacao === "realizada"
            ? "Apresentação realizada"
            : "Apresentação registrada",
          description:
            a.wishlist_item?.empresa_interessada?.nome +
            " → " +
            a.wishlist_item?.empresa_desejada?.nome +
            (a.converteu_oportunidade ? " (convertida em oportunidade)" : ""),
          date: a.created_at,
          icon: <Presentation className="h-4 w-4 text-purple-500" />,
        });
        if (a.status_apresentacao === "realizada" && a.updated_at !== a.created_at) {
          activities.push({
            type: "apresentacao",
            title: "Apresentação marcada como realizada",
            description: a.wishlist_item?.empresa_interessada?.nome +
              " → " +
              a.wishlist_item?.empresa_desejada?.nome,
            date: a.updated_at,
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          });
        }
        if (a.converteu_oportunidade && a.updated_at !== a.created_at) {
          activities.push({
            type: "conversao",
            title: "Apresentação convertida em oportunidade",
            description: a.wishlist_item?.empresa_desejada?.nome,
            date: a.updated_at,
            icon: <CornerUpRight className="h-4 w-4 text-blue-600" />,
          });
        }
      });

    activities.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return activities.slice(0, 5);
  }, [wishlistItems, apresentacoes]);

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
          <Button onClick={() => navigate("/wishlist/apresentacoes")} variant="outline">
            <Presentation className="mr-2 h-4 w-4" />
            Apresentações
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
            {recentActivities.length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhuma atividade recente encontrada.</div>
            )}
            {recentActivities.map((activity, idx) => (
              <div className="flex items-center" key={idx}>
                <div className="mr-2">{activity.icon}</div>
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {activity.description}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
                  {activity.date
                    ? formatDistanceToNowStrict(
                        typeof activity.date === "string"
                          ? parseISO(activity.date)
                          : activity.date,
                        { addSuffix: true, locale: ptBR }
                      )
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistDashboard;