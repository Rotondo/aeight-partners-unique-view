
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { MoreVertical, Edit2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EmpresaCliente } from "@/types";

interface ClientesVinculadosTableProps {
  clientesVinculados: EmpresaCliente[];
  onEditar: (relacionamento: EmpresaCliente) => void;
  onSolicitarApresentacao: (relacionamento: EmpresaCliente) => void;
}

const ClientesVinculadosTable: React.FC<ClientesVinculadosTableProps> = ({
  clientesVinculados,
  onEditar,
  onSolicitarApresentacao,
}) => {
  return (
    <div className="overflow-x-auto rounded-md border bg-background shadow-sm mt-2">
      <table className="min-w-full text-sm align-middle">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">Cliente</th>
            <th className="px-3 py-2 text-left font-medium">Proprietário</th>
            <th className="px-3 py-2 text-left font-medium">Status</th>
            <th className="px-3 py-2 text-left font-medium">Desde</th>
            <th className="px-3 py-2 text-left font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientesVinculados.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-b hover:bg-muted/50 transition"
            >
              <td className="px-3 py-2 font-medium whitespace-nowrap">
                {cliente.empresa_cliente?.nome}
              </td>
              <td className="px-3 py-2">
                {cliente.empresa_proprietaria?.nome}
              </td>
              <td className="px-3 py-2">
                <Badge
                  variant={cliente.status ? "default" : "secondary"}
                >
                  {cliente.status ? "Ativo" : "Inativo"}
                </Badge>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {format(
                          new Date(cliente.data_relacionamento),
                          "dd/MM/yyyy",
                          { locale: ptBR }
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Relacionamento desde{" "}
                      {format(
                        new Date(cliente.data_relacionamento),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              <td className="px-3 py-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-1 h-8 w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-36 p-1 flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => onEditar(cliente)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start w-full"
                      onClick={() => onSolicitarApresentacao(cliente)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" /> Solicitar Apresentação
                    </Button>
                  </PopoverContent>
                </Popover>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientesVinculadosTable;
