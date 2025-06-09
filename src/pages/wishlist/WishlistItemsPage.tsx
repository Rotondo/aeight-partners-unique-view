
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, Search, Heart, Calendar, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WishlistStatus } from "@/types";

const WishlistItemsPage: React.FC = () => {
  const { wishlistItems, loading } = useWishlist();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WishlistStatus | "all">("all");

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = 
      item.empresa_interessada?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empresa_desejada?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.empresa_proprietaria?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: WishlistStatus) => {
    switch (status) {
      case "pendente":
        return "secondary";
      case "em_andamento":
        return "outline";
      case "aprovado":
        return "default";
      case "rejeitado":
        return "destructive";
      case "convertido":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: WishlistStatus) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "em_andamento":
        return "Em Andamento";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      case "convertido":
        return "Convertido";
      default:
        return status;
    }
  };

  const getPriorityStars = (prioridade: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < prioridade ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist Items</h1>
          <p className="text-muted-foreground">
            Gerencie solicitações de interesse e apresentações
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Solicitação
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: WishlistStatus | "all") => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="aprovado">Aprovado</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Badge variant="secondary">{wishlistItems.filter(i => i.status === "pendente").length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wishlistItems.filter(i => i.status === "pendente").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <Badge variant="default">{wishlistItems.filter(i => i.status === "aprovado").length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wishlistItems.filter(i => i.status === "aprovado").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convertidos</CardTitle>
            <Badge variant="default">{wishlistItems.filter(i => i.status === "convertido").length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wishlistItems.filter(i => i.status === "convertido").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Items */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {item.empresa_interessada?.nome} → {item.empresa_desejada?.nome}
                  </CardTitle>
                  <CardDescription>
                    Proprietário: {item.empresa_proprietaria?.nome}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  <div className="flex items-center">
                    {getPriorityStars(item.prioridade)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  Solicitado em {" "}
                  {format(new Date(item.data_solicitacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
                
                {item.motivo && (
                  <div>
                    <p className="text-sm font-medium">Motivo:</p>
                    <p className="text-sm text-muted-foreground">{item.motivo}</p>
                  </div>
                )}
                
                {item.observacoes && (
                  <div>
                    <p className="text-sm font-medium">Observações:</p>
                    <p className="text-sm text-muted-foreground">{item.observacoes}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  {item.status === "pendente" && (
                    <>
                      <Button variant="outline" size="sm">
                        Aprovar
                      </Button>
                      <Button variant="outline" size="sm">
                        Rejeitar
                      </Button>
                    </>
                  )}
                  {item.status === "aprovado" && (
                    <Button variant="outline" size="sm">
                      Facilitar Apresentação
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== "all" ? "Tente ajustar os filtros de busca" : "Adicione o primeiro item à wishlist"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Solicitação
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WishlistItemsPage;
