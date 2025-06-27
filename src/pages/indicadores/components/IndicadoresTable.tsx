
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Edit, Check, X as Cancel } from "lucide-react";
import { IndicadoresParceiro, TamanhoEmpresa } from "@/types";
import { IndicadoresParceiroWithEmpresa, TAMANHOS } from "../types";
import { maskName, formatDate, safeRenderCell } from "../utils";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface IndicadoresTableProps {
  filteredIndicadores: IndicadoresParceiroWithEmpresa[];
  sortColumn: string;
  sortAsc: boolean;
  onSort: (column: string) => void;
  editRowId: string | null;
  editValues: Partial<IndicadoresParceiro>;
  onEdit: (indicador: IndicadoresParceiroWithEmpresa) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditValueChange: (field: string, value: any) => void;
}

export const IndicadoresTable: React.FC<IndicadoresTableProps> = ({
  filteredIndicadores,
  sortColumn,
  sortAsc,
  onSort,
  editRowId,
  editValues,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
}) => {
  const { isDemoMode } = usePrivacy();

  const editableFields: (keyof IndicadoresParceiro)[] = [
    "potencial_leads",
    "base_clientes",
    "engajamento",
    "alinhamento",
    "potencial_investimento",
    "tamanho",
  ];

  const renderSortIcon = (col: string) =>
    sortColumn === col ? (
      sortAsc ? (
        <span className="ml-1">&#9650;</span>
      ) : (
        <span className="ml-1">&#9660;</span>
      )
    ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhamento de Indicadores</CardTitle>
        <CardDescription>
          Lista detalhada de todos os indicadores registrados (mais recentes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("empresa")}>
                Empresa {renderSortIcon("empresa")}
              </TableHead>
              {editableFields.map((field) => (
                <TableHead
                  className="cursor-pointer"
                  key={field}
                  onClick={() => onSort(field)}
                >
                  {field === "potencial_leads" && <>Potencial Leads {renderSortIcon(field)}</>}
                  {field === "base_clientes" && <>Base Clientes {renderSortIcon(field)}</>}
                  {field === "engajamento" && <>Engajamento {renderSortIcon(field)}</>}
                  {field === "alinhamento" && <>Alinhamento {renderSortIcon(field)}</>}
                  {field === "potencial_investimento" && <>Pot. Investimento {renderSortIcon(field)}</>}
                  {field === "tamanho" && <>Tamanho {renderSortIcon(field)}</>}
                </TableHead>
              ))}
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("oportunidadesIndicadas")}>
                Oportunidades Indicadas {renderSortIcon("oportunidadesIndicadas")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSort("share_of_wallet")}>
                Share of Wallet (%) {renderSortIcon("share_of_wallet")}
              </TableHead>  
              <TableHead>Data Avaliação</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIndicadores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  Nenhum indicador encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredIndicadores.map((indicador) => (
                <TableRow key={indicador.id}>
                  <TableCell>{maskName(indicador.empresa?.nome, isDemoMode)}</TableCell>
                  {editableFields.map((field) => (
                    <TableCell key={field}>
                      {editRowId === indicador.id ? (
                        field === "tamanho" ? (
                          <Select
                            value={(editValues.tamanho as string) || ""}
                            onValueChange={(value) => onEditValueChange("tamanho", value as TamanhoEmpresa)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {TAMANHOS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={["potencial_leads", "base_clientes", "engajamento", "alinhamento", "potencial_investimento"].includes(field)
                              ? "number"
                              : "text"}
                            min={["potencial_leads", "engajamento", "alinhamento", "potencial_investimento"].includes(field) ? 0 : undefined}
                            max={["potencial_leads", "engajamento", "alinhamento", "potencial_investimento"].includes(field) ? 5 : undefined}
                            value={editValues[field] ?? ""}
                            className="w-[85px]"
                            onChange={(e) =>
                              onEditValueChange(field, e.target.value === "" ? "" : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))
                            }
                          />
                        )
                      ) : (
                        safeRenderCell(indicador[field])
                      )}
                    </TableCell>
                  ))}
                  <TableCell>{safeRenderCell(indicador.oportunidadesIndicadas ?? 0)}</TableCell>
                  <TableCell>
                    {indicador.share_of_wallet !== undefined
                      ? indicador.share_of_wallet.toFixed(2) + "%"
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(indicador.data_avaliacao)}</TableCell>
                  <TableCell>
                    {editRowId === indicador.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="outline"
                          title="Salvar"
                          onClick={() => onSaveEdit(indicador.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Cancelar"
                          onClick={onCancelEdit}
                        >
                          <Cancel className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Editar"
                        onClick={() => onEdit(indicador)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
