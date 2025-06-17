
// Tipos globais do módulo Diário

// Usando tipos string em vez de enums para maior compatibilidade
export type TipoEventoAgenda = "reuniao" | "call" | "apresentacao" | "follow_up" | "outro";
export type StatusEvento = "agendado" | "realizado" | "cancelado" | "reagendado";
export type FonteIntegracao = "manual" | "google" | "outlook";
export type TipoAcaoCrm = "audio" | "video" | "texto";
export type StatusAcaoCrm = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type TipoResumo = "semanal" | "mensal" | "trimestral";
export type StatusSugestaoIA = "pendente" | "em_revisao" | "aprovada" | "rejeitada";

// Interfaces principais
export interface AgendaEvento {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: TipoEventoAgenda;
  status: StatusEvento;
  parceiro_id?: string;
  usuario_responsavel_id: string;
  fonte_integracao: FonteIntegracao;
  evento_externo_id?: string;
  metadata_integracao?: Record<string, any>;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  parceiro?: {
    id: string;
    nome: string;
    tipo: string;
  };
  usuario_responsavel?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface CrmAcao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoAcaoCrm;
  status: StatusAcaoCrm;
  parceiro_id?: string;
  usuario_responsavel_id: string;
  arquivo_audio?: string;
  arquivo_video?: string;
  conteudo_texto?: string;
  data_prevista?: string;
  data_realizada?: string;
  proximos_passos?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  parceiro?: {
    id: string;
    nome: string;
    tipo: string;
  };
  usuario_responsavel?: {
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
  tipo?: TipoAcaoCrm;
  status?: StatusAcaoCrm;
  usuarioResponsavelId?: string;
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

// Tipos para integrações externas
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

export interface OutlookEvent {
  id: string;
  subject: string;
  body?: {
    content: string;
    contentType: string;
  };
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
  }>;
}

// Tipos para contexto do Diário
export interface DiarioContextType {
  // Estados
  currentView: 'agenda' | 'crm' | 'resumo' | 'ia';
  selectedDate: Date;
  
  // Agenda
  agendaEventos: AgendaEvento[];
  loadingEventos: boolean;
  
  // CRM
  crmAcoes: CrmAcao[];
  loadingAcoes: boolean;
  
  // Resumos
  resumos: DiarioResumo[];
  loadingResumos: boolean;
  
  // IA
  iaSugestoes: IaSugestao[];
  loadingIa: boolean;
  
  // Ações
  setCurrentView: (view: 'agenda' | 'crm' | 'resumo' | 'ia') => void;
  setSelectedDate: (date: Date) => void;
  
  // Agenda actions
  createEvento: (evento: Partial<AgendaEvento>) => Promise<void>;
  updateEvento: (id: string, evento: Partial<AgendaEvento>) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
  syncOutlookCalendar: () => Promise<void>;
  
  // CRM actions
  createAcaoCrm: (acao: Partial<CrmAcao>) => Promise<void>;
  updateAcaoCrm: (id: string, acao: Partial<CrmAcao>) => Promise<void>;
  deleteAcaoCrm: (id: string) => Promise<void>;
  
  // Resumo actions
  generateResumo: (tipo: TipoResumo, inicio: string, fim: string) => Promise<void>;
  exportResumoToPdf: (resumoId: string) => Promise<void>;
  exportResumoToCsv: (resumoId: string) => Promise<void>;
  
  // IA actions
  reviewSugestao: (id: string, conteudoAprovado: string, observacoes?: string) => Promise<void>;
  approveSugestao: (id: string) => Promise<void>;
  rejectSugestao: (id: string, observacoes: string) => Promise<void>;
}
