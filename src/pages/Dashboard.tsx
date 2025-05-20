import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { AreaChart, Brain, Building2, FileText, PieChart, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch total opportunities
        const { data: oportunidades, error: opError } = await (supabase as any)
          .from('oportunidades')
          .select('id, status, data_indicacao');

        if (opError) throw opError;

        // Calculate stats
        const totalOportunidades = oportunidades ? oportunidades.length : 0;
        const oportunidadesGanhas = oportunidades ? oportunidades.filter(op => op.status === 'ganho').length : 0;
        const oportunidadesPerdidas = oportunidades ? oportunidades.filter(op => op.status === 'perdido').length : 0;
        const oportunidadesEmAndamento = totalOportunidades - oportunidadesGanhas - oportunidadesPerdidas;
        
        // Calculate opportunities per month
        const oportunidadesPorMes: Record<string, number> = {};
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        // Initialize with last 6 months
        for (let i = 0; i < 6; i++) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
          const monthName = month.toLocaleString('pt-BR', { month: 'short' });
          oportunidadesPorMes[monthKey] = 0;
        }
        
        // Count opportunities per month
        if (oportunidades) {
          oportunidades.forEach(op => {
            if (op.data_indicacao) {
              const date = new Date(op.data_indicacao);
              if (date >= sixMonthsAgo) {
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                oportunidadesPorMes[monthKey] = (oportunidadesPorMes[monthKey] || 0) + 1;
              }
            }
          });
        }
        
        // Format for chart
        const oportunidadesPorMesArray = Object.entries(oportunidadesPorMes)
          .map(([key, value]) => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            return {
              mes: `${monthName}/${year.substring(2)}`,
              quantidade: value
            };
          })
          .sort((a, b) => {
            // Extract year and month for proper sorting
            const [aMonth, aYear] = a.mes.split('/');
            const [bMonth, bYear] = b.mes.split('/');
            
            // Compare years first
            if (aYear !== bYear) return aYear.localeCompare(bYear);
            
            // If years are the same, compare months
            // Convert month names to numbers for comparison
            const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            return months.indexOf(aMonth) - months.indexOf(bMonth);
          });
        
        setStats({
          totalOportunidades,
          oportunidadesGanhas,
          oportunidadesPerdidas,
          oportunidadesEmAndamento,
          oportunidadesPorMes: oportunidadesPorMesArray
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const DashboardCard = ({ title, value, icon, description, color }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    description?: string;
    color?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color || 'bg-primary/10'}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard 
          title="Total de Oportunidades" 
          value={loading ? "..." : stats?.totalOportunidades || 0} 
          icon={<Zap className="h-4 w-4 text-primary" />} 
          color="bg-primary/10"
          description="Total de indicações registradas" 
        />
        <DashboardCard 
          title="Oportunidades Ganhas" 
          value={loading ? "..." : stats?.oportunidadesGanhas || 0} 
          icon={<AreaChart className="h-4 w-4 text-green-500" />} 
          color="bg-green-500/10"
          description="Negócios fechados com sucesso" 
        />
        <DashboardCard 
          title="Oportunidades Perdidas" 
          value={loading ? "..." : stats?.oportunidadesPerdidas || 0} 
          icon={<AreaChart className="h-4 w-4 text-destructive" />} 
          color="bg-destructive/10"
          description="Negócios perdidos ou cancelados" 
        />
        <DashboardCard 
          title="Em Andamento" 
          value={loading ? "..." : stats?.oportunidadesEmAndamento || 0} 
          icon={<AreaChart className="h-4 w-4 text-amber-500" />} 
          color="bg-amber-500/10"
          description="Oportunidades em negociação" 
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart - 4/7 width on large screens */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Oportunidades por Mês</CardTitle>
            <CardDescription>
              Indicações registradas nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats?.oportunidadesPorMes || []}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantidade" fill="hsl(var(--primary))" name="Oportunidades" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Access - 3/7 width on large screens */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>
              Principais funcionalidades da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                href="/onepager"
                icon={<FileText className="h-5 w-5" />}
                label="OnePager"
                description="Documentos dos parceiros"
              />
              <Button
                href="/oportunidades"
                icon={<Zap className="h-5 w-5" />}
                label="Oportunidades"
                description="Gestão de indicações"
              />
              <Button
                href="/quadrante"
                icon={<PieChart className="h-5 w-5" />}
                label="Quadrante"
                description="Análise estratégica"
              />
              <Button
                href="/admin"
                icon={<Building2 className="h-5 w-5" />}
                label="Administração"
                description="Configurações da plataforma"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Sobre o A&eight Partnership Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none dark:prose-invert">
            <p>
              Bem-vindo à Plataforma Unificada de Parcerias A&eight, um sistema completo para gerenciar todas as relações com parceiros do seu negócio.
            </p>
            <p className="text-sm text-muted-foreground">
              Esta plataforma centraliza a gestão de parceiros, oportunidades de negócio intra e extragrupo, análise estratégica e arquivos visuais em um único lugar.
              Navegue pelo menu lateral para acessar as diferentes funcionalidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const Button: React.FC<ButtonProps> = ({ href, icon, label, description }) => (
  <a 
    href={href} 
    className="flex flex-col items-center p-3 rounded-lg border border-border hover:bg-accent transition-colors text-center"
  >
    <div className="bg-primary/10 p-2 rounded-full mb-2">
      {icon}
    </div>
    <h3 className="font-medium">{label}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </a>
);

export default Dashboard;
