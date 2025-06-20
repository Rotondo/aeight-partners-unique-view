
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Building, TrendingUp } from 'lucide-react';
import type { MetaProgress } from '@/types/metas';

interface MetaComprobatoriosProps {
  open: boolean;
  onClose: () => void;
  metaProgress: MetaProgress;
}

export const MetaComprobatorios: React.FC<MetaComprobatoriosProps> = ({
  open,
  onClose,
  metaProgress
}) => {
  const { meta, oportunidades, realizado } = metaProgress;

  const formatValue = (value: number, tipo: 'quantidade' | 'valor') => {
    if (tipo === 'valor') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'ganho': { label: 'Ganho', variant: 'default' as const },
      'perdido': { label: 'Perdido', variant: 'destructive' as const },
      'em_contato': { label: 'Em Contato', variant: 'secondary' as const },
      'negociando': { label: 'Negociando', variant: 'outline' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprobatórios da Meta: {meta.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                        <TableHead>Lead</TableHead>
                        <TableHead>Empresa Origem</TableHead>
                        <TableHead>Empresa Destino</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Indicação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {oportunidades.map((oportunidade) => (
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
                              : '-'
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
