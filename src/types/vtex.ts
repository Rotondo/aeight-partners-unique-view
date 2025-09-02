
export interface VtexFeedbackCampoCustomizado {
  id: string;
  nome: string;
  tipo: 'texto' | 'email' | 'telefone' | 'selecao' | 'texto_longo' | 'data' | 'boolean';
  obrigatorio: boolean;
  label: string;
  descricao?: string | null;
  opcoes?: string[] | null;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface VtexFeedbackOportunidade {
  id: string;
  oportunidade_id: string;
  data_feedback: string;
  empresa_lead: string;
  nome_lead: string;
  sobrenome_lead: string;
  email_lead: string;
  telefone_lead: string;
  conseguiu_contato: boolean;
  contexto_breve: string;
  campos_customizados: Record<string, unknown>;
  usuario_responsavel_id?: string | null;
  status: 'rascunho' | 'enviado';
  created_at: string;
  updated_at: string;
}

export interface VtexFeedbackFormData {
  empresa_lead: string;
  nome_lead: string;
  sobrenome_lead: string;
  email_lead: string;
  telefone_lead: string;
  conseguiu_contato: boolean;
  contexto_breve: string;
  campos_customizados: Record<string, unknown>;
}
