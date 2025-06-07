
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { getFunnelValuesAnalysis, getOportunidadesSemValor, getTotalPipelineValue } from '@/lib/dbFunctionsValues';
import { PrivateData } from '@/components/privacy/PrivateData';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const ValuesFunnelAnalysis: React.FC = () => {
  const [funnelValues, setFunnelValues] = useState<any[]>([]);
  const [oportunidadesSemValor, setOportunidadesSemValor] = useState<any[]>([]);
  const [totalValues, setTotalValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { filterParams } = useOportunidades();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [funnelData, semValorData, totalData] = await Promise.all([
          getFunnelValuesAnalysis(
            filterParams.dataInicio ? new Date(filterParams.dataInicio) : null,
            filterParams.dataFim ? new Date(filterParams.dataFim) : null,
            filterParams.empresaOrigemId || null
          ),
          getOportunidadesSemValor(
            filterParams.dataInicio ? new Date(filterParams.dataInicio) : null,
            filterParams.dataFim ? new Date(filterParams.dataFim) : null,
            filterParams.empresaOrigemId || null
          ),
          getTotalPipelineValue(
            filterParams.dataInicio ? new Date(filterParams.dataInicio) : null,
            filterParams.dataFim ? new Date(filterParams.dataFim) : null,
            filterParams.empresaOrigemId || null
          )
        ]);
        
        setFunnelValues(funnelData);
        setOportunidadesSemValor(semValorData);
        setTotalValues(totalData);
      } catch (error) {
        console.error('Error fetching values data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'em_contato': 'Em Contato',
      'negociando': 'Negociando',
      'ganho': 'Ganho',
      'perdido': 'Perdido',
      'Contato': 'Contato',
      'Apresentado': 'Apresentado',
      'Sem contato': 'Sem Contato'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'em_contato': 'bg-blue-100 text-blue-800',
      'negociando': 'bg-yellow-100 text-yellow-800',
      'ganho': 'bg-green-100 text-green-800',
      'perdido': 'bg-red-100 text-red-800',
      'Contato': 'bg-blue-100 text-blue-800',
      'Apresentado': 'bg-purple-100 text-purple-800',
      'Sem contato': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Pipeline Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="currency">
                {formatCurrency(totalValues?.total_pipeline || 0)}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              <PrivateData type="asterisk">
                {totalValues?.count_total || 0}
              </PrivateData> oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ganho</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <PrivateData type="currency">
                {formatCurrency(totalValues?.total_ganho || 0)}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              <PrivateData type="asterisk">
                {totalValues?.count_ganho || 0}
              </PrivateData> oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <PrivateData type="currency">
                {formatCurrency(totalValues?.total_em_andamento || 0)}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              <PrivateData type="asterisk">
                {totalValues?.count_em_andamento || 0}
              </PrivateData> oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Perdido</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <PrivateData type="currency">
                {formatCurrency(totalValues?.total_perdido || 0)}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              <PrivateData type="asterisk">
                {totalValues?.count_perdido || 0}
              </PrivateData> oportunidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Valores por Status</CardTitle>
          <CardDescription>
            Distribuição de valores por status das oportunidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnelValues.map((item: any) => (
              <div key={item.status} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <PrivateData type="asterisk">
                        {item.count}
                      </PrivateData> oportunidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    <PrivateData type="currency">
                      {formatCurrency(item.total_valor)}
                    </PrivateData>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Média: <PrivateData type="currency">
                      {formatCurrency(item.valor_medio)}
                    </PrivateData>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunities without value */}
      {oportunidadesSemValor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Oportunidades sem Valor
            </CardTitle>
            <CardDescription>
              <PrivateData type="asterisk">
                {oportunidadesSemValor.length}
              </PrivateData> oportunidades não possuem valor definido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {oportunidadesSemValor.map((op: any) => (
                <div key={op.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium">
                      <PrivateData type="name">
                        {op.nome_lead}
                      </PrivateData>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <PrivateData type="name">
                        {op.empresa_origem?.nome}
                      </PrivateData> → <PrivateData type="name">
                        {op.empresa_destino?.nome}
                      </PrivateData>
                    </p>
                  </div>
                  <Badge className={getStatusColor(op.status)}>
                    {getStatusLabel(op.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
