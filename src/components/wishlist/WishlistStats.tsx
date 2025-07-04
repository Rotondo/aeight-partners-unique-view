import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { WishlistItem } from "@/types";

interface WishlistStatsProps {
  items: WishlistItem[];
}

const WishlistStats: React.FC<WishlistStatsProps> = ({ items }) => {
  const totalItems = items.length;
  const pendingItems = items.filter((i) => i.status === "pendente").length;
  const approvedItems = items.filter((i) => i.status === "aprovado").length;
  const convertedItems = items.filter((i) => i.status === "convertido").length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Badge variant="secondary">{pendingItems}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingItems}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
          <Badge variant="default">{approvedItems}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{approvedItems}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
          <Badge variant="default">{convertedItems}</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{convertedItems}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistStats;