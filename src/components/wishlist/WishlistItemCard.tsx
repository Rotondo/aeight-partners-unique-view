import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Loader2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WishlistStatus, WishlistItem } from "@/types";
import { PrivateData } from "@/components/privacy/PrivateData";

interface WishlistItemCardProps {
  item: WishlistItem;
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  actionLoadingId: string | null;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onAprovar,
  onRejeitar,
  onEditar,
  actionLoadingId,
}) => {
  const toSafeNumber = (val: unknown, fallback = 3): number => {
    return typeof val === "number" && !isNaN(val) ? val : fallback;
  };

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
        className={`h-3 w-3 ${
          i < prioridade ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              <PrivateData type="company">
                {item.empresa_interessada?.nome || (
                  <span style={{ color: "red" }}>[ERRO: Empresa interessada não encontrada]</span>
                )}
              </PrivateData>{" "} →{" "}
              <PrivateData type="company">
                {item.empresa_desejada?.nome || (
                  <span style={{ color: "red" }}>[ERRO: Empresa desejada não encontrada]</span>
                )}
              </PrivateData>
            </CardTitle>
            <CardDescription>
              Proprietário: <PrivateData type="company">
                {item.empresa_proprietaria?.nome || (
                  <span style={{ color: "red" }}>[ERRO: Proprietário não encontrado]</span>
                )}
              </PrivateData>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(item.status)}>
              {getStatusLabel(item.status)}
            </Badge>
            <div className="flex items-center">
              {getPriorityStars(toSafeNumber(item.prioridade, 3))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Solicitado em{" "}
            {item.data_solicitacao
              ? format(
                  new Date(item.data_solicitacao),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: ptBR }
                )
              : <span style={{ color: "red" }}>[ERRO: Data não encontrada]</span>}
          </div>
          {item.motivo && (
            <div>
              <p className="text-sm font-medium">Motivo:</p>
              <p className="text-sm text-muted-foreground">
                <PrivateData type="generic">
                  {item.motivo}
                </PrivateData>
              </p>
            </div>
          )}
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
                  disabled={actionLoadingId === item.id}
                >
                  {actionLoadingId === item.id ? (
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
                  disabled={actionLoadingId === item.id}
                >
                  {actionLoadingId === item.id ? (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistItemCard;