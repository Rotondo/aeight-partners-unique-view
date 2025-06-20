
import { useMemo } from 'react';
import type { Oportunidade } from '@/types';
import type { ResultadosPorGrupo, ResultadosPorEmpresa } from '@/types/metas';

export const useResultadosStats = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    const calculateResultadosPorGrupo = (): ResultadosPorGrupo[] => {
      const grupos = ['intragrupo', 'de_fora_para_dentro', 'tudo'];
      
      return grupos.map(segmento => {
        let filteredOps = oportunidades;
        
        if (segmento === 'intragrupo') {
          filteredOps = oportunidades.filter(op => 
            op.empresa_origem?.tipo === 'intragrupo' && 
            op.empresa_destino?.tipo === 'intragrupo'
          );
        } else if (segmento === 'de_fora_para_dentro') {
          filteredOps = oportunidades.filter(op => 
            (op.empresa_origem?.tipo === 'parceiro' || op.empresa_origem?.tipo === 'cliente') &&
            op.empresa_destino?.tipo === 'intragrupo'
          );
        }

        const quantidade_total = filteredOps.length;
        const quantidade_ganho = filteredOps.filter(op => op.status === 'ganho').length;
        const quantidade_perdido = filteredOps.filter(op => op.status === 'perdido').length;
        const quantidade_andamento = filteredOps.filter(op => 
          op.status === 'em_contato' || op.status === 'negociando'
        ).length;

        const valor_total = filteredOps.reduce((sum, op) => sum + (op.valor || 0), 0);
        const valor_ganho = filteredOps
          .filter(op => op.status === 'ganho')
          .reduce((sum, op) => sum + (op.valor || 0), 0);
        const valor_perdido = filteredOps
          .filter(op => op.status === 'perdido')
          .reduce((sum, op) => sum + (op.valor || 0), 0);
        const valor_andamento = filteredOps
          .filter(op => op.status === 'em_contato' || op.status === 'negociando')
          .reduce((sum, op) => sum + (op.valor || 0), 0);

        const taxa_conversao = quantidade_total > 0 ? (quantidade_ganho / quantidade_total) * 100 : 0;
        const ticket_medio = quantidade_total > 0 ? valor_total / quantidade_total : 0;

        return {
          segmento,
          quantidade_total,
          quantidade_ganho,
          quantidade_perdido,
          quantidade_andamento,
          valor_total,
          valor_ganho,
          valor_perdido,
          valor_andamento,
          taxa_conversao,
          ticket_medio
        };
      });
    };

    const calculateResultadosPorEmpresa = (): ResultadosPorEmpresa[] => {
      const empresaMap = new Map<string, ResultadosPorEmpresa>();

      oportunidades.forEach(op => {
        [op.empresa_origem, op.empresa_destino].forEach(empresa => {
          if (!empresa) return;

          const key = empresa.id;
          const existing = empresaMap.get(key) || {
            empresa_id: empresa.id,
            empresa_nome: empresa.nome,
            empresa_tipo: empresa.tipo,
            quantidade_total: 0,
            valor_total: 0,
            taxa_conversao: 0,
            ticket_medio: 0
          };

          existing.quantidade_total += 1;
          existing.valor_total += op.valor || 0;
          
          empresaMap.set(key, existing);
        });
      });

      return Array.from(empresaMap.values()).map(empresa => {
        const empresaOps = oportunidades.filter(op => 
          op.empresa_origem_id === empresa.empresa_id || 
          op.empresa_destino_id === empresa.empresa_id
        );
        
        const ganhos = empresaOps.filter(op => op.status === 'ganho').length;
        empresa.taxa_conversao = empresa.quantidade_total > 0 ? (ganhos / empresa.quantidade_total) * 100 : 0;
        empresa.ticket_medio = empresa.quantidade_total > 0 ? empresa.valor_total / empresa.quantidade_total : 0;
        
        return empresa;
      }).sort((a, b) => b.valor_total - a.valor_total);
    };

    return {
      resultadosPorGrupo: calculateResultadosPorGrupo(),
      resultadosPorEmpresa: calculateResultadosPorEmpresa()
    };
  }, [oportunidades]);
};
