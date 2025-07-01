
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/contexts/WishlistContext";
import { Empresa } from "@/types/empresa"; // Assuming Empresa is correctly typed
import { ScrollArea } from "@/components/ui/scroll-area"; // For scrollable suggestions/tags

// Estrutura para os clientes a serem adicionados
export interface ClienteParaAdicionar {
  id?: string; // ID se for uma empresa existente
  nome: string;
  isNew: boolean; // True se for um nome novo a ser criado como empresa
}

// Opções para o Combobox de parceiro
interface ParceiroOption {
  value: string;
  label: string;
}

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // modalType: "novo" | "editar"; // Simplified to "novo" for this refactor
  // editRelacionamentoId: string | null; // Out of scope for this refactor

  onSubmit: (
    parceiroId: string,
    clientes: ClienteParaAdicionar[],
    observacoes: string
  ) => Promise<void>;

  modalLoading: boolean;
  empresasParceiros: ParceiroOption[]; // Lista de parceiros para o Combobox
}

const ClienteFormModal: React.FC<ClienteFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  modalLoading,
  empresasParceiros,
}) => {
  const { searchEmpresas } = useWishlist();

  const [selectedParceiroId, setSelectedParceiroId] = useState<string | null>(null);
  const [parceiroSearchTerm, setParceiroSearchTerm] = useState(""); // For Combobox filter
  const [isParceiroPopoverOpen, setIsParceiroPopoverOpen] = useState(false);

  const [currentClientInput, setCurrentClientInput] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState<Empresa[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);
  const [clientesParaAdicionar, setClientesParaAdicionar] = useState<ClienteParaAdicionar[]>([]);

  const [observacoes, setObservacoes] = useState("");

  // Debounce search for client suggestions
  useEffect(() => {
    if (currentClientInput.length < 2) {
      setClientSuggestions([]);
      return;
    }
    setIsSearchingClients(true);
    const timer = setTimeout(async () => {
      const suggestions = await searchEmpresas(currentClientInput /*, 'cliente' */); // Optionally filter by type
      setClientSuggestions(suggestions);
      setIsSearchingClients(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentClientInput, searchEmpresas]);

  const handleAddClienteToList = (cliente: ClienteParaAdicionar) => {
    // Evitar duplicados pelo nome se for novo, ou pelo ID se existente
    if (cliente.isNew && clientesParaAdicionar.some(c => c.nome.toLowerCase() === cliente.nome.toLowerCase() && c.isNew)) return;
    if (!cliente.isNew && cliente.id && clientesParaAdicionar.some(c => c.id === cliente.id)) return;

    setClientesParaAdicionar(prev => [...prev, cliente]);
    setCurrentClientInput("");
    setClientSuggestions([]);
  };

  const handleRemoveClienteFromList = (index: number) => {
    setClientesParaAdicionar(prev => prev.filter((_, i) => i !== index));
  };

  const handleClientInputChange = (value: string) => {
    setCurrentClientInput(value);
  };

  const handleClientSuggestionSelect = (suggestion: Empresa) => {
    handleAddClienteToList({ id: suggestion.id, nome: suggestion.nome, isNew: false });
  };

  const handleClientInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentClientInput.trim() && !clientSuggestions.length) {
      e.preventDefault();
      // Add as new if no suggestions match exactly or if user forces it
      // For simplicity, add if no suggestions shown. More complex logic could check exact match.
      handleAddClienteToList({ nome: currentClientInput.trim(), isNew: true });
    }
  };

  const resetForm = () => {
    setSelectedParceiroId(null);
    setParceiroSearchTerm("");
    setCurrentClientInput("");
    setClientSuggestions([]);
    setClientesParaAdicionar([]);
    setObservacoes("");
  };

  const handleInternalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParceiroId || clientesParaAdicionar.length === 0) {
      // TODO: Add toast notification for validation
      console.warn("Parceiro e ao menos um cliente são necessários.");
      return;
    }
    await onSubmit(selectedParceiroId, clientesParaAdicionar, observacoes);
    // onClose(); // Assuming onSubmit in parent will handle closing or error states
    // resetForm(); // Parent should call reset or handle state if modal stays open on error
  };

  // Reset form when modal is closed externally or submitted successfully
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Clientes a um Parceiro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInternalSubmit} className="space-y-4">
          {/* Parceiro Proprietário Selection */}
          <div>
            <label htmlFor="parceiro-combobox" className="block text-sm font-medium text-gray-700 mb-1">
              Parceiro Proprietário*
            </label>
            <Popover open={isParceiroPopoverOpen} onOpenChange={setIsParceiroPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isParceiroPopoverOpen}
                  className="w-full justify-between"
                  id="parceiro-combobox"
                >
                  {selectedParceiroId
                    ? empresasParceiros.find(p => p.value === selectedParceiroId)?.label
                    : "Selecione o parceiro..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar parceiro..."
                    value={parceiroSearchTerm}
                    onValueChange={setParceiroSearchTerm}
                  />
                  <CommandEmpty>Nenhum parceiro encontrado.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {empresasParceiros
                        .filter(p => p.label.toLowerCase().includes(parceiroSearchTerm.toLowerCase()))
                        .map((parceiro) => (
                        <CommandItem
                          key={parceiro.value}
                          value={parceiro.value}
                          onSelect={(currentValue) => {
                            setSelectedParceiroId(currentValue === selectedParceiroId ? null : currentValue);
                            setIsParceiroPopoverOpen(false);
                            setParceiroSearchTerm(""); // Reset search term on select
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedParceiroId === parceiro.value ? "opacity-100" : "opacity-0"}`}
                          />
                          {parceiro.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Clientes Input/Selection */}
          <div>
            <label htmlFor="cliente-input" className="block text-sm font-medium text-gray-700 mb-1">
              Adicionar Clientes* (digite e pressione Enter para novo, ou selecione)
            </label>
            <Command className="relative">
              <CommandInput
                id="cliente-input"
                placeholder="Digite o nome do cliente..."
                value={currentClientInput}
                onValueChange={handleClientInputChange}
                onKeyDown={handleClientInputKeyDown}
                disabled={!selectedParceiroId} // Pode habilitar apenas após selecionar parceiro
              />
              {isSearchingClients && <Loader2 className="absolute right-2 top-2 h-4 w-4 animate-spin" />}
              {clientSuggestions.length > 0 && !isSearchingClients && (
                <CommandList className="absolute top-full mt-1 w-full rounded-md border bg-popover shadow-lg z-10">
                  <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                  <CommandGroup heading="Sugestões de Empresas Existentes">
                    {clientSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        value={suggestion.nome} // Value for keyboard nav
                        onSelect={() => handleClientSuggestionSelect(suggestion)}
                        className="cursor-pointer"
                      >
                        {suggestion.nome} <span className="text-xs text-muted-foreground ml-2">({suggestion.tipo})</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              )}
            </Command>

            {clientesParaAdicionar.length > 0 && (
              <ScrollArea className="h-32 mt-2 border rounded-md p-2">
                <div className="space-y-1">
                  {clientesParaAdicionar.map((cliente, index) => (
                    <Badge key={index} variant="secondary" className="mr-1 mb-1 flex justify-between items-center">
                      <span>{cliente.nome} {cliente.isNew && <span className="text-xs text-blue-500 ml-1">(Novo)</span>}</span>
                      <Button variant="ghost" size="xs" onClick={() => handleRemoveClienteFromList(index)} className="ml-1 h-auto p-0">
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Observações Field */}
          <div>
            <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <Input
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações sobre os relacionamentos"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={
                modalLoading ||
                !selectedParceiroId ||
                clientesParaAdicionar.length === 0
              }
            >
              {modalLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar Clientes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClienteFormModal;
