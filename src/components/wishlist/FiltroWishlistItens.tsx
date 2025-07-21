import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { WishlistStatus, WishlistItem } from "@/types";

interface FiltroWishlistItensProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: WishlistStatus | "all";
  onStatusChange: (value: WishlistStatus | "all") => void;
  origemFilter: string;
  onOrigemChange: (value: string) => void;
  destinoFilter: string;
  onDestinoChange: (value: string) => void;
  items: WishlistItem[];
}

const FiltroWishlistItens: React.FC<FiltroWishlistItensProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  origemFilter,
  onOrigemChange,
  destinoFilter,
  onDestinoChange,
  items,
}) => {
  // Extrai empresas proprietárias únicas para filtro de origem
  const origensUnicas = Array.from(
    new Set(items.map(item => item.empresa_proprietaria?.nome).filter(Boolean))
  ).sort();

  // Extrai empresas de destino únicas para filtro de destino (segue o padrão aplicado em origem)
  const destinosUnicos = Array.from(
    new Set(items.map(item => item.empresa_desejada?.nome).filter(Boolean))
  ).sort();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="em_andamento">Em Andamento</SelectItem>
          <SelectItem value="aprovado">Aprovado</SelectItem>
          <SelectItem value="rejeitado">Rejeitado</SelectItem>
          <SelectItem value="convertido">Convertido</SelectItem>
        </SelectContent>
      </Select>

      <Select value={origemFilter} onValueChange={onOrigemChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as origens</SelectItem>
          {origensUnicas.map((origem) => (
            <SelectItem key={origem} value={origem}>
              {origem}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={destinoFilter} onValueChange={onDestinoChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por destino" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os destinos</SelectItem>
          {destinosUnicas.map((destino) => (
            <SelectItem key={destino} value={destino}>
              {destino}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FiltroWishlistItens;
