import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Users } from "lucide-react";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ClienteOption } from "@/types/cliente-fishbone";
import { validateClienteOptionArray, logValidationResults } from '@/types/cliente-fishbone-validation';

interface ClienteSelectorProps {
  clientes: ClienteOption[];
  selectedClienteIds: string[];
  onSelectionChange: (clienteIds: string[]) => void;
}

const ClienteSelector: React.FC<ClienteSelectorProps> = ({
  clientes,
  selectedClienteIds,
  onSelectionChange
}) => {
  // Validate input data
  React.useEffect(() => {
    const validation = validateClienteOptionArray(clientes);
    logValidationResults('ClienteSelector', validation);
    
    if (!validation.isValid) {
      console.error('[ClienteSelector] Invalid clientes data received');
    }
  }, [clientes]);

  // Input validation
  if (!Array.isArray(clientes)) {
    console.error('[ClienteSelector] clientes prop must be an array');
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-destructive">
            <p>Erro: Dados de clientes inválidos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(selectedClienteIds)) {
    console.error('[ClienteSelector] selectedClienteIds prop must be an array');
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-destructive">
            <p>Erro: IDs de clientes selecionados inválidos</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Gera options do MultiSelect com label enriquecido (nome + proprietária)
  const clientesOptions = clientes.map(cliente => ({
    value: cliente.id,
    label: cliente.empresa_proprietaria
      ? `${cliente.nome} (${cliente.empresa_proprietaria.nome} - ${cliente.empresa_proprietaria.tipo})`
      : cliente.nome,
  }));

  // Para mostrar badges dos selecionados com vínculo
  const selectedClientes = clientes.filter(c => selectedClienteIds.includes(c.id));

  const handleRemoveCliente = (clienteId: string) => {
    if (!clienteId || typeof clienteId !== 'string') {
      console.warn('[ClienteSelector] Invalid clienteId for removal:', clienteId);
      return;
    }
    
    if (typeof onSelectionChange !== 'function') {
      console.error('[ClienteSelector] onSelectionChange must be a function');
      return;
    }
    
    onSelectionChange(selectedClienteIds.filter(id => id !== clienteId));
  };

  const handleSelectionChange = (newIds: string[]) => {
    if (!Array.isArray(newIds)) {
      console.warn('[ClienteSelector] New selection must be an array:', newIds);
      return;
    }
    
    if (!newIds.every(id => typeof id === 'string' && id.length > 0)) {
      console.warn('[ClienteSelector] All selected IDs must be non-empty strings:', newIds);
      return;
    }
    
    if (typeof onSelectionChange !== 'function') {
      console.error('[ClienteSelector] onSelectionChange must be a function');
      return;
    }
    
    onSelectionChange(newIds);
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
            onChange={handleSelectionChange}
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
                      {cliente.empresa_proprietaria && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          ({cliente.empresa_proprietaria.nome} - {cliente.empresa_proprietaria.tipo})
                        </span>
                      )}
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