
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Edit, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { WishlistItem } from "@/types";
import { format } from "date-fns";

interface WishlistItemsTableProps {
  items: WishlistItem[];
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  actionLoadingId: string | null;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
}

const WishlistItemsTable: React.FC<WishlistItemsTableProps> = ({
  items,
  onAprovar,
  onRejeitar,
  onEditar,
  actionLoadingId,
  sortField,
  sortDirection,
  onSort,
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: "secondary" as const, label: "Pendente" },
      em_andamento: { variant: "default" as const, label: "Em Andamento" },
      aprovado: { variant: "default" as const, label: "Aprovado" },
      rejeitado: { variant: "destructive" as const, label: "Rejeitado" },
      convertido: { variant: "default" as const, label: "Convertido" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityStars = (priority: number) => {
    // Inverted priority: 1 = 5 stars (max), 5 = 1 star (min)
    const stars = 6 - priority;
    return "★".repeat(stars) + "☆".repeat(5 - stars);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum item encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("empresa_interessada.nome")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Cliente {getSortIcon("empresa_interessada.nome")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("empresa_proprietaria.nome")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Origem {getSortIcon("empresa_proprietaria.nome")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("empresa_desejada.nome")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Destino {getSortIcon("empresa_desejada.nome")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("prioridade")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Prioridade {getSortIcon("prioridade")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("status")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Status {getSortIcon("status")}
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => onSort("data_solicitacao")} className="h-auto p-0 font-semibold hover:bg-transparent">
                Data Solicitação {getSortIcon("data_solicitacao")}
              </Button>
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.empresa_interessada?.nome || "N/A"}
              </TableCell>
              <TableCell>
                {item.empresa_proprietaria?.nome || "N/A"}
              </TableCell>
              <TableCell>
                {item.empresa_desejada?.nome || "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{getPriorityStars(item.prioridade)}</span>
                  <span className="text-xs text-muted-foreground">({item.prioridade})</span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(item.status)}
              </TableCell>
              <TableCell>
                {format(new Date(item.data_solicitacao), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {item.status === "pendente" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAprovar(item)}
                        disabled={actionLoadingId === item.id}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRejeitar(item)}
                        disabled={actionLoadingId === item.id}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditar(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WishlistItemsTable;
