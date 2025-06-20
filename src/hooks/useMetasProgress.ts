
import { useMemo } from 'react';
import type { Oportunidade } from '@/types';
import type { Meta, MetaProgress, ResultadosFilters } from '@/types/metas';

export const useMetasProgress = (
  metas: Meta[], 
  oportunidades: Oportunidade[], 
  filters?: ResultadosFilters
) => {
  return useMemo(() => {
    return metas.map(meta => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentQuarter = Math.ceil(currentMonth / 3);

      // Filtrar oportunidades por período da meta
      let filteredOps = oportunidades.filter(op => {
        const opDate = new Date(op.data_indicacao);
        const opYear = opDate.getFullYear();
        const opMonth = opDate.getMonth() + 1;
        const opQuarter = Math.ceil(opMonth / 3);

        // Verificar período da meta
        if (meta.ano !== opYear) return false;

        if (meta.periodo === 'mensal') {
          if (meta.mes !== opMonth) return false;
        } else if (meta.periodo === 'trimestral') {
          if (meta.trimestre !== opQuarter) return false;
        }

        return true;
      });

      // Aplicar filtros de período independentes se fornecidos
      if (filters?.dataInicio || filters?.dataFim) {
        filteredOps = filteredOps.filter(op => {
          const opDate = new Date(op.data_indicacao);
          
          if (filters.dataInicio) {
            const dataInicio = new Date(filters.dataInicio);
            if (opDate < dataInicio) return false;
          }
          
          if (filters.dataFim) {
            const dataFim = new Date(filters.dataFim);
            dataFim.setHours(23, 59, 59, 999); // Incluir o dia inteiro
            if (opDate > dataFim) return false;
          }
          
          return true;
        });
      }

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

      // Filtrar por status da oportunidade conforme definido na meta
      if (meta.status_oportunidade === 'ganhas') {
        filteredOps = filteredOps.filter(op => op.status === 'ganho');
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

      // Preparar dados das oportunidades para comprobatórios
      const oportunidadesDetails = filteredOps.map(op => ({
        id: op.id,
        nome_lead: op.nome_lead,
        empresa_origem: op.empresa_origem ? { nome: op.empresa_origem.nome } : undefined,
        empresa_destino: op.empresa_destino ? { nome: op.empresa_destino.nome } : undefined,
        valor: op.valor,
        status: op.status,
        data_indicacao: op.data_indicacao
      }));

      return {
        meta,
        realizado,
        percentual,
        status,
        oportunidades: oportunidadesDetails
      } as MetaProgress;
    });
  }, [metas, oportunidades, filters]);
};
