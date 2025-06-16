/**
 * Tipos globais para o Módulo Diário
 *
 * Estrutura de tipos para eventos, ações CRM, resumos e sugestões IA.
 * Todos os campos relevantes para exportação (PDF/CSV) estão presentes.
 * Relacionamentos explícitos (partnerId, userId, etc) - garantir FKs no banco.
 */

/**
 * Enum para tipos de eventos da agenda
 */
export enum AgendaEventType {
  MEETING = 'MEETING',
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  TASK = 'TASK',
  OTHER = 'OTHER',
}

/**
 * Enum para ações de CRM
 */
export enum CrmActionType {
  CONTACT = 'CONTACT',
  UPDATE = 'UPDATE',
  FOLLOWUP = 'FOLLOWUP',
  NOTE = 'NOTE',
  OTHER = 'OTHER',
}

/**
 * Enum para status de eventos/ações
 */
export enum DiarioStatus {
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

/**
 * Interface para Evento da Agenda
 * @export
 */
export interface AgendaEvent {
  /** UUID do evento */
  id: string;
  /** UUID do parceiro relacionado */
  partnerId: string;
  /** UUID do usuário responsável */
  userId: string;
  /** Tipo do evento */
  type: AgendaEventType;
  /** Título */
  titulo: string;
  /** Descrição */
  descricao?: string;
  /** Data/hora de início (ISO) */
  dataInicio: string;
  /** Data/hora de fim (ISO) */
  dataFim: string;
  /** Status do evento */
  status: DiarioStatus;
  /** Local ou link */
  local?: string;
  /** Fonte de integração externa, se aplicável */
  integrationSource?: 'OUTLOOK' | 'GOOGLE' | 'MANUAL';
  /** ID externo (caso sincronizado) */
  externalId?: string;
  /** Criado em */
  createdAt: string;
  /** Atualizado em */
  updatedAt: string;
}

/**
 * Interface para Ação CRM
 * @export
 */
export interface CrmAction {
  /** UUID da ação */
  id: string;
  /** UUID do parceiro relacionado */
  partnerId: string;
  /** UUID do usuário */
  userId: string;
  /** Tipo da ação */
  type: CrmActionType;
  /** Título */
  titulo: string;
  /** Detalhes/descrição */
  descricao?: string;
  /** Data/hora da ação (ISO) */
  data: string;
  /** Status da ação */
  status: DiarioStatus;
  /** Criado em */
  createdAt: string;
  /** Atualizado em */
  updatedAt: string;
}

/**
 * Interface para Resumo Diário (gerado por IA)
 * @export
 */
export interface DiarioResumo {
  /** UUID do resumo */
  id: string;
  /** UUID do parceiro relacionado */
  partnerId: string;
  /** Lista de eventoIds (opcional) */
  eventosIds?: string[];
  /** Texto do resumo */
  texto: string;
  /** Score/relevância (0-1) opcional */
  relevancia?: number;
  /** Tags sugeridas para categorização */
  tags?: string[];
  /** UUID do usuário */
  userId: string;
  /** Criado em */
  createdAt: string;
}

/**
 * Interface para sugestão de IA
 * @export
 */
export interface IaSuggestion {
  /** UUID da sugestão */
  id: string;
  /** UUID do parceiro relacionado */
  partnerId: string;
  /** Texto da sugestão */
  texto: string;
  /** Tipo de sugestão: followup, alerta, insight */
  tipo: 'FOLLOWUP' | 'ALERT' | 'INSIGHT' | 'OUTRO';
  /** Score de confiança (0-1) */
  score?: number;
  /** UUID do usuário */
  userId: string;
  /** Evento ou ação relacionada (opcional) */
  referenciaId?: string;
  /** Criado em */
  createdAt: string;
}

/**
 * Interface global para exportação (PDF/CSV)
 * @export
 */
export interface DiarioExportLine {
  /** Pode ser evento ou ação - tipo genérico */
  id: string;
  partnerId: string;
  partnerNome?: string;
  userId: string;
  userNome?: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  dataInicio?: string;
  dataFim?: string;
  data?: string;
  status: DiarioStatus;
  local?: string;
  integrationSource?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Interface para Partner (parceiro)
 * @export
 */
export interface Partner {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  segmento?: string;
  cnpj?: string;
}

/**
 * Interface para User (usuário)
 * @export
 */
export interface User {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Interface para contexto global do Diário
 * (usada no hook/useDiario e no Provider)
 */
export interface DiarioContextValue {
  eventos: AgendaEvent[];
  crmAcoes: CrmAction[];
  resumos: DiarioResumo[];
  sugestoesIa: IaSuggestion[];
  partners: Partner[];
  users: User[];
  loading: boolean;
  error: string | null;
  criarEvento: (evento: Partial<AgendaEvent>) => Promise<void>;
  atualizarEvento: (id: string, evento: Partial<AgendaEvent>) => Promise<void>;
  removerEvento: (id: string) => Promise<void>;
  criarAcaoCrm: (acao: Partial<CrmAction>) => Promise<void>;
  atualizarAcaoCrm: (id: string, acao: Partial<CrmAction>) => Promise<void>;
  removerAcaoCrm: (id: string) => Promise<void>;
  gerarResumo: (partnerId: string) => Promise<void>;
  gerarSugestaoIa: (partnerId: string) => Promise<void>;
  refetch: () => Promise<void>;
}