
import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Building, TrendingUp, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MetaProgress } from '@/types/metas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";

interface MetaComprobatoriosProps {
  open: boolean;
  onClose: () => void;
  metaProgress: MetaProgress;
}

type StatusResumo = {
  ganho: number;
  perdido: number;
  outras: number;
};

type OrigemResumo = {
  [empresa: string]: number;
};

type SortField = 'nome_lead' | 'empresa_origem' | 'empresa_destino' | 'valor' | 'status' | 'data_indicacao';

function formatValue(value: number, tipo: 'quantidade' | 'valor') {
  if (tipo === 'valor') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  return value.toString();
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function getStatusBadge(status: string) {
  const statusMap = {
    'ganho': { label: 'Ganho', variant: 'default' as const },
    'perdido': { label: 'Perdido', variant: 'destructive' as const },
    'em_contato': { label: 'Em Contato', variant: 'secondary' as const },
    'negociando': { label: 'Negociando', variant: 'outline' as const }
  };
  const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const MetaComprobatorios: React.FC<MetaComprobatoriosProps> = ({
  open,
  onClose,
  metaProgress
}) => {
  const { meta, oportunidades, realizado } = metaProgress;
  const [sortField, setSortField] = useState<SortField>('data_indicacao');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // 1. Somatória de Realizado por Status
  const statusResumo: StatusResumo = useMemo(() => {
    let ganho = 0, perdido = 0, outras = 0;
    oportunidades.forEach(o => {
      const valor = meta.tipo_meta === 'valor' ? (o.valor ?? 0) : 1;
      if (o.status === 'ganho') ganho += valor;
      else if (o.status === 'perdido') perdido += valor;
      else outras += valor;
    });
    return { ganho, perdido, outras };
  }, [oportunidades, meta.tipo_meta]);

  // 2. Somatória por Empresa Origem
  const origemResumo: OrigemResumo = useMemo(() => {
    const map: OrigemResumo = {};
    oportunidades.forEach(o => {
      const empresa = o.empresa_origem?.nome || 'Não informado';
      const valor = meta.tipo_meta === 'valor' ? (o.valor ?? 0) : 1;
      map[empresa] = (map[empresa] || 0) + valor;
    });
    return map;
  }, [oportunidades, meta.tipo_meta]);

  // 3. Gráfico semanal (barra)
  const semanalData = useMemo(() => {
    if (!oportunidades.length) return [];
    
    const weekMap = new Map<string, number>();
    
    oportunidades.forEach(o => {
      const date = new Date(o.data_indicacao);
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
      
      const valor = meta.tipo_meta === 'valor' ? (o.valor ?? 0) : 1;
      weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + valor);
    });

    return Array.from(weekMap.entries()).map(([key, valor]) => {
      const week = key.split('-W')[1];
      const year = key.split('-W')[0];
      return {
        week: `Sem ${week}/${year}`,
        valor: valor
      };
    }).sort();
  }, [oportunidades, meta.tipo_meta]);

  // 5. Ordenação das colunas
  const sortedOportunidades = useMemo(() => {
    const ops = [...oportunidades];
    ops.sort((a, b) => {
      let av: any, bv: any;
      
      switch (sortField) {
        case 'valor':
          av = a.valor ?? 0;
          bv = b.valor ?? 0;
          break;
        case 'data_indicacao':
          av = new Date(a.data_indicacao).getTime();
          bv = new Date(b.data_indicacao).getTime();
          break;
        case 'empresa_origem':
          av = a.empresa_origem?.nome || '';
          bv = b.empresa_origem?.nome || '';
          break;
        case 'empresa_destino':
          av = a.empresa_destino?.nome || '';
          bv = b.empresa_destino?.nome || '';
          break;
        default:
          av = a[sortField] || '';
          bv = b[sortField] || '';
      }
      
      if (typeof av === 'string' && typeof bv === 'string') {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return ops;
  }, [oportunidades, sortField, sortAsc]);

  // 4. Exportar PDF da tela
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('meta-comprobatorio-content');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Comprobatorio_${meta.nome}_${new Date().toLocaleDateString('pt-BR')}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Custom tooltip formatter function
  const customTooltipFormatter = (value: any, name: any) => {
    const formattedValue = meta.tipo_meta === 'valor' ? formatValue(Number(value), 'valor') : value;
    const label = meta.tipo_meta === 'valor' ? 'Valor (R$)' : 'Quantidade';
    return [formattedValue, label];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Comprobatórios da Meta: {meta.nome}
            </div>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div id="meta-comprobatorio-content" className="space-y-6 p-4">
          {/* Resumo da Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Resumo da Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{meta.tipo_meta}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium capitalize">{meta.periodo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Segmento</p>
                  <p className="font-medium">{meta.segmento_grupo.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Considerado</p>
                  <Badge variant="outline">
                    {meta.status_oportunidade === 'todas' ? 'Todas' : 'Apenas Ganhas'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Realizado</p>
                  <p className="font-bold text-primary text-lg">
                    {formatValue(realizado, meta.tipo_meta)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 1. Somatória de Realizado por Status */}
          <Card>
            <CardHeader>
              <CardTitle>Realizado por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <Badge variant="default" className="mb-2">Ganho</Badge>
                  <div className="text-2xl font-bold text-green-600">
                    {formatValue(statusResumo.ganho, meta.tipo_meta)}
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="destructive" className="mb-2">Perdido</Badge>
                  <div className="text-2xl font-bold text-red-600">
                    {formatValue(statusResumo.perdido, meta.tipo_meta)}
                  </div>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">Outras</Badge>
                  <div className="text-2xl font-bold text-gray-600">
                    {formatValue(statusResumo.outras, meta.tipo_meta)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Somatória por Empresa Origem */}
          <Card>
            <CardHeader>
              <CardTitle>Realizado por Empresa Origem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(origemResumo)
                  .sort(([,a], [,b]) => b - a)
                  .map(([empresa, valor]) => (
                  <div key={empresa} className="p-3 border rounded-lg">
                    <p className="text-sm text-muted-foreground truncate" title={empresa}>
                      {empresa}
                    </p>
                    <p className="font-semibold text-lg">
                      {formatValue(valor, meta.tipo_meta)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Gráfico semanal */}
          <Card>
            <CardHeader>
              <CardTitle>
                Distribuição Semanal ({meta.tipo_meta === 'valor' ? 'Valor' : 'Quantidade'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={semanalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={customTooltipFormatter}
                    />
                    <Legend />
                    <Bar 
                      dataKey="valor" 
                      fill="hsl(var(--primary))" 
                      name={meta.tipo_meta === 'valor' ? 'Valor (R$)' : 'Quantidade'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Oportunidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Oportunidades que Compõem a Meta ({oportunidades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oportunidades.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Nenhuma oportunidade encontrada</p>
                  <p className="text-sm">Verifique os critérios e período da meta</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('nome_lead')}
                        >
                          <div className="flex items-center gap-1">
                            Lead
                            {getSortIcon('nome_lead')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('empresa_origem')}
                        >
                          <div className="flex items-center gap-1">
                            Empresa Origem
                            {getSortIcon('empresa_origem')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('empresa_destino')}
                        >
                          <div className="flex items-center gap-1">
                            Empresa Destino
                            {getSortIcon('empresa_destino')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('valor')}
                        >
                          <div className="flex items-center gap-1">
                            Valor
                            {getSortIcon('valor')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort('data_indicacao')}
                        >
                          <div className="flex items-center gap-1">
                            Data Indicação
                            {getSortIcon('data_indicacao')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOportunidades.map((oportunidade) => (
                        <TableRow key={oportunidade.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {oportunidade.nome_lead}
                          </TableCell>
                          <TableCell>
                            {oportunidade.empresa_origem?.nome || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {oportunidade.empresa_destino?.nome || 'Não informado'}
                          </TableCell>
                          <TableCell>
                            {oportunidade.valor 
                              ? formatValue(oportunidade.valor, 'valor')
                              : (meta.tipo_meta === 'quantidade' ? '1' : '-')
                            }
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(oportunidade.status)}
                          </TableCell>
                          <TableCell>
                            {formatDate(oportunidade.data_indicacao)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
