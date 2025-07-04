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
import { WishlistStatus } from "@/types";

interface FiltroWishlistItensProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: WishlistStatus | "all";
  onStatusChange: (value: WishlistStatus | "all") => void;
}

const FiltroWishlistItens: React.FC<FiltroWishlistItensProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-sm">
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
    </div>
  );
};

export default FiltroWishlistItens;