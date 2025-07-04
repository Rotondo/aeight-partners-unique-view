import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { WishlistStatus } from "@/types";

interface FiltroWishlistItensProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onNovoClick: () => void;
}

const FiltroWishlistItens: React.FC<FiltroWishlistItensProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onNovoClick,
}) => {
  return (
    <div className="flex justify-between items-center gap-4 mb-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por empresa ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="aprovado">Aprovados</SelectItem>
            <SelectItem value="rejeitado">Rejeitados</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluídos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onNovoClick} className="flex-shrink-0">
        <Plus className="mr-2 h-4 w-4" />
        Nova Solicitação
      </Button>
    </div>
  );
};

export default FiltroWishlistItens;