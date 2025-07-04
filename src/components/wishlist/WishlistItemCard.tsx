import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WishlistItem } from "@/types";
import { PrivateData } from "@/components/privacy/PrivateData";

interface WishlistItemCardProps {
  item: WishlistItem;
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  isActionLoading: boolean;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onAprovar,
  onRejeitar,
  onEditar,
  isActionLoading,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "aprovado":
        return "bg-green-100 text-green-800";
      case "rejeitado":
        return "bg-red-100 text-red-800";
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "concluido":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "aprovado":
        return "Aprovado";
      case "rejeitado":
        return "Rejeitado";
      case "em_andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            <div className="flex items-center gap-2">
              <PrivateData type="company">
                {item.empresa_interessada?.nome || "N/A"}
              </PrivateData>
              <span className="text-muted-foreground">→</span>
              <PrivateData type="company">
                {item.empresa_desejada?.nome || "N/A"}
              </PrivateData>
            </div>
          </CardTitle>
          <Badge className={getStatusColor(item.status)}>
            {getStatusText(item.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-muted-foreground">Proprietário:</p>
            <p className="font-medium">
              <PrivateData type="company">
                {item.empresa_proprietaria?.nome || "N/A"}
              </PrivateData>
            </p>
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Prioridade:</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < item.prioridade
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(item.data_solicitacao), "dd 'de' MMMM 'de' yyyy", {
              locale: ptBR,
            })}
          </span>
        </div>

        <div>
          <p className="text-sm font-medium">Motivo:</p>
          <p className="text-sm text-muted-foreground">
            <PrivateData type="generic">
              {item.motivo}
            </PrivateData>
          </p>
        </div>

        {item.observacoes && (
          <div>
            <p className="text-sm font-medium">Observações:</p>
            <p className="text-sm text-muted-foreground">
              <PrivateData type="generic">
                {item.observacoes}
              </PrivateData>
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {item.status === "pendente" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAprovar(item)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                Aprovar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRejeitar(item)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-1" />
                )}
                Rejeitar
              </Button>
            </>
          )}
          {item.status === "aprovado" && (
            <Button variant="outline" size="sm">
              Facilitar Apresentação
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditar(item)}
          >
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItemCard;