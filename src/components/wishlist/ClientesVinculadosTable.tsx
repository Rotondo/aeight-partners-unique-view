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

const CONSOLE_PREFIX = "[ClientesVinculadosTable]";

const ClientesVinculadosTable: React.FC<ClientesVinculadosTableProps> = ({
  clientesVinculados,
  onEditar,
  onSolicitarApresentacao,
}) => {
  React.useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Renderizando com clientesVinculados:`, clientesVinculados);
  }, [clientesVinculados]);

  const safeNome = (obj: any, tipo: "cliente" | "proprietario", id: string) => {
    if (!obj || !obj.nome) {
      const msg = `${CONSOLE_PREFIX} [ERRO] Nome de ${tipo} nulo ou indefinido para relacionamento id=${id}`;
      console.error(msg, obj);
      return (
        <span style={{ color: "red" }}>
          [ERRO: {tipo} não encontrado]
        </span>
      );
    }
    return obj.nome;
  };

  const renderDesde = (data: string | null | undefined) => {
    if (!data) {
      return <span style={{ color: "red" }}>[ERRO: data não encontrada]</span>;
    }
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return <span style={{ color: "red" }}>[ERRO: data inválida]</span>;
    }
  };

  const renderDesdeTooltip = (data: string | null | undefined) => {
    if (!data) return "Data de relacionamento não encontrada";
    try {
      return (
        <>
          Relacionamento ganho em{" "}
          {format(new Date(data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </>
      );
    } catch {
      return "Data de relacionamento inválida";
    }
  };

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
          {clientesVinculados.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum cliente vinculado encontrado.
              </td>
            </tr>
          )}
          {clientesVinculados.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-b hover:bg-muted/50 transition"
            >
              <td className="px-3 py-2 font-medium whitespace-nowrap">
                {safeNome(cliente.empresa_cliente, "cliente", cliente.id)}
              </td>
              <td className="px-3 py-2">
                {safeNome(cliente.empresa_proprietaria, "proprietario", cliente.id)}
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
                        {renderDesde(cliente.data_relacionamento)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {renderDesdeTooltip(cliente.data_relacionamento)}
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
                      aria-label="Ações"
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
