import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Users } from "lucide-react";
import { Empresa } from '@/types/empresa';
import { MultiSelect } from "@/components/ui/MultiSelect";

interface ClienteSelectorProps {
  clientes: Empresa[];
  selectedClienteIds: string[];
  onSelectionChange: (clienteIds: string[]) => void;
}

const ClienteSelector: React.FC<ClienteSelectorProps> = ({
  clientes,
  selectedClienteIds,
  onSelectionChange
}) => {
  const clientesOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: cliente.nome
  }));

  const selectedClientes = clientes.filter(c => 
    selectedClienteIds.includes(c.id)
  );

  const handleRemoveCliente = (clienteId: string) => {
    onSelectionChange(selectedClienteIds.filter(id => id !== clienteId));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">
              Selecionar Clientes
            </Label>
          </div>

          <MultiSelect
            options={clientesOptions}
            values={selectedClienteIds}
            onChange={onSelectionChange}
            placeholder="Escolha os clientes..."
          />

          {selectedClientes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Clientes Selecionados ({selectedClientes.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedClientes.map(cliente => (
                  <Badge 
                    key={cliente.id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span className="truncate max-w-32">
                      {cliente.nome}
                    </span>
                    <button
                      onClick={() => handleRemoveCliente(cliente.id)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClienteSelector;