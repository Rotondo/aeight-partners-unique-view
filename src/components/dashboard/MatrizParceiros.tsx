import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Empresa } from "@/types";

interface MatrizParceirosProps {
  matrizParceiros: any[];
  empresasIntra: Empresa[];
}

function renderCellValue(value: any) {
  if (value === 0) {
    return <span style={{ opacity: 0.3, color: "#888" }}>0</span>;
  }
  return value;
}

export const MatrizParceiros: React.FC<MatrizParceirosProps> = ({ matrizParceiros, empresasIntra }) => (
  <Card>
    <CardHeader>
      <CardTitle>Matriz de Indicações com Parceiros</CardTitle>
      <CardDescription>Visualização das indicações envolvendo parceiros externos</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">Parceiro \ Intra</th>
              {empresasIntra.map(intra => (
                <th className="border p-1" key={intra.id}>{intra.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrizParceiros.map((row, idx) => (
              <tr key={row.parceiro + idx}>
                <td className="border p-1 font-bold">{row.parceiro}</td>
                {empresasIntra.map(intra => (
                  <td className="border p-1 text-center" key={intra.id}>{renderCellValue(row[intra.nome])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
