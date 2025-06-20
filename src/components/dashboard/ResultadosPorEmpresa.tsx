
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, TrendingUp, DollarSign } from 'lucide-react';
import { TooltipHelper, tooltipTexts } from './TooltipHelper';
import type { ResultadosPorEmpresa } from '@/types/metas';

interface ResultadosPorEmpresaComponentProps {
  resultados: ResultadosPorEmpresa[];
}

export const ResultadosPorEmpresaComponent: React.FC<ResultadosPorEmpresaComponentProps> = ({ resultados }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoEmpresaBadge = (tipo: string) => {
    switch (tipo) {
      case 'intragrupo':
        return <Badge variant="default">Intragrupo</Badge>;
      case 'parceiro':
        return <Badge variant="secondary">Parceiro</Badge>;
      case 'cliente':
        return <Badge variant="outline">Cliente</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const getTipoEmpresaTooltip = (tipo: string) => {
    switch (tipo) {
      case 'intragrupo':
        return tooltipTexts.empresa.tipoIntragrupo;
      case 'parceiro':
        return tooltipTexts.empresa.tipoParceiro;
      case 'cliente':
        return tooltipTexts.empresa.tipoCliente;
      default:
        return '';
    }
  };

  if (resultados.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum resultado encontrado</p>
            <p className="text-sm">Verifique os filtros aplicados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Resultados por Empresa ({resultados.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Quantidade
                    <TooltipHelper content={tooltipTexts.empresa.quantidadeTotal} />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Valor Total
                    <TooltipHelper content={tooltipTexts.grupo.valorTotal} />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Taxa Conversão
                    <TooltipHelper content={tooltipTexts.empresa.taxaConversao} />
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    Ticket Médio
                    <TooltipHelper content={tooltipTexts.empresa.ticketMedio} />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultados.map((empresa) => (
                <TableRow key={empresa.empresa_id}>
                  <TableCell className="font-medium">
                    {empresa.empresa_nome}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTipoEmpresaBadge(empresa.empresa_tipo)}
                      <TooltipHelper content={getTipoEmpresaTooltip(empresa.empresa_tipo)} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {empresa.quantidade_total}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(empresa.valor_total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {empresa.taxa_conversao.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(empresa.ticket_medio)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
