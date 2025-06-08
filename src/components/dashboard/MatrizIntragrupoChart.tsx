import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const MatrizIntragrupoChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const matrizData = React.useMemo(() => {
    // Filtrar apenas oportunidades intragrupo
    const intragrupoOportunidades = filteredOportunidades.filter(op =>
      op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'
    );

    // Agrupar por empresa origem e destino
    const grouped = intragrupoOportunidades.reduce((acc, op) => {
      const origem = op.empresa_origem?.nome || 'Origem Desconhecida';
      const destino = op.empresa_destino?.nome || 'Destino Desconhecida';
      const key = `${origem} → ${destino}`;

      if (!acc[key]) {
        acc[key] = {
          fluxo: key,
          origem,
          destino,
          total: 0,
          ganhas: 0,
          perdidas: 0,
          em_andamento: 0,
        };
      }

      acc[key].total++;
      if (op.status === 'ganho') acc[key].ganhas++;
      else if (op.status === 'perdido') acc[key].perdidas++;
      else acc[key].em_andamento++;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .filter((item: any) => item.total > 0)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10);
  }, [filteredOportunidades]);

  if (matrizData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma oportunidade intragrupo encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={matrizData}
          layout="horizontal"
          margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="fluxo"
            width={80}
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === 'total'
                ? 'Total'
                : name === 'ganhas'
                ? 'Ganhas'
                : name === 'perdidas'
                ? 'Perdidas'
                : 'Em Andamento',
            ]}
          />
          <Legend />
          <Bar dataKey="ganhas" fill="#10b981" name="Ganhas" stackId="stack" />
          <Bar dataKey="em_andamento" fill="#f59e0b" name="Em Andamento" stackId="stack" />
          <Bar dataKey="perdidas" fill="#ef4444" name="Perdidas" stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
      {/* Legenda visual com style correto */}
      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
        <span
          className="inline-block align-middle"
          style={{
            width: 18,
            height: 12,
            backgroundColor: '#e0f2fe',
            border: '1px solid #cbd5e1',
          }}
        />
        Menos indicações
        <span
          className="inline-block align-middle"
          style={{
            width: 18,
            height: 12,
            backgroundColor: '#2563eb',
            border: '1px solid #1e40af',
          }}
        />
        Mais indicações
      </div>
    </div>
  );
};
