
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Edit, CheckCircle, XCircle, Eye } from "lucide-react";
import { WishlistItem } from "@/types";
import { PrivateData } from "@/components/privacy/PrivateData";
import { format } from "date-fns";

interface WishlistItemsTableProps {
  items: WishlistItem[];
  onAprovar: (item: WishlistItem) => void;
  onRejeitar: (item: WishlistItem) => void;
  onEditar: (item: WishlistItem) => void;
  onVerOportunidade?: (item: WishlistItem) => void;
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
  onVerOportunidade,
  actionLoadingId,
  sortField,
  sortDirection,
  onSort,
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return (
      <ArrowUpDown
        className={`h-4 w-4 ${
          sortDirection === "asc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: "bg-yellow-50 text-yellow-700 border-yellow-200",
      em_andamento: "bg-orange-50 text-orange-700 border-orange-200",
      aprovado: "bg-green-50 text-green-700 border-green-200",
      rejeitado: "bg-red-50 text-red-700 border-red-200",
      convertido: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants] || ""}
      >
        {status}
      </Badge>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("empresa_interessada.nome")}
            >
              <div className="flex items-center gap-2">
                Interessada
                {getSortIcon("empresa_interessada.nome")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("empresa_desejada.nome")}
            >
              <div className="flex items-center gap-2">
                Desejada
                {getSortIcon("empresa_desejada.nome")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("empresa_proprietaria.nome")}
            >
              <div className="flex items-center gap-2">
                Proprietária
                {getSortIcon("empresa_proprietaria.nome")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("prioridade")}
            >
              <div className="flex items-center gap-2">
                Prioridade
                {getSortIcon("prioridade")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center gap-2">
                Status
                {getSortIcon("status")}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort("data_solicitacao")}
            >
              <div className="flex items-center gap-2">
                Data
                {getSortIcon("data_solicitacao")}
              </div>
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>
                <PrivateData>
                  {item.empresa_interessada?.nome || "N/A"}
                </PrivateData>
              </TableCell>
              <TableCell>
                <PrivateData>
                  {item.empresa_desejada?.nome || "N/A"}
                </PrivateData>
              </TableCell>
              <TableCell>
                <PrivateData>
                  {item.empresa_proprietaria?.nome || "N/A"}
                </PrivateData>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.prioridade}</Badge>
              </TableCell>
              <TableCell>{getStatusBadge(item.status)}</TableCell>
              <TableCell>
                {format(new Date(item.data_solicitacao), "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* Ver Oportunidade button */}
                  {onVerOportunidade && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onVerOportunidade(item)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver oportunidade
                    </Button>
                  )}

                  {/* Edit button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditar(item)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>

                  {/* Action buttons based on status */}
                  {item.status === "pendente" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAprovar(item)}
                        disabled={actionLoadingId === item.id}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRejeitar(item)}
                        disabled={actionLoadingId === item.id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </>
                  )}
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
