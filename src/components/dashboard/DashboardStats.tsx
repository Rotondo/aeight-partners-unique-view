import React from 'react';
import { AreaChart, Zap } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { DashboardStats as DashboardStatsType } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  loading: boolean;
}

// Função para normalizar o status (ignora maiúsculas, minúsculas e acentos)
function normalizeStatus(status: string | undefined): string {
  return (status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Função para identificar se o status é considerado "ganho"
function isGanho(status: string | undefined): boolean {
  const s = normalizeStatus(status);
  return s === 'ganho' || s === 'ganha';
}

// Função para identificar se o status é considerado "perdido"
function isPerdido(status: string | undefined): boolean {
  const s = normalizeStatus(status);
  return s === 'perdido' || s === 'perdida';
}

// Função para identificar se o status é considerado "em andamento"
function isEmAndamento(status: string | undefined): boolean {
  const s = normalizeStatus(status);
  return (
    s === 'em_contato' ||
    s === 'negociando' ||
    s === 'em andamento' ||
    s === 'em-andamento'
  );
}

function getStatsFromOportunidades(oportunidades: any[] = []) {
  let totalOportunidades = 0;
  let oportunidadesGanhas = 0;
  let oportunidadesPerdidas = 0;
  let oportunidadesEmAndamento = 0;

  for (const op of oportunidades) {
    totalOportunidades++;
    if (isGanho(op.status)) {
      oportunidadesGanhas++;
    } else if (isPerdido(op.status)) {
      oportunidadesPerdidas++;
    } else if (isEmAndamento(op.status)) {
      oportunidadesEmAndamento++;
    }
  }

  return {
    totalOportunidades,
    oportunidadesGanhas,
    oportunidadesPerdidas,
    oportunidadesEmAndamento,
  };
}

// Verifica se stats já vêm prontos ou são oportunidades brutas
function resolveStats(stats: DashboardStatsType | any): {
  totalOportunidades: number;
  oportunidadesGanhas: number;
  oportunidadesPerdidas: number;
  oportunidadesEmAndamento: number;
} {
  if (!stats) {
    return {
      totalOportunidades: 0,
      oportunidadesGanhas: 0,
      oportunidadesPerdidas: 0,
      oportunidadesEmAndamento: 0,
    };
  }
  // Se stats já vêm prontos (números), retorna diretamente
  if (
    typeof stats.totalOportunidades === 'number' &&
    typeof stats.oportunidadesGanhas === 'number' &&
    typeof stats.oportunidadesPerdidas === 'number' &&
    typeof stats.oportunidadesEmAndamento === 'number'
  ) {
    return stats;
  }
  // Se stats é array de oportunidades, computa os stats
  if (Array.isArray(stats)) {
    return getStatsFromOportunidades(stats);
  }
  // Se stats for objeto estranho, tenta usar campos ou retorna 0s
  return {
    totalOportunidades: Number(stats.totalOportunidades) || 0,
    oportunidadesGanhas: Number(stats.oportunidadesGanhas) || 0,
    oportunidadesPerdidas: Number(stats.oportunidadesPerdidas) || 0,
    oportunidadesEmAndamento: Number(stats.oportunidadesEmAndamento) || 0,
  };
}

export const DashboardStatsSection: React.FC<DashboardStatsProps> = ({
  stats,
  loading,
}) => {
  const {
    totalOportunidades,
    oportunidadesGanhas,
    oportunidadesPerdidas,
    oportunidadesEmAndamento,
  } = resolveStats(stats);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total de Oportunidades"
        value={loading ? '...' : totalOportunidades}
        icon={<Zap className="h-4 w-4 text-primary" />}
        color="bg-primary/10"
        description="Total de indicações registradas"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Oportunidades Ganhas"
        value={loading ? '...' : oportunidadesGanhas}
        icon={<AreaChart className="h-4 w-4 text-green-500" />}
        color="bg-green-500/10"
        description="Negócios fechados com sucesso"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Oportunidades Perdidas"
        value={loading ? '...' : oportunidadesPerdidas}
        icon={<AreaChart className="h-4 w-4 text-destructive" />}
        color="bg-destructive/10"
        description="Negócios perdidos ou cancelados"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Em Andamento"
        value={loading ? '...' : oportunidadesEmAndamento}
        icon={<AreaChart className="h-4 w-4 text-amber-500" />}
        color="bg-amber-500/10"
        description="Oportunidades em negociação"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
    </div>
  );
};
