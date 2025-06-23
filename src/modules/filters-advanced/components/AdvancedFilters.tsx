
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FilterState } from '@/modules/dashboard-core/types';

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros Avançados - Análise do Grupo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtro Apenas Empresas do Grupo */}
          <div className="flex items-center space-x-2">
            <Switch
              id="apenas-grupo"
              checked={filters.apenasEmpresasGrupo}
              onCheckedChange={(checked) => handleFilterChange('apenasEmpresasGrupo', checked)}
            />
            <Label htmlFor="apenas-grupo" className="text-sm">
              Apenas Empresas do Grupo
            </Label>
          </div>

          {/* Filtro Tipo de Relação */}
          <div className="space-y-2">
            <Label htmlFor="tipo-relacao" className="text-sm">
              Tipo de Relação
            </Label>
            <Select
              value={filters.tipoRelacao}
              onValueChange={(value) => handleFilterChange('tipoRelacao', value)}
            >
              <SelectTrigger id="tipo-relacao">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="intra">Intragrupo → Intragrupo</SelectItem>
                <SelectItem value="extra">Parceiro → Intragrupo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status das Oportunidades */}
          <div className="space-y-2">
            <Label htmlFor="status-op" className="text-sm">
              Status
            </Label>
            <Select
              value={filters.status || 'todos'}
              onValueChange={(value) => handleFilterChange('status', value === 'todos' ? undefined : value)}
            >
              <SelectTrigger id="status-op">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="em_contato">Em Contato</SelectItem>
                <SelectItem value="negociando">Negociando</SelectItem>
                <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                <SelectItem value="ganho">Ganho</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Indicadores visuais dos filtros ativos */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.apenasEmpresasGrupo && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Apenas Grupo
            </span>
          )}
          {filters.tipoRelacao !== 'todos' && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              {filters.tipoRelacao === 'intra' ? 'Intragrupo' : 'Extragrupo'}
            </span>
          )}
          {filters.status && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Status: {filters.status}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
