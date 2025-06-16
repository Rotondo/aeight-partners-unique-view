import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Edit,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  X as Cancel,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { Oportunidade, StatusOportunidade } from "@/types";
import { useOportunidades } from "./OportunidadesContext";
import { ActivityIndicator } from "./ActivityIndicator";
import { PrivateData } from "@/components/privacy/PrivateData";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Tipos de ordenação suportados
type ColKey =
  | "nome_lead"
  | "empresa_origem"
  | "empresa_destino"
  | "tipo_relacao"
  | "status"
  | "valor"
  | "data_indicacao"
  | "usuario_responsavel";

// Mapeamento para renderização das colunas
const columns: { key: ColKey; label: string }[] = [
  { key: "nome_lead", label: "Nome da Oportunidade" },
  { key: "empresa_origem", label: "Origem" },
  { key: "empresa_destino", label: "Destino" },
  { key: "tipo_relacao", label: "Tipo" },
  { key: "status", label: "Status" },
  { key: "valor", label: "Valor (R$)" },
  { key: "data_indicacao", label: "Data" },
  { key: "usuario_responsavel", label: "Executivo Responsável" },
];

interface OportunidadesListProps {
  onEdit: (oportunidade: Oportunidade) => void;
  onView: (oportunidade: Oportunidade) => void;
}

interface SortState {
  col: ColKey;
  asc: boolean;
}

