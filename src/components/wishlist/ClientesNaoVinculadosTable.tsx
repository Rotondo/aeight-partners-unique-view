import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface ClientesNaoVinculadosTableProps {
  clientesNaoVinculados: EmpresaOption[];
  onVincular: (cliente: EmpresaOption) => void;
}

const CONSOLE_PREFIX = "[ClientesNaoVinculadosTable]";

const ClientesNaoVinculadosTable: React.FC<ClientesNaoVinculadosTableProps> = ({
  clientesNaoVinculados,
  onVincular,
}) => {
  React.useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Renderizando com clientesNaoVinculados:`, clientesNaoVinculados);
  }, [clientesNaoVinculados]);

  return (
    <>
      {clientesNaoVinculados.length === 0 && (
        <tr>
          <td colSpan={5} className="text-center py-8 text-muted-foreground">
            Nenhum cliente não vinculado encontrado.
          </td>
        </tr>
      )}
      {clientesNaoVinculados.map((cliente) => (
        <tr
          key={cliente.id}
          className="border-b hover:bg-muted/40"
        >
          <td className="px-3 py-2 font-medium">
            {cliente.nome || (
              <span style={{ color: "red" }}>
                [ERRO: nome não encontrado]
              </span>
            )}
          </td>
          <td className="px-3 py-2">
            <span className="italic text-muted-foreground">
              Sem proprietário
            </span>
          </td>
          <td className="px-3 py-2">
            <Badge variant="secondary">Não vinculado</Badge>
          </td>
          <td className="px-3 py-2">-</td>
          <td className="px-3 py-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onVincular(cliente)}
                  >
                    Vincular
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Vincular este cliente a um ou mais parceiros
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ClientesNaoVinculadosTable;
