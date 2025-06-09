import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Empresa } from "@/types";

interface MatrizIntraProps {
  matrizIntra: any[];
  empresasIntra: Empresa[];
}

function renderCellValue(value: any) {
  if (value === 0) {
    return <span style={{ opacity: 0.3, color: "#888" }}>0</span>;
  }
  return value;
}

export const MatrizIntra: React.FC<MatrizIntraProps> = ({ matrizIntra, empresasIntra }) => (
  <Card>
    <CardHeader>
      <CardTitle>Matriz de Indicações Intragrupo</CardTitle>
      <CardDescription>Visualização de quem indica para quem dentro do grupo</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border">
          <thead>
            <tr>
              <th className="border p-1">Origem \ Destino</th>
              {empresasIntra.map(dest => (
                <th className="border p-1" key={dest.id}>{dest.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrizIntra.map((row, idx) => (
              <tr key={row.origem + idx}>
                <td className="border p-1 font-bold">{row.origem}</td>
                {empresasIntra.map(dest => (
                  <td className="border p-1 text-center" key={dest.id}>{renderCellValue(row[dest.nome])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);
