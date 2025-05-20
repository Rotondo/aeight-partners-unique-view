
import React, { useState } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Edit, Trash2, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { OportunidadeDetails } from "./OportunidadeDetails";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OportunidadesExport } from "./OportunidadesExport";
import { StatusOportunidade } from "@/types";

interface OportunidadesListProps {
  onEdit: (id: string) => void;
}

export const OportunidadesList: React.FC<OportunidadesListProps> = ({ onEdit }) => {
  const { filteredOportunidades, isLoading, deleteOportunidade } = useOportunidades();
  const { user } = useAuth();
  const [selectedOportunidadeId, setSelectedOportunidadeId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const getStatusBadge = (status: StatusOportunidade) => {
    switch (status) {
      case "em_contato":
        return <Badge className="bg-blue-500">Em Contato</Badge>;
      case "negociando":
        return <Badge className="bg-yellow-500">Negociando</Badge>;
      case "ganho":
        return <Badge className="bg-green-500">Ganho</Badge>;
      case "perdido":
        return <Badge className="bg-red-500">Perdido</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    await deleteOportunidade(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!filteredOportunidades.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nenhuma oportunidade encontrada com os filtros atuais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {filteredOportunidades.length} oportunidade(s) encontrada(s)
        </h3>
        <Button onClick={() => setIsExportOpen(true)} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> 
          Exportar
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOportunidades.map((op) => (
              <TableRow key={op.id}>
                <TableCell>{formatDate(op.data_indicacao)}</TableCell>
                <TableCell>{op.empresa_origem?.nome || "-"}</TableCell>
                <TableCell>{op.empresa_destino?.nome || "-"}</TableCell>
                <TableCell>{op.contato?.nome || "-"}</TableCell>
                <TableCell>{formatCurrency(op.valor)}</TableCell>
                <TableCell>{getStatusBadge(op.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setSelectedOportunidadeId(op.id)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Oportunidade</DialogTitle>
                        </DialogHeader>
                        {selectedOportunidadeId && (
                          <OportunidadeDetails id={selectedOportunidadeId} />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onEdit(op.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    {user?.papel === "admin" && (
                      <ConfirmDialog
                        title="Confirmar exclusão"
                        description="Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita."
                        onConfirm={() => handleDelete(op.id)}
                      >
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ConfirmDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
          </DialogHeader>
          <OportunidadesExport onClose={() => setIsExportOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
