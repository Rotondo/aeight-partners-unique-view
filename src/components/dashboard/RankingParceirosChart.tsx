
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const RankingParceirosChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const rankingData = React.useMemo(() => {
    // Contar oportunidades por parceiro (tanto como origem quanto como destino)
    const parceirosCount = filteredOportunidades.reduce((acc, op) => {
      const origem = op.empresa_origem;
      const destino = op.empresa_destino;

      if (origem?.tipo === 'parceiro') {
        const nome = origem.nome;
        if (!acc[nome]) {
          acc[nome] = { parceiro: nome, enviadas: 0, recebidas: 0, total: 0 };
        }
        acc[nome].enviadas++;
        acc[nome].total++;
      }

      if (destino?.tipo === 'parceiro') {
        const nome = destino.nome;
        if (!acc[nome]) {
          acc[nome] = { parceiro: nome, enviadas: 0, recebidas: 0, total: 0 };
        }
        acc[nome].recebidas++;
        acc[nome].total++;
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(parceirosCount)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 10);
  }, [filteredOportunidades]);

  if (rankingData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rankingData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="parceiro" 
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="enviadas" fill="#3b82f6" name="Enviadas" />
          <Bar dataKey="recebidas" fill="#10b981" name="Recebidas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
