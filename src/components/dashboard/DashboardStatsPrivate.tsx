
import React from 'react';
import { PrivateData } from '@/components/privacy/PrivateData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DashboardStatsPrivate: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateData type="value">1,234</PrivateData>
          </div>
          <p className="text-xs text-muted-foreground">
            +20.1% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateData type="currency">R$ 2.500.000</PrivateData>
          </div>
          <p className="text-xs text-muted-foreground">
            +15.2% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Taxa de Conversão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateData type="percentage">68%</PrivateData>
          </div>
          <p className="text-xs text-muted-foreground">
            +2.1% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Parceiros Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateData type="value">45</PrivateData>
          </div>
          <p className="text-xs text-muted-foreground">
            +3 novos parceiros este mês
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
