import React, { useState, useMemo } from "react";
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
  TableRow,
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
} from "@/components/ui/dialog";
import { OportunidadeDetails } from "./OportunidadesDetails";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { OportunidadesExport } from "./OportunidadesExport";
import { StatusOportunidade } from "@/types";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface OportunidadesListProps {
  onEdit: (id: string) => void;
}

function getGrupoStatus(origemTipo?: string, destinoTipo?: string) {
  if (origemTipo === "intragrupo" && destinoTipo === "intragrupo") return "intragrupo";
  if (origemTipo && destinoTipo) return "extragrupo";
  return undefined;
}

export const OportunidadesList: React.FC<OportunidadesListProps> = ({ onEdit }) => {
  const { filteredOportunidades, isLoading, deleteOportunidade, oportunidades } = useOportunidades();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedOportunidadeId, setSelectedOportunidadeId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [search, setSearch] = useState("");

  // KPIs
  const total = oportunidades.length;
  const ganhas = oportunidades.filter(op => op.status === 'ganho').length;
  const perdidas = oportunidades.filter(op => op.status === 'perdido').length;
  const emAberto = oportunidades.filter(
    op => ['em_contato', 'negociando'].includes(op.status)
  ).length;

  // Busca global aplicada sobre filteredOportunidades
  const displayOportunidades = useMemo(() => {
    if (!search.trim()) return filteredOportunidades;
    const s = search.trim().toLowerCase();
    return filteredOportunidades.filter(op =>
      (op.nome_lead || "").toLowerCase().includes(s) ||
      (op.empresa_origem?.nome || "").toLowerCase().includes(s) ||
      (op.empresa_destino?.nome || "").toLowerCase().includes(s) ||
      (op.contato?.nome || "").toLowerCase().includes(s) ||
      (op.status || "").toLowerCase().includes(s)
    );
  }, [filteredOportunidades, search]);

  const getStatusBadge = (status: StatusOportunidade) => {
    switch (status) {
      case "em_contato":
        return <Badge className="bg-blue-500 text-white">Em Contato</Badge>;
      case "negociando":
        return <Badge className="bg-yellow-500 text-white">Negociando</Badge>;
      case "ganho":
        return <Badge className="bg-green-600 text-white">Ganho</Badge>;
      case "perdido":
        return <Badge className="bg-red-500 text-white">Perdido</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getTipoBadge = (op: any) => {
    const tipo = getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo);
    if (tipo === "intragrupo") return <Badge className="bg-green-100 text-green-700">Intra</Badge>;
    if (tipo === "extragrupo") return <Badge className="bg-blue-100 text-blue-700">Extra</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">-</Badge>;
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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteOportunidade(id);
      toast({
        title: "Oportunidade excluída",
        description: "A oportunidade foi removida com sucesso.",
      });
    } catch {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a oportunidade.",
        variant: "destructive",
      });
    }
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

  return (
    <div className="space-y-4">
      {/* KPIs acima da lista */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div className="flex flex-col items-center bg-gray-50 rounded p-2">
          <span className="text-xs text-gray-500">Total</span>
          <span className="font-bold text-xl">{total}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 rounded p-2">
          <span className="text-xs text-gray-500">Em Aberto</span>
          <span className="font-bold text-xl text-blue-600">{emAberto}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 rounded p-2">
          <span className="text-xs text-gray-500">Ganhas</span>
          <span className="font-bold text-xl text-green-600">{ganhas}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 rounded p-2">
          <span className="text-xs text-gray-500">Perdidas</span>
          <span className="font-bold text-xl text-red-600">{perdidas}</span>
        </div>
      </div>

      {/* Filtro rápido */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <Input
          placeholder="Buscar por lead, empresa, status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button
          onClick={() => setIsExportOpen(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {displayOportunidades.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Nenhuma oportunidade encontrada com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOportunidades.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>{formatDate(op.data_indicacao)}</TableCell>
                  <TableCell>{op.empresa_origem?.nome || "-"}</TableCell>
                  <TableCell>{op.empresa_destino?.nome || "-"}</TableCell>
                  <TableCell>{getTipoBadge(op)}</TableCell>
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
                            aria-label="Ver detalhes"
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
                        aria-label="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user?.papel === "admin" && (
                        <ConfirmDialog
                          title="Confirmar exclusão"
                          description="Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita."
                          onConfirm={() => handleDelete(op.id)}
                        >
                          <Button variant="destructive" size="icon" aria-label="Excluir">
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
      )}

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
