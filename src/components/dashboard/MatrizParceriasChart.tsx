
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const MatrizParceriasChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const matrizData = React.useMemo(() => {
    // Filtrar oportunidades que envolvem parceiros
    const parceriasOportunidades = filteredOportunidades.filter(op => 
      op.empresa_origem?.tipo === 'parceiro' || op.empresa_destino?.tipo === 'parceiro'
    );

    // Agrupar por empresa origem e destino
    const grouped = parceriasOportunidades.reduce((acc, op) => {
      const origem = op.empresa_origem?.nome || 'Origem Desconhecida';
      const destino = op.empresa_destino?.nome || 'Destino Desconhecido';
      const key = `${origem} → ${destino}`;
      
      if (!acc[key]) {
        acc[key] = {
          fluxo: key,
          origem,
          destino,
          total: 0,
          ganhas: 0,
          perdidas: 0
        };
      }
      
      acc[key].total++;
      if (op.status === 'ganho') acc[key].ganhas++;
      if (op.status === 'perdido') acc[key].perdidas++;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => b.total - a.total).slice(0, 10);
  }, [filteredOportunidades]);

  if (matrizData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma oportunidade com parceiros encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={matrizData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="fluxo" 
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => [value, name === 'total' ? 'Total' : name === 'ganhas' ? 'Ganhas' : 'Perdidas']}
          />
          <Bar dataKey="total" fill="#8b5cf6" name="Total" />
          <Bar dataKey="ganhas" fill="#10b981" name="Ganhas" />
          <Bar dataKey="perdidas" fill="#ef4444" name="Perdidas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
