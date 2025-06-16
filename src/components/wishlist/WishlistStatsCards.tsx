import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Presentation, TrendingUp, Users } from "lucide-react";
import { WishlistStats } from "@/types";

/**
 * Cards de estatísticas para o dashboard da wishlist.
 */
type Props = {
  stats?: WishlistStats | null;
};

const WishlistStatsCards: React.FC<Props> = ({ stats }) => (
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
);

export default WishlistStatsCards;