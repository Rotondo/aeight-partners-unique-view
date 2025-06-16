// Tipos globais do módulo Diário

export type UUID = string;

export interface DiarioEvent {
  id: UUID;
  title: string;
  description?: string;
  start: string; // ISO date
  end: string;   // ISO date
  partnerId?: UUID;
  source: "outlook" | "google" | "manual";
  externalId?: string; // id do evento em sistema externo
  status: "scheduled" | "synced" | "completed" | "canceled";
  createdAt: string;
  updatedAt: string;
}

export interface CrmAction {
  id: UUID;
  type: "audio" | "video" | "text";
  content: string;
  userId: UUID;
  partnerId?: UUID;
  createdAt: string;
  nextStepDate?: string;
  metadata?: Record<string, any>;
}

export interface DiarioResumo {
  id: UUID;
  period: "week" | "month" | "quarter";
  generatedAt: string;
  content: string;
  exportUrl?: string;
}

export interface IaSuggestion {
  id: UUID;
  targetType: "event" | "crmAction" | "resumo";
  targetId: UUID | null;
  field: string;
  suggestion: string;
  status: "pending" | "approved" | "rejected" | "edited";
  createdAt: string;
  approvedBy?: UUID;
  approvedAt?: string;
}