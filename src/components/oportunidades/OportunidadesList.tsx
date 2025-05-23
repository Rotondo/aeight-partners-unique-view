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
import { Edit, Trash2, Download, Search, ArrowUp, ArrowDown } from "lucide-react";
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

  // Filtros por coluna
  const [searchGlobal, setSearchGlobal] = useState("");
  const [filters, setFilters] = useState({
    data: "",
    origem: "",
    destino: "",
    tipo: "",
    nome_lead: "",
    status: "",
  });

  // Ordenação
  const [sortBy, setSortBy] = useState<string>("data_indicacao");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // KPIs
  const total = oportunidades.length;
  const ganhas = oportunidades.filter(op => op.status === 'ganho').length;
  const perdidas = oportunidades.filter(op => op.status === 'perdido').length;
  const emAberto = oportunidades.filter(
    op => ['em_contato', 'negociando'].includes(op.status)
  ).length;

  // Aplica filtros por coluna e busca global
  const displayOportunidades = useMemo(() => {
    let ops = filteredOportunidades;

    // Filtro global
    if (searchGlobal.trim()) {
      const s = searchGlobal.trim().toLowerCase();
      ops = ops.filter(op =>
        (op.nome_lead || "").toLowerCase().includes(s) ||
        (op.empresa_origem?.nome || "").toLowerCase().includes(s) ||
        (op.empresa_destino?.nome || "").toLowerCase().includes(s) ||
        (op.status || "").toLowerCase().includes(s)
      );
    }

    // Filtros por coluna
    if (filters.data) {
      ops = ops.filter(op => {
        const d = formatDate(op.data_indicacao);
        return d.includes(filters.data);
      });
    }
    if (filters.origem) {
      ops = ops.filter(op => (op.empresa_origem?.nome || "-").toLowerCase().includes(filters.origem.toLowerCase()));
    }
    if (filters.destino) {
      ops = ops.filter(op => (op.empresa_destino?.nome || "-").toLowerCase().includes(filters.destino.toLowerCase()));
    }
    if (filters.tipo) {
      const tipoFiltro = filters.tipo.toLowerCase();
      ops = ops.filter(op => {
        const tipo = getGrupoStatus(op.empresa_origem?.tipo, op.empresa_destino?.tipo);
        if (tipo === "intragrupo") return "intra".includes(tipoFiltro);
        if (tipo === "extragrupo") return "extra".includes(tipoFiltro);
        return false;
      });
    }
    if (filters.nome_lead) {
      ops = ops.filter(op => (op.nome_lead || "-").toLowerCase().includes(filters.nome_lead.toLowerCase()));
    }
    if (filters.status) {
      ops = ops.filter(op => (op.status || "-").toLowerCase().includes(filters.status.toLowerCase()));
    }

    // Ordenação
    ops = ops.slice().sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case "data_indicacao":
          aVal = a.data_indicacao ?? "";
          bVal = b.data_indicacao ?? "";
          break;
        case "empresa_origem":
          aVal = a.empresa_origem?.nome ?? "";
          bVal = b.empresa_origem?.nome ?? "";
          break;
        case "empresa_destino":
          aVal = a.empresa_destino?.nome ?? "";
          bVal = b.empresa_destino?.nome ?? "";
          break;
        case "tipo":
          aVal = getGrupoStatus(a.empresa_origem?.tipo, a.empresa_destino?.tipo) ?? "";
          bVal = getGrupoStatus(b.empresa_origem?.tipo, b.empresa_destino?.tipo) ?? "";
          break;
        case "nome_lead":
          aVal = a.nome_lead ?? "";
          bVal = b.nome_lead ?? "";
          break;
        case "status":
          aVal = a.status ?? "";
          bVal = b.status ?? "";
          break;
        default:
          aVal = "";
          bVal = "";
      }
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return ops;
  }, [filteredOportunidades, searchGlobal, filters, sortBy, sortOrder]);

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

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

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

      {/* Filtro global */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <Input
          placeholder="Buscar por lead, empresa, status..."
          value={searchGlobal}
          onChange={e => setSearchGlobal(e.target.value)}
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

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : displayOportunidades.length === 0 ? (
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
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("data_indicacao")}
                >
                  Data{" "}
                  {sortBy === "data_indicacao" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.data}
                      onChange={e =>
                        setFilters(f => ({ ...f, data: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("empresa_origem")}
                >
                  Origem{" "}
                  {sortBy === "empresa_origem" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.origem}
                      onChange={e =>
                        setFilters(f => ({ ...f, origem: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("empresa_destino")}
                >
                  Destino{" "}
                  {sortBy === "empresa_destino" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.destino}
                      onChange={e =>
                        setFilters(f => ({ ...f, destino: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("tipo")}
                >
                  Tipo{" "}
                  {sortBy === "tipo" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.tipo}
                      onChange={e =>
                        setFilters(f => ({ ...f, tipo: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("nome_lead")}
                >
                  Nome da Oportunidade{" "}
                  {sortBy === "nome_lead" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.nome_lead}
                      onChange={e =>
                        setFilters(f => ({ ...f, nome_lead: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  {sortBy === "status" &&
                    (sortOrder === "asc" ? (
                      <ArrowUp className="inline w-3 h-3" />
                    ) : (
                      <ArrowDown className="inline w-3 h-3" />
                    ))}
                  <div>
                    <Input
                      placeholder="Filtrar"
                      value={filters.status}
                      onChange={e =>
                        setFilters(f => ({ ...f, status: e.target.value }))
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </TableHead>
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
                  <TableCell>{op.nome_lead || "-"}</TableCell>
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
