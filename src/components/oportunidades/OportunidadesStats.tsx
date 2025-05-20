
import React, { useState, useEffect } from "react";
import { useOportunidades } from "./OportunidadesContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import { format, subMonths, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  em_contato: '#3b82f6', // blue
  negociando: '#eab308', // yellow
  ganho: '#22c55e', // green
  perdido: '#ef4444', // red
};

export const OportunidadesStats: React.FC = () => {
  const { oportunidades } = useOportunidades();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPieIndex, setSelectedPieIndex] = useState<number | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState("mensal");

  // Extract oportunidades por mês
  const oportunidadesPorMes = React.useMemo(() => {
    // Get current date and 11 months ago
    const today = new Date();
    const elevenMonthsAgo = subMonths(today, 11);
    
    // Initialize months
    const months: Record<string, { name: string, total: number, ganho: number, perdido: number }> = {};
    
    // Generate last 12 months
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, 11 - i);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM', { locale: ptBR });
      months[monthKey] = { name: monthName, total: 0, ganho: 0, perdido: 0 };
    }
    
    // Count opportunities by month
    oportunidades.forEach(op => {
      const date = new Date(op.data_indicacao);
      const monthKey = format(date, 'yyyy-MM');
      
      // Only count if it's within the last 12 months
      if (months[monthKey]) {
        months[monthKey].total += 1;
        if (op.status === 'ganho') months[monthKey].ganho += 1;
        if (op.status === 'perdido') months[monthKey].perdido += 1;
      }
    });
    
    return Object.values(months);
  }, [oportunidades]);

  // Extract status distribution
  const statusDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {
      em_contato: 0,
      negociando: 0,
      ganho: 0,
      perdido: 0
    };
    
    oportunidades.forEach(op => {
      counts[op.status] += 1;
    });
    
    return [
      { name: 'Em Contato', value: counts.em_contato, color: STATUS_COLORS.em_contato },
      { name: 'Negociando', value: counts.negociando, color: STATUS_COLORS.negociando },
      { name: 'Ganho', value: counts.ganho, color: STATUS_COLORS.ganho },
      { name: 'Perdido', value: counts.perdido, color: STATUS_COLORS.perdido }
    ];
  }, [oportunidades]);

  // Extract company exchanges
  const empresasExchanges = React.useMemo(() => {
    const exchanges: Record<string, Record<string, number>> = {};
    
    oportunidades.forEach(op => {
      if (!op.empresa_origem?.nome || !op.empresa_destino?.nome) return;
      
      const origem = op.empresa_origem.nome;
      const destino = op.empresa_destino.nome;
      
      if (!exchanges[origem]) {
        exchanges[origem] = {};
      }
      
      exchanges[origem][destino] = (exchanges[origem][destino] || 0) + 1;
    });
    
    return exchanges;
  }, [oportunidades]);
  
  // Extract company conversion rates
  const empresasConversion = React.useMemo(() => {
    const conversions: Record<string, { total: number, ganho: number, perdido: number, taxa: number }> = {};
    
    oportunidades.forEach(op => {
      if (!op.empresa_origem?.nome) return;
      
      const origem = op.empresa_origem.nome;
      
      if (!conversions[origem]) {
        conversions[origem] = { total: 0, ganho: 0, perdido: 0, taxa: 0 };
      }
      
      conversions[origem].total += 1;
      if (op.status === 'ganho') conversions[origem].ganho += 1;
      if (op.status === 'perdido') conversions[origem].perdido += 1;
    });
    
    // Calculate conversion rates
    Object.keys(conversions).forEach(empresa => {
      const { total, ganho } = conversions[empresa];
      // Avoid division by zero
      conversions[empresa].taxa = total > 0 ? (ganho / total) * 100 : 0;
    });
    
    return Object.entries(conversions)
      .map(([empresa, stats]) => ({
        empresa,
        ...stats,
        taxa: parseFloat(stats.taxa.toFixed(2))
      }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [oportunidades]);

  // Render active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value 
    } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#000">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666">
          {value} ({(percent * 100).toFixed(1)}%)
        </text>
      </g>
    );
  };

  // Handle pie chart sector click
  const onPieEnter = (_: any, index: number) => {
    setSelectedPieIndex(index);
  };
  
  const onPieLeave = () => {
    setSelectedPieIndex(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total de Oportunidades</CardTitle>
            <CardDescription>Todas as oportunidades registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{oportunidades.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Em Aberto</CardTitle>
            <CardDescription>Em contato ou negociando</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {oportunidades.filter(op => ['em_contato', 'negociando'].includes(op.status)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Ganhas</CardTitle>
            <CardDescription>Oportunidades convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {oportunidades.filter(op => op.status === 'ganho').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Perdidas</CardTitle>
            <CardDescription>Oportunidades não convertidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {oportunidades.filter(op => op.status === 'perdido').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mensal" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="mensal">Volume Mensal</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="trocas">Matriz de Trocas</TabsTrigger>
          <TabsTrigger value="taxas">Taxas de Conversão</TabsTrigger>
        </TabsList>
        
        {/* Volume Mensal Tab */}
        <TabsContent value="mensal">
          <Card>
            <CardHeader>
              <CardTitle>Volume de Oportunidades por Mês</CardTitle>
              <CardDescription>
                Número de oportunidades registradas nos últimos 12 meses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px]">
                <ChartContainer 
                  config={{
                    total: { color: '#94a3b8' },
                    ganho: { color: '#22c55e' },
                    perdido: { color: '#ef4444' }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={oportunidadesPorMes}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent 
                            labelFormatter={(label) => `${label}`}
                          />
                        } 
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ganho" name="Ganhas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="perdido" name="Perdidas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>
                Proporção de oportunidades em cada status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={selectedPieIndex}
                      activeShape={renderActiveShape}
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={onPieLeave}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} oportunidades`, undefined]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Matriz de Trocas Tab */}
        <TabsContent value="trocas">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Trocas Entre Empresas</CardTitle>
              <CardDescription>
                Oportunidades enviadas entre empresas do grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa Origem</TableHead>
                      <TableHead>Empresa Destino</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(empresasExchanges).map(([origem, destinos]) => 
                      Object.entries(destinos).map(([destino, quantidade], index) => (
                        <TableRow key={`${origem}-${destino}`}>
                          <TableCell>
                            {index === 0 ? origem : ''}
                          </TableCell>
                          <TableCell>{destino}</TableCell>
                          <TableCell className="text-right">{quantidade}</TableCell>
                        </TableRow>
                      ))
                    )}
                    {Object.keys(empresasExchanges).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6">
                          Nenhum dado disponível
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Taxas de Conversão Tab */}
        <TabsContent value="taxas">
          <Card>
            <CardHeader>
              <CardTitle>Taxas de Conversão por Empresa</CardTitle>
              <CardDescription>
                Percentual de oportunidades ganhas vs. total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Ganhas</TableHead>
                      <TableHead className="text-right">Perdidas</TableHead>
                      <TableHead className="text-right">Taxa de Conversão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresasConversion.map((item) => (
                      <TableRow key={item.empresa}>
                        <TableCell>{item.empresa}</TableCell>
                        <TableCell className="text-right">{item.total}</TableCell>
                        <TableCell className="text-right">{item.ganho}</TableCell>
                        <TableCell className="text-right">{item.perdido}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span 
                            className={
                              item.taxa >= 70 ? "text-green-600" : 
                              item.taxa >= 40 ? "text-amber-600" : 
                              "text-red-600"
                            }
                          >
                            {item.taxa}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {empresasConversion.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          Nenhum dado disponível
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
