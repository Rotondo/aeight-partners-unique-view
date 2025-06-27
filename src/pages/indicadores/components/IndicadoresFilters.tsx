
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
import { Empresa } from "@/types";
import { maskName } from "../utils";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface IndicadoresFilttersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedEmpresa: string;
  setSelectedEmpresa: (empresa: string) => void;
  empresas: Empresa[];
  onExportCSV: () => void;
  onRefresh: () => void;
}

export const IndicadoresFilters: React.FC<IndicadoresFilttersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedEmpresa,
  setSelectedEmpresa,
  empresas,
  onExportCSV,
  onRefresh,
}) => {
  const { isDemoMode } = usePrivacy();

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Buscar empresa..."
        className="w-[220px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Select value={selectedEmpresa} onValueChange={setSelectedEmpresa}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por empresa" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as empresas</SelectItem>
          {empresas.map((empresa) => (
            <SelectItem key={empresa.id} value={empresa.id}>
              {maskName(empresa.nome, isDemoMode)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onExportCSV} variant="outline">Exportar CSV</Button>
      <Button onClick={onRefresh}>Atualizar</Button>
    </div>
  );
};
