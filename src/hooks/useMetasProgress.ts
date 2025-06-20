
import { useMemo } from 'react';
import type { Oportunidade } from '@/types';
import type { Meta, MetaProgress } from '@/types/metas';

export const useMetasProgress = (metas: Meta[], oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    return metas.map(meta => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      // Verificar se a meta está no período atual
      const isCurrentPeriod = meta.ano === currentYear && (
        (meta.periodo === 'mensal' && meta.mes === currentMonth) ||
        (meta.periodo === 'trimestral' && meta.trimestre === currentQuarter)
      );

      // Filtrar oportunidades por período
      let filteredOps = oportunidades.filter(op => {
        const opDate = new Date(op.data_indicacao);
        const opYear = opDate.getFullYear();
        const opMonth = opDate.getMonth() + 1;
        const opQuarter = Math.ceil(opMonth / 3);

        if (meta.ano !== opYear) return false;

        if (meta.periodo === 'mensal') {
          return meta.mes === opMonth;
        } else if (meta.periodo === 'trimestral') {
          return meta.trimestre === opQuarter;
        }

        return true;
      });

      // Filtrar por segmento
      if (meta.segmento_grupo === 'intragrupo') {
        filteredOps = filteredOps.filter(op => 
          op.empresa_origem?.tipo === 'intragrupo' && 
          op.empresa_destino?.tipo === 'intragrupo'
        );
      } else if (meta.segmento_grupo === 'de_fora_para_dentro') {
        filteredOps = filteredOps.filter(op => 
          (op.empresa_origem?.tipo === 'parceiro' || op.empresa_origem?.tipo === 'cliente') &&
          op.empresa_destino?.tipo === 'intragrupo'
        );
      }

      // Filtrar por empresa específica se definida
      if (meta.empresa_id) {
        filteredOps = filteredOps.filter(op => 
          op.empresa_origem_id === meta.empresa_id || 
          op.empresa_destino_id === meta.empresa_id
        );
      }

      // Calcular realizado
      let realizado = 0;
      if (meta.tipo_meta === 'quantidade') {
        realizado = filteredOps.length;
      } else if (meta.tipo_meta === 'valor') {
        realizado = filteredOps.reduce((sum, op) => sum + (op.valor || 0), 0);
      }

      const percentual = meta.valor_meta > 0 ? (realizado / meta.valor_meta) * 100 : 0;
      
      let status: 'abaixo' | 'dentro' | 'acima' = 'abaixo';
      if (percentual >= 100) {
        status = 'acima';
      } else if (percentual >= 80) {
        status = 'dentro';
      }

      return {
        meta,
        realizado,
        percentual,
        status
      } as MetaProgress;
    });
  }, [metas, oportunidades]);
};
