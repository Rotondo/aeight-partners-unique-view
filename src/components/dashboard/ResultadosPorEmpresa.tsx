
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { ResultadosPorEmpresa } from '@/types/metas';

interface ResultadosPorEmpresaProps {
  resultados: ResultadosPorEmpresa[];
}

export const ResultadosPorEmpresaComponent: React.FC<ResultadosPorEmpresaProps> = ({ resultados }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'nome' | 'quantidade' | 'valor' | 'conversao'>('valor');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'intragrupo':
        return 'Intragrupo';
      case 'parceiro':
        return 'Parceiro';
      case 'cliente':
        return 'Cliente';
      default:
        return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'intragrupo':
        return 'default';
      case 'parceiro':
        return 'secondary';
      case 'cliente':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredAndSortedResults = resultados
    .filter(resultado => {
      const matchesSearch = resultado.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = tipoFilter === 'all' || resultado.empresa_tipo === tipoFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return a.empresa_nome.localeCompare(b.empresa_nome);
        case 'quantidade':
          return b.quantidade_total - a.quantidade_total;
        case 'valor':
          return b.valor_total - a.valor_total;
        case 'conversao':
          return b.taxa_conversao - a.taxa_conversao;
        default:
          return 0;
      }
    });

  const totais = resultados.reduce(
    (acc, resultado) => ({
      quantidade: acc.quantidade + resultado.quantidade_total,
      valor: acc.valor + resultado.valor_total,
    }),
    { quantidade: 0, valor: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{resultados.length}</div>
            <p className="text-sm text-gray-600">Empresas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{totais.quantidade}</div>
            <p className="text-sm text-gray-600">Total de Oportunidades</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{formatCurrency(totais.valor)}</div>
            <p className="text-sm text-gray-600">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="intragrupo">Intragrupo</SelectItem>
                <SelectItem value="parceiro">Parceiro</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="quantidade">Quantidade</SelectItem>
                <SelectItem value="valor">Valor</SelectItem>
                <SelectItem value="conversao">Conversão</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados por Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-right">Taxa Conversão</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedResults.map((resultado) => (
                <TableRow key={resultado.empresa_id}>
                  <TableCell className="font-medium">
                    {resultado.empresa_nome}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadgeVariant(resultado.empresa_tipo)}>
                      {getTipoLabel(resultado.empresa_tipo)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {resultado.quantidade_total}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(resultado.valor_total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">
                      {formatPercentage(resultado.taxa_conversao)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(resultado.ticket_medio)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAndSortedResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma empresa encontrada com os filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
