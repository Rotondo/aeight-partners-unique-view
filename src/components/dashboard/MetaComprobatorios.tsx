import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Building, TrendingUp, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
  // ISO week number (Monday-based)
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date as any - firstDayOfYear as any) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const MetaComprobatorios: React.FC<MetaComprobatoriosProps> = ({
  open,
  onClose,
  metaProgress
}) => {
  const { meta, oportunidades, realizado } = metaProgress;
  const [sortField, setSortField] = useState<string>('data_indicacao');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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
      const empresa = o.empresa_origem?.nome || '-';
      const valor = meta.tipo_meta === 'valor' ? (o.valor ?? 0) : 1;
      map[empresa] = (map[empresa] || 0) + valor;
    });
    return map;
  }, [oportunidades, meta.tipo_meta]);

  // 3. Gráfico semanal (barra)
  const semanalData = useMemo(() => {
    if (!oportunidades.length) return [];
    const inicio = new Date(Math.min(...oportunidades.map(o => new Date(o.data_indicacao).getTime())));
    const fim = new Date(Math.max(...oportunidades.map(o => new Date(o.data_indicacao).getTime())));
    const ano = inicio.getFullYear();
    const startWeek = getWeekNumber(inicio);
    const endWeek = getWeekNumber(fim);
    const weeks: { week: string, valor: number }[] = [];
    for (let w = startWeek; w <= endWeek; w++) {
      weeks.push({ week: `Semana ${w}`, valor: 0 });
    }
    oportunidades.forEach(o => {
      const d = new Date(o.data_indicacao);
      const week = getWeekNumber(d) - startWeek;
      const idx = week >= 0 ? week : 0;
      const valor = meta.tipo_meta === 'valor' ? (o.valor ?? 0) : 1;
      if (weeks[idx]) weeks[idx].valor += valor;
    });
    return weeks;
  }, [oportunidades, meta.tipo_meta]);

  // 5. Ordenação das colunas
  const sortedOportunidades = useMemo(() => {
    const ops = [...oportunidades];
    ops.sort((a, b) => {
      let av = a[sortField as keyof typeof a];
      let bv = b[sortField as keyof typeof b];
      // Para campos de valor, usa número. Para data, compara datas.
      if (sortField === 'valor') {
        av = a.valor ?? 0;
        bv = b.valor ?? 0;
      }
      if (sortField === 'data_indicacao') {
        av = new Date(a.data_indicacao).getTime();
        bv = new Date(b.data_indicacao).getTime();
      }
      if (sortField === 'empresa_origem') {
        av = a.empresa_origem?.nome || '';
        bv = b.empresa_origem?.nome || '';
      }
      if (sortField === 'empresa_destino') {
        av = a.empresa_destino?.nome || '';
        bv = b.empresa_destino?.nome || '';
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return ops;
  }, [oportunidades, sortField, sortAsc]);

  // 4. Exportar PDF da tela
  const handleExportPDF = async () => {
    const element = document.getElementById('meta-comprobatorio-content');
    if (!element) return;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
    pdf.save(`Comprovatorio_${meta.nome}.pdf`);
  };

  const handleSort = (field: string) => {
    if (field === sortField) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto" style={{ position: 'relative' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprobatórios da Meta: {meta.nome}
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-1" /> Exportar PDF
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="meta-comprobatorio-content" className="space-y-6">
          {/* Resumo da Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Resumo da Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{meta.tipo_meta}</p>
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
                  <p className="font-medium text-primary">
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Badge variant="default">Ganho</Badge>
                  <div className="font-bold text-green-700 mt-2">{formatValue(statusResumo.ganho, meta.tipo_meta)}</div>
                </div>
                <div>
                  <Badge variant="destructive">Perdido</Badge>
                  <div className="font-bold text-red-700 mt-2">{formatValue(statusResumo.perdido, meta.tipo_meta)}</div>
                </div>
                <div>
                  <Badge variant="outline">Outras</Badge>
                  <div className="font-bold text-gray-700 mt-2">{formatValue(statusResumo.outras, meta.tipo_meta)}</div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(origemResumo).map(([empresa, valor]) => (
                  <div key={empresa}>
                    <p className="text-sm text-muted-foreground">{empresa}</p>
                    <p className="font-medium">{formatValue(valor, meta.tipo_meta)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Gráfico semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Semanal ({meta.tipo_meta === 'valor' ? 'Valor' : 'Quantidade'})</CardTitle>
            </CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semanalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#2563eb" name={meta.tipo_meta === 'valor' ? 'Valor (R$)' : 'Quantidade'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lista de Oportunidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Oportunidades que Compõem a Meta ({oportunidades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oportunidades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma oportunidade encontrada para esta meta</p>
                  <p className="text-sm">Verifique os critérios e período da meta</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('nome_lead')}>Lead</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('empresa_origem')}>Empresa Origem</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('empresa_destino')}>Empresa Destino</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('valor')}>Valor</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>Status</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('data_indicacao')}>Data Indicação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedOportunidades.map((oportunidade) => (
                        <TableRow key={oportunidade.id}>
                          <TableCell className="font-medium">
                            {oportunidade.nome_lead}
                          </TableCell>
                          <TableCell>
                            {oportunidade.empresa_origem?.nome || '-'}
                          </TableCell>
                          <TableCell>
                            {oportunidade.empresa_destino?.nome || '-'}
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
