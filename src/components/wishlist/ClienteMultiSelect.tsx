import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, X } from "lucide-react";
import { ClienteOption } from "@/hooks/useClientesPorEmpresa";

export interface ClienteSelecionado extends ClienteOption {
  prioridade: number;
}

interface ClienteMultiSelectProps {
  clientes: ClienteOption[];
  clientesSelecionados: ClienteSelecionado[];
  onClientesSelecionadosChange: (clientes: ClienteSelecionado[]) => void;
  loading?: boolean;
}

const ClienteMultiSelect: React.FC<ClienteMultiSelectProps> = ({
  clientes,
  clientesSelecionados,
  onClientesSelecionadosChange,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar clientes por termo de busca
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Verificar se cliente está selecionado
  const isClienteSelecionado = (clienteId: string) => {
    return clientesSelecionados.some((c) => c.id === clienteId);
  };

  // Adicionar/remover cliente da seleção
  const toggleClienteSelecao = (cliente: ClienteOption, checked: boolean) => {
    if (checked) {
      // Adicionar com prioridade padrão
      const novoCliente: ClienteSelecionado = {
        ...cliente,
        prioridade: 3,
      };
      onClientesSelecionadosChange([...clientesSelecionados, novoCliente]);
    } else {
      // Remover da seleção
      onClientesSelecionadosChange(
        clientesSelecionados.filter((c) => c.id !== cliente.id)
      );
    }
  };

  // Atualizar prioridade de um cliente selecionado
  const atualizarPrioridade = (clienteId: string, prioridade: number) => {
    onClientesSelecionadosChange(
      clientesSelecionados.map((c) =>
        c.id === clienteId ? { ...c, prioridade } : c
      )
    );
  };

  // Remover cliente selecionado
  const removerCliente = (clienteId: string) => {
    onClientesSelecionadosChange(
      clientesSelecionados.filter((c) => c.id !== clienteId)
    );
  };

  // Renderizar estrelas de prioridade
  const renderPriorityStars = (prioridade: number, clienteId: string) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => atualizarPrioridade(clienteId, star)}
            className="focus:outline-none hover:scale-110 transition-transform"
          >
            <Star
              className={`h-4 w-4 ${
                prioridade >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div>
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm"
        />
      </div>

      {/* Clientes selecionados */}
      {clientesSelecionados.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">
            Clientes Selecionados ({clientesSelecionados.length})
          </h4>
          <div className="space-y-2">
            {clientesSelecionados.map((cliente) => (
              <Card key={cliente.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{cliente.nome}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Prioridade:
                        </span>
                        {renderPriorityStars(cliente.prioridade, cliente.id)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removerCliente(cliente.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lista de clientes disponíveis */}
      <div>
        <h4 className="text-sm font-medium mb-2">
          Clientes Disponíveis ({clientesFiltrados.length})
        </h4>
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>Nenhum cliente encontrado</p>
            <p className="text-xs mt-1">
              {searchTerm
                ? "Tente ajustar a busca"
                : "Esta empresa não possui clientes cadastrados"}
            </p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-1">
            {clientesFiltrados.map((cliente) => {
              const selecionado = isClienteSelecionado(cliente.id);
              return (
                <div
                  key={cliente.id}
                  className={`flex items-center space-x-3 p-2 rounded border ${
                    selecionado ? "bg-muted border-primary" : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    id={`cliente-${cliente.id}`}
                    checked={selecionado}
                    onCheckedChange={(checked) =>
                      toggleClienteSelecao(cliente, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`cliente-${cliente.id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    {cliente.nome}
                  </label>
                  {selecionado && (
                    <Badge variant="secondary" className="text-xs">
                      Selecionado
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClienteMultiSelect;