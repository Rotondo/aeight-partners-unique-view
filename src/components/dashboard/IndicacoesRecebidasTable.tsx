import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Oportunidade, Empresa } from "@/types";

interface IndicacoesRecebidasTableProps {
  empresaIntraSelecionada: string;
  empresasIntra: Empresa[];
  indicacoesRecebidasTodas: Oportunidade[];
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR");
}

export const IndicacoesRecebidasTable: React.FC<IndicacoesRecebidasTableProps> = ({
  empresaIntraSelecionada,
  empresasIntra,
  indicacoesRecebidasTodas
}) => {
  if (!empresaIntraSelecionada || empresaIntraSelecionada === "all") return null;
  const empresaNome = empresasIntra.find(e => e.id === empresaIntraSelecionada)?.nome || "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Indicações Recebidas por {empresaNome}
        </CardTitle>
        <CardDescription>
          Todas as indicações recebidas, com origem e tipo (intra/extra)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs border">
            <thead>
              <tr>
                <th className="border p-1">Data</th>
                <th className="border p-1">Lead</th>
                <th className="border p-1">Origem</th>
                <th className="border p-1">Tipo</th>
                <th className="border p-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {indicacoesRecebidasTodas.length === 0 && (
                <tr>
                  <td colSpan={5} className="border p-1 text-center text-muted">Nenhuma indicação recebida.</td>
                </tr>
              )}
              {indicacoesRecebidasTodas.map((op, idx) => (
                <tr key={op.id + idx}>
                  <td className="border p-1">{formatDate(op.data_indicacao)}</td>
                  <td className="border p-1">{op.nome_lead}</td>
                  <td className="border p-1">{op.empresa_origem?.nome || "-"}</td>
                  <td className="border p-1">{op.tipo_relacao === "intra" ? "Intra" : "Extra"}</td>
                  <td className="border p-1">{op.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
