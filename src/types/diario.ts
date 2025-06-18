
// Tipos globais do módulo Diário

// Usando tipos string em vez de enums para maior compatibilidade
export type TipoEventoAgenda = "reuniao" | "call" | "apresentacao" | "follow_up" | "outro" | "proximo_passo_crm";
export type StatusEvento = "agendado" | "realizado" | "cancelado" | "reagendado";
export type FonteIntegracao = "manual" | "crm_integration";
export type MetodoComunicacao = "whatsapp" | "ligacao" | "email" | "encontro" | "reuniao_meet";
export type StatusAcaoCrm = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type TipoResumo = "semanal" | "mensal" | "trimestral";
export type StatusSugestaoIA = "pendente" | "em_revisao" | "aprovada" | "rejeitada";

// Interfaces principais
export interface AgendaEvento {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  status: string;
  partner_id?: string;
  source: string;
  external_id?: string;
  event_type?: string;
  related_crm_action_id?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  parceiro?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

export interface CrmAcao {
  id: string;
  description: string;
  communication_method: MetodoComunicacao;
  status: StatusAcaoCrm;
  partner_id?: string;
  user_id: string;
  content: string;
  next_step_date?: string;
  next_steps?: string;
  metadata?: Record<string, any>;
  created_at: string;
  // Relações para UI
  parceiro?: {
    id: string;
    nome: string;
    tipo: string;
  };
  usuario?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface DiarioResumo {
  id: string;
  tipo: TipoResumo;
  periodo_inicio: string;
  periodo_fim: string;
  titulo: string;
  conteudo_resumo: string;
  total_eventos: number;
  total_acoes_crm: number;
  total_parceiros_envolvidos: number;
  principais_realizacoes: string[];
  proximos_passos: string[];
  arquivo_pdf?: string;
  arquivo_csv?: string;
  usuario_gerador_id: string;
  created_at: string;
  // Relações para UI
  usuario_gerador?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface IaSugestao {
  id: string;
  tipo_sugestao: string;
  titulo: string;
  conteudo_original: string;
  conteudo_sugerido: string;
  conteudo_aprovado?: string;
  justificativa_ia: string;
  status: StatusSugestaoIA;
  parceiro_id?: string;
  referencia_id?: string;
  referencia_tipo?: string;
  usuario_revisor_id?: string;
  data_revisao?: string;
  observacoes_revisor?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  parceiro?: {
    id: string;
    nome: string;
    tipo: string;
  };
  usuario_revisor?: {
    id: string;
    nome: string;
    email: string;
  };
}

// Tipos para filtros e queries
export interface AgendaEventoFilter {
  dataInicio?: string;
  dataFim?: string;
  parceiroId?: string;
  tipo?: TipoEventoAgenda;
  status?: StatusEvento;
  usuarioResponsavelId?: string;
}

export interface CrmAcaoFilter {
  dataInicio?: string;
  dataFim?: string;
  parceiroId?: string;
  comunicacao?: MetodoComunicacao;
  status?: StatusAcaoCrm;
  usuarioId?: string;
}

export interface IaSugestaoFilter {
  status?: StatusSugestaoIA;
  tipoSugestao?: string;
  parceiroId?: string;
  usuarioRevisorId?: string;
}

// Tipos para estatísticas do dashboard
export interface DiarioStats {
  totalEventosHoje: number;
  totalEventosSemana: number;
  totalAcoesPendentes: number;
  totalSugestoesPendentes: number;
  eventosProximaSemana: number;
  parceirosAtivos: number;
}
