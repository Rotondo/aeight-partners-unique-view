import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Check, X as Cancel } from "lucide-react";
import { Oportunidade, StatusOportunidade } from "@/types";

interface OportunidadesTableProps {
  listaOrdenada: Oportunidade[];
  editRowId: string | null;
  editValues: Partial<Oportunidade>;
  setEditValues: (val: Partial<Oportunidade>) => void;
  handleEdit: (oportunidade: Oportunidade) => void;
  handleSaveEdit: (id: string) => void;
  handleCancelEdit: () => void;
  ordenarLista: (col: string) => void;
}

export const OportunidadesTable: React.FC<OportunidadesTableProps> = ({
  listaOrdenada,
  editRowId,
  editValues,
  setEditValues,
  handleEdit,
  handleSaveEdit,
  handleCancelEdit,
  ordenarLista,
}) => {
  function formatDate(dateString?: string) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Detalhada de Oportunidades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("empresa_origem.nome")}>Origem</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("empresa_destino.nome")}>Destino</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("status")}>Status</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("valor")}>Valor</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("nome_lead")}>Lead</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("tipo_relacao")}>Tipo</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("data_indicacao")}>Data Indicação</th>
                <th className="border p-1 cursor-pointer" onClick={() => ordenarLista("data_fechamento")}>Data Fechamento</th>
                <th className="border p-1">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaOrdenada.map((op, idx) => (
                <tr key={op.id + idx}>
                  <td className="border p-1">{op.empresa_origem?.nome || "-"}</td>
                  <td className="border p-1">{op.empresa_destino?.nome || "-"}</td>
                  <td className="border p-1">
                    {editRowId === op.id ? (
                      <Select value={editValues.status || ""} onValueChange={v => setEditValues(e => ({ ...e, status: v as StatusOportunidade }))}>
                        <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="em_contato">Em Contato</SelectItem>
                          <SelectItem value="negociando">Negociando</SelectItem>
                          <SelectItem value="ganho">Ganho</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                          <SelectItem value="Contato">Contato</SelectItem>
                          <SelectItem value="Apresentado">Apresentado</SelectItem>
                          <SelectItem value="Sem contato">Sem contato</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : op.status}
                  </td>
                  <td className="border p-1">
                    {editRowId === op.id ? (
                      <Input type="number" className="w-[80px]" value={editValues.valor ?? ""} onChange={e => setEditValues(ev => ({ ...ev, valor: Number(e.target.value) }))} />
                    ) : (op.valor ?? "-")}
                  </td>
                  <td className="border p-1">
                    {editRowId === op.id ? (
                      <Input value={editValues.nome_lead ?? ""} onChange={e => setEditValues(ev => ({ ...ev, nome_lead: e.target.value }))} className="w-[110px]" />
                    ) : (op.nome_lead ?? "-")}
                  </td>
                  <td className="border p-1">{op.tipo_relacao}</td>
                  <td className="border p-1">{formatDate(op.data_indicacao)}</td>
                  <td className="border p-1">{op.data_fechamento ? formatDate(op.data_fechamento) : "-"}</td>
                  <td className="border p-1">
                    {editRowId === op.id ? (
                      <>
                        <Button size="icon" variant="default" title="Salvar" onClick={() => handleSaveEdit(op.id)}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="Cancelar" onClick={handleCancelEdit}><Cancel className="h-4 w-4" /></Button>
                      </>
                    ) : (
                      <Button size="icon" variant="ghost" title="Editar" onClick={() => handleEdit(op)}><Edit className="h-4 w-4" /></Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
