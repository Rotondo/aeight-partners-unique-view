
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const BalancoGrupoParceriasChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const balancoData = React.useMemo(() => {
    let grupoParaParceiros = 0;
    let parceirosParaGrupo = 0;
    let intragrupo = 0;
    let extragrupo = 0;

    filteredOportunidades.forEach(op => {
      const origem = op.empresa_origem?.tipo;
      const destino = op.empresa_destino?.tipo;

      if (origem === 'intragrupo' && destino === 'parceiro') {
        grupoParaParceiros++;
      } else if (origem === 'parceiro' && destino === 'intragrupo') {
        parceirosParaGrupo++;
      } else if (origem === 'intragrupo' && destino === 'intragrupo') {
        intragrupo++;
      } else {
        extragrupo++;
      }
    });

    return [
      {
        categoria: 'Fluxos',
        'Grupo → Parceiros': grupoParaParceiros,
        'Parceiros → Grupo': parceirosParaGrupo,
        'Intragrupo': intragrupo,
        'Outros': extragrupo
      }
    ];
  }, [filteredOportunidades]);

  if (balancoData[0] && Object.values(balancoData[0]).every(value => typeof value === 'string' || value === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={balancoData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="categoria" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Grupo → Parceiros" fill="#3b82f6" name="Grupo → Parceiros" />
          <Bar dataKey="Parceiros → Grupo" fill="#10b981" name="Parceiros → Grupo" />
          <Bar dataKey="Intragrupo" fill="#8b5cf6" name="Intragrupo" />
          <Bar dataKey="Outros" fill="#f59e0b" name="Outros" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
