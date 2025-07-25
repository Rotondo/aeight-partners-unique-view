
import React, { useState } from 'react';
import { ParceiroStats } from '@/types/parceiro-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParceiroStatsTableProps {
  stats: ParceiroStats[];
  loading: boolean;
}

type SortField = keyof ParceiroStats;
type SortDirection = 'asc' | 'desc';

export const ParceiroStatsTable: React.FC<ParceiroStatsTableProps> = ({ stats, loading }) => {
  const [sortField, setSortField] = useState<SortField>('diferenca');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' 
        ? aValue.getTime() - bValue.getTime() 
        : bValue.getTime() - aValue.getTime();
    }

    return 0;
  });

  const formatValue = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number | null, decimals: number = 2) => {
    if (value === null) return '-';
    return value.toFixed(decimals);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getDiferencaColor = (diferenca: number) => {
    if (diferenca > 0) return 'text-green-600';
    if (diferenca < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Parceiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estatísticas por Parceiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('nome')}
                    className="h-auto p-0 font-medium"
                  >
                    Nome do Parceiro
                    {getSortIcon('nome')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('oportunidadesRecebidas')}
                    className="h-auto p-0 font-medium"
                  >
                    Recebidas
                    {getSortIcon('oportunidadesRecebidas')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('oportunidadesEnviadas')}
                    className="h-auto p-0 font-medium"
                  >
                    Enviadas
                    {getSortIcon('oportunidadesEnviadas')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('diferenca')}
                    className="h-auto p-0 font-medium"
                  >
                    Diferença
                    {getSortIcon('diferenca')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('diasUltimaOportunidade')}
                    className="h-auto p-0 font-medium"
                  >
                    Dias Última Op.
                    {getSortIcon('diasUltimaOportunidade')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('mediaOportunidadesPorDia')}
                    className="h-auto p-0 font-medium"
                  >
                    Média/Dia
                    {getSortIcon('mediaOportunidadesPorDia')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('mediaValor')}
                    className="h-auto p-0 font-medium"
                  >
                    Média Valor
                    {getSortIcon('mediaValor')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('somaValor')}
                    className="h-auto p-0 font-medium"
                  >
                    Soma Valor
                    {getSortIcon('somaValor')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStats.map((parceiro) => (
                <TableRow key={parceiro.id}>
                  <TableCell className="font-medium">{parceiro.nome}</TableCell>
                  <TableCell className="text-right">{parceiro.oportunidadesRecebidas}</TableCell>
                  <TableCell className="text-right">{parceiro.oportunidadesEnviadas}</TableCell>
                  <TableCell className={`text-right font-medium ${getDiferencaColor(parceiro.diferenca)}`}>
                    {parceiro.diferenca > 0 ? '+' : ''}{parceiro.diferenca}
                  </TableCell>
                  <TableCell className="text-right">
                    {parceiro.diasUltimaOportunidade !== null ? `${parceiro.diasUltimaOportunidade} dias` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(parceiro.mediaOportunidadesPorDia, 3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(parceiro.mediaValor)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(parceiro.somaValor)}
                  </TableCell>
                </TableRow>
              ))}
              {sortedStats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum parceiro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
