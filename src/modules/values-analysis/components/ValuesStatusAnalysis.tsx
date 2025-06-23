
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';
import { Oportunidade } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';
import { DrillDownData } from '@/modules/dashboard-core/types';

interface ValuesStatusAnalysisProps {
  oportunidades: Oportunidade[];
}

export const ValuesStatusAnalysis: React.FC<ValuesStatusAnalysisProps> = ({
  oportunidades
}) => {
  const [selectedStatus, setSelectedStatus] = useState<DrillDownData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusData = React.useMemo(() => {
    const statusMap = new Map<string, { valor: number; quantidade: number; oportunidades: Oportunidade[] }>();
    
    oportunidades.forEach(op => {
      const status = op.status || 'indefinido';
      const existing = statusMap.get(status) || { valor: 0, quantidade: 0, oportunidades: [] };
      existing.valor += op.valor || 0;
      existing.quantidade += 1;
      existing.oportunidades.push(op);
      statusMap.set(status, existing);
    });

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      valor: data.valor,
      quantidade: data.quantidade,
      oportunidades: data.oportunidades,
      ticketMedio: data.quantidade > 0 ? data.valor / data.quantidade : 0
    }));
  }, [oportunidades]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ganho': 'bg-green-500',
      'perdido': 'bg-red-500',
      'em_contato': 'bg-blue-500',
      'negociando': 'bg-yellow-500',
      'proposta_enviada': 'bg-purple-500',
      'aguardando_aprovacao': 'bg-orange-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const handleDrillDown = (statusInfo: any) => {
    const drillDownData: DrillDownData = {
      status: statusInfo.status,
      oportunidades: statusInfo.oportunidades.map((op: Oportunidade) => ({
        id: op.id,
        nome_lead: op.nome_lead,
        empresa_origem: op.empresa_origem,
        valor: op.valor,
        data_indicacao: op.data_indicacao,
        data_fechamento: op.data_fechamento,
        tipo_relacao: op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo' ? 'intra' : 'extra'
      }))
    };
    setSelectedStatus(drillDownData);
    setIsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Valores por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [
                    <PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>,
                    'Valor Total'
                  ]}
                />
                <Bar dataKey="valor" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards de Status com Drill-down */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {statusData.map((statusInfo) => (
              <Card key={statusInfo.status} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{statusInfo.status}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(statusInfo.status)}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Valor Total</div>
                      <div className="font-bold">
                        <PrivateData type="currency">
                          {formatCurrency(statusInfo.valor)}
                        </PrivateData>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Quantidade</div>
                      <div className="font-bold">
                        <PrivateData type="asterisk">
                          {statusInfo.quantidade}
                        </PrivateData>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground">Ticket Médio</div>
                      <div className="font-bold">
                        <PrivateData type="currency">
                          {formatCurrency(statusInfo.ticketMedio)}
                        </PrivateData>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => handleDrillDown(statusInfo)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Detalhes ({statusInfo.quantidade})
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Drill-down */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Oportunidades - Status: {selectedStatus?.status}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStatus && (
            <div className="space-y-4">
              <div className="grid gap-2">
                {selectedStatus.oportunidades.map((op) => (
                  <Card key={op.id} className="p-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                      <div>
                        <div className="font-medium">{op.nome_lead}</div>
                        <div className="text-sm text-muted-foreground">
                          {op.empresa_origem?.nome || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Badge variant={op.tipo_relacao === 'intra' ? 'default' : 'secondary'}>
                          {op.tipo_relacao === 'intra' ? 'Intragrupo' : 'Extragrupo'}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <PrivateData type="currency">
                          {formatCurrency(op.valor || 0)}
                        </PrivateData>
                      </div>
                      
                      <div className="text-sm text-muted-foreground text-center">
                        {new Date(op.data_indicacao).toLocaleDateString('pt-BR')}
                        {op.data_fechamento && (
                          <div>
                            Fechado: {new Date(op.data_fechamento).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
