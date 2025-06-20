
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, RotateCcw } from 'lucide-react';
import { TooltipHelper } from './TooltipHelper';
import type { ResultadosFilters } from '@/types/metas';

interface ResultadosFiltersProps {
  filters: ResultadosFilters;
  onFiltersChange: (filters: ResultadosFilters) => void;
}

export const ResultadosFilters: React.FC<ResultadosFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleDataInicioChange = (value: string) => {
    onFiltersChange({ ...filters, dataInicio: value });
  };

  const handleDataFimChange = (value: string) => {
    onFiltersChange({ ...filters, dataFim: value });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getCurrentMonthEnd = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  };

  const setCurrentMonth = () => {
    onFiltersChange({
      dataInicio: getCurrentMonth(),
      dataFim: getCurrentMonthEnd()
    });
  };

  const setCurrentYear = () => {
    const year = new Date().getFullYear();
    onFiltersChange({
      dataInicio: `${year}-01-01`,
      dataFim: `${year}-12-31`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros de Período
          <TooltipHelper content="Filtros aplicados baseados na data de indicação das oportunidades (data_indicacao)" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={filters.dataInicio || ''}
              onChange={(e) => handleDataInicioChange(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataFim">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={filters.dataFim || ''}
              onChange={(e) => handleDataFimChange(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Atalhos</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={setCurrentMonth}
              className="justify-start"
            >
              Mês Atual
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Label>&nbsp;</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setCurrentYear}
                className="flex-1"
              >
                Ano Atual
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