function formatCurrencyBRL(value: number | null | undefined) {
  if (typeof value !== "number" || isNaN(value)) return "";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const OportunidadesList: React.FC<OportunidadesListProps> = ({
  onEdit,
  onView,
}) => {
  const { filteredOportunidades, isLoading, deleteOportunidade, updateOportunidade } = useOportunidades();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    oportunidade: Oportunidade | null;
  }>({ open: false, oportunidade: null });

  const [sort, setSort] = useState<SortState>({ col: "data_indicacao", asc: false });

  // Edição inline de valor
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Função para alteração de ordenação ao clicar no cabeçalho
  const handleSort = (col: ColKey) => {
    setSort((old) =>
      old.col === col ? { col, asc: !old.asc } : { col, asc: true }
    );
  };

  // Função para pegar valor da coluna para ordenação
  const getSortValue = (op: Oportunidade, col: ColKey): string | number => {
    switch (col) {
      case "nome_lead":
        return op.nome_lead || "";
      case "empresa_origem":
        return op.empresa_origem?.nome || "";
      case "empresa_destino":
        return op.empresa_destino?.nome || "";
      case "tipo_relacao":
        return (op as any).tipo_relacao === "intra" ? "Intra" : "Extra";
      case "status":
        return getStatusLabel(op.status);
      case "valor":
        return typeof op.valor === "number" && !isNaN(op.valor) ? op.valor : -1;
      case "data_indicacao":
        return op.data_indicacao || "";
      case "usuario_responsavel":
        return op.usuario_recebe?.nome || "";
      default:
        return "";
    }
  };

  // Ordena a lista conforme coluna selecionada
  const sortedOportunidades = [...filteredOportunidades].sort((a, b) => {
    const va = getSortValue(a, sort.col);
    const vb = getSortValue(b, sort.col);
    if (typeof va === "string" && typeof vb === "string") {
      return sort.asc
        ? va.localeCompare(vb, "pt-BR")
        : vb.localeCompare(va, "pt-BR");
    }
    if (typeof va === "number" && typeof vb === "number") {
      return sort.asc ? va - vb : vb - va;
    }
    return 0;
  });

  const getStatusColor = (status: StatusOportunidade) => {
    const colors = {
      "em_contato": "bg-blue-100 text-blue-800",
      "negociando": "bg-yellow-100 text-yellow-800",
      "ganho": "bg-green-100 text-green-800",
      "perdido": "bg-red-100 text-red-800",
      "Contato": "bg-blue-100 text-blue-800",
      "Apresentado": "bg-purple-100 text-purple-800",
      "Sem contato": "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: StatusOportunidade) => {
    const labels = {
      "em_contato": "Em Contato",
      "negociando": "Negociando",
      "ganho": "Ganho",
      "perdido": "Perdido",
      "Contato": "Contato",
      "Apresentado": "Apresentado",
      "Sem contato": "Sem Contato",
    };
    return labels[status] || status;
  };

  const handleDeleteClick = (oportunidade: Oportunidade) => {
    setDeleteConfirm({ open: true, oportunidade });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.oportunidade) {
      await deleteOportunidade(deleteConfirm.oportunidade.id);
      setDeleteConfirm({ open: false, oportunidade: null });
    }
  };

  // Edição inline do valor
  const handleEditValueClick = (op: Oportunidade) => {
    setEditRowId(op.id);
    setEditValue(
      typeof op.valor === "number" && !isNaN(op.valor) ? String(op.valor) : ""
    );
    setEditError(null);
  };

  const handleEditValueCancel = () => {
    setEditRowId(null);
    setEditError(null);
  };

  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(",", ".");
    // only allow numbers/decimals
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
      setEditValue(value);
      setEditError(null);
    }
  };

  const handleEditValueSave = async (op: Oportunidade) => {
    setSavingRowId(op.id);
    setEditError(null);
    let valorFinal: number | null = null;
    if (editValue === "") {
      valorFinal = null;
    } else {
      const num = Number(editValue);
      if (isNaN(num) || num < 0) {
        setEditError("Valor inválido");
        setSavingRowId(null);
        return;
      }
      valorFinal = num;
    }
    const ok = await updateOportunidade(op.id, { valor: valorFinal });
    if (!ok) {
      setEditError("Erro ao salvar. Tente novamente.");
    } else {
      setEditRowId(null);
    }
    setSavingRowId(null);
  };

  // Soma e contagem
  const totalCount = sortedOportunidades.length;
  const valorSum = sortedOportunidades.reduce(
    (acc, op) =>
      typeof op.valor === "number" && !isNaN(op.valor) ? acc + op.valor : acc,
    0
  );
  const semValorCount = sortedOportunidades.filter(
    (op) => !(typeof op.valor === "number" && !isNaN(op.valor) && op.valor > 0)
  ).length;

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="min-w-full animate-pulse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="p-3 bg-gray-100" />
              ))}
              <th className="p-3 bg-gray-100" />
            </tr>
          </thead>
          <tbody>
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="border-b">
                {columns.map((col, idx) => (
                  <td key={idx} className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </td>
                ))}
                <td className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (filteredOportunidades.length === 0) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col items-center justify-center py-8">
          <svg width="48" height="48" fill="none" className="mb-4 text-gray-400">
            <rect width="48" height="48" rx="8" fill="#e5e7eb" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma oportunidade encontrada
          </h3>
          <p className="text-gray-500 text-center">
            Não há oportunidades que correspondam aos filtros selecionados.
          </p>
        </div>
      </div>
    );
  }

  // Render soma e contagem (topo ou rodapé)
  const renderTotais = () => (
    <div className="flex flex-wrap items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 mb-2 rounded-t-md text-sm">
      <div>
        <span className="font-semibold">{totalCount} oportunidade{totalCount === 1 ? "" : "s"}</span>
        {semValorCount > 0 ? (
          <span className="ml-2 text-amber-700 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {semValorCount} sem valor
          </span>
        ) : null}
      </div>
      <div>
        Soma dos valores: <span className="font-semibold">{formatCurrencyBRL(valorSum)}</span>
      </div>
    </div>
  );

  return (
    <>
      {renderTotais()}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md bg-white text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-left font-semibold bg-gray-50 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sort.col === col.key && (
                      sort.asc ? (
                        <ArrowUp className="h-4 w-4 inline" />
                      ) : (
                        <ArrowDown className="h-4 w-4 inline" />
                      )
                    )}
                  </div>
                </th>
              ))}
              <th className="p-3 bg-gray-50" />
            </tr>
          </thead>
          <tbody>
            {sortedOportunidades.map((op) => (
              <tr key={op.id} className="hover:bg-gray-50 border-b border-gray-100">
                {/* Nome da oportunidade */}
                <td className="p-3 font-medium max-w-xs whitespace-nowrap">
                  <PrivateData type="blur">{op.nome_lead}</PrivateData>
                </td>
                {/* Origem */}
                <td className="p-3 max-w-xs whitespace-nowrap">
                  <PrivateData type="blur">{op.empresa_origem?.nome || "N/A"}</PrivateData>
                </td>
                {/* Destino */}
                <td className="p-3 max-w-xs whitespace-nowrap">
                  <PrivateData type="blur">{op.empresa_destino?.nome || "N/A"}</PrivateData>
                </td>
                {/* Tipo: Intra / Extra */}
                <td className="p-3 whitespace-nowrap">
                  {(op as any).tipo_relacao === "intra" ? (
                    <Badge className="bg-blue-200 text-blue-900">Intra</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800">Extra</Badge>
                  )}
                </td>
                {/* Status */}
                <td className="p-3 whitespace-nowrap">
                  <Badge className={getStatusColor(op.status)}>
                    {getStatusLabel(op.status)}
                  </Badge>
                  <ActivityIndicator oportunidadeId={op.id} />
                </td>
                {/* Valor - edição inline */}
                <td className="p-3 whitespace-nowrap">
                  {editRowId === op.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={handleEditValueChange}
                        type="number"
                        min={0}
                        step={0.01}
                        className={cn(
                          "w-24",
                          editError && "border-red-500"
                        )}
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === "Enter") handleEditValueSave(op);
                          if (e.key === "Escape") handleEditValueCancel();
                        }}
                        disabled={savingRowId === op.id}
                      />
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleEditValueSave(op)}
                        disabled={savingRowId === op.id}
                        title="Salvar valor"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleEditValueCancel}
                        disabled={savingRowId === op.id}
                        title="Cancelar"
                      >
                        <Cancel className="h-4 w-4" />
                      </Button>
                      {editError && (
                        <span className="text-xs text-red-500">{editError}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          typeof op.valor === "number" && !isNaN(op.valor) && op.valor > 0
                            ? ""
                            : "text-amber-700 font-semibold"
                        )}
                      >
                        {typeof op.valor === "number" && !isNaN(op.valor) && op.valor > 0
                          ? formatCurrencyBRL(op.valor)
                          : (
                            <span className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" /> Preencher
                            </span>
                          )
                        }
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Editar valor"
                        onClick={() => handleEditValueClick(op)}
                        className="p-1"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </td>
                {/* Data */}
                <td className="p-3 whitespace-nowrap">
                  {op.data_indicacao
                    ? format(new Date(op.data_indicacao), "dd/MM/yyyy", { locale: ptBR })
                    : "-"}
                </td>
                {/* Executivo responsável (usuário_recebe) */}
                <td className="p-3 max-w-xs whitespace-nowrap">
                  <PrivateData type="blur">{op.usuario_recebe?.nome || "-"}</PrivateData>
                </td>
                {/* Ações */}
                <td className="p-3 whitespace-nowrap flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(op)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(op)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(op)}
                    className="text-destructive hover:text-destructive flex items-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Rodapé - totais */}
      {renderTotais()}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, oportunidade: null })}
        title="Excluir Oportunidade"
        description={`Tem certeza que deseja excluir a oportunidade "${deleteConfirm.oportunidade?.nome_lead}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};