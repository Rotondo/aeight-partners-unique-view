
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';

interface ContatosFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  interesseFilter: string;
  onInteresseChange: (interesse: string) => void;
  empresaFilter: string;
  onEmpresaChange: (empresa: string) => void;
  empresasDisponiveis: string[];
  onClearFilters: () => void;
  totalContatos: number;
  contatosFiltrados: number;
}

export const ContatosFilters: React.FC<ContatosFiltersProps> = ({
  searchTerm,
  onSearchChange,
  interesseFilter,
  onInteresseChange,
  empresaFilter,
  onEmpresaChange,
  empresasDisponiveis,
  onClearFilters,
  totalContatos,
  contatosFiltrados
}) => {
  const hasActiveFilters = searchTerm || interesseFilter !== 'all' || empresaFilter !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, email, empresa..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={interesseFilter} onValueChange={onInteresseChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Interesse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os níveis</SelectItem>
            <SelectItem value="5">Muito Alto (5)</SelectItem>
            <SelectItem value="4">Alto (4)</SelectItem>
            <SelectItem value="3">Médio (3)</SelectItem>
            <SelectItem value="2">Baixo (2)</SelectItem>
            <SelectItem value="1">Muito Baixo (1)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={empresaFilter} onValueChange={onEmpresaChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresasDisponiveis.map(empresa => (
              <SelectItem key={empresa} value={empresa}>
                {empresa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {contatosFiltrados} de {totalContatos} contatos
          </span>
        </div>

        {hasActiveFilters && (
          <div className="flex gap-2">
            {searchTerm && (
              <Badge variant="secondary">
                Busca: "{searchTerm}"
              </Badge>
            )}
            {interesseFilter !== 'all' && (
              <Badge variant="secondary">
                Interesse: {interesseFilter}
              </Badge>
            )}
            {empresaFilter !== 'all' && (
              <Badge variant="secondary">
                Empresa: {empresaFilter}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
