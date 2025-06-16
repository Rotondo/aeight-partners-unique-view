// Tipos gerados pelo Supabase CLI (exemplo mínimo, expanda conforme seu banco)
export type Agenda = {
  id: string;
  titulo: string;
  descricao: string | null;
  data: string;
  usuario_id: string;
  criado_em: string;
  atualizado_em: string | null;
};

export type CrmRegistro = {
  id: string;
  tipo: string;
  descricao: string;
  usuario_id: string;
  data: string;
  criado_em: string;
  atualizado_em: string | null;
};

export type Resumo = {
  id: string;
  usuario_id: string;
  periodo: string;
  conteudo: string;
  criado_em: string;
};

export type IaMessage = {
  id: string;
  usuario_id: string;
  conteudo: string;
  tipo: string;
  criado_em: string;
};

export interface Database {
  public: {
    Tables: {
      agenda: { Row: Agenda; Insert: Omit<Agenda, 'id' | 'criado_em' | 'atualizado_em'>; Update: Partial<Agenda> };
      crm_registros: { Row: CrmRegistro; Insert: Omit<CrmRegistro, 'id' | 'criado_em' | 'atualizado_em'>; Update: Partial<CrmRegistro> };
      resumos: { Row: Resumo; Insert: Omit<Resumo, 'id' | 'criado_em'>; Update: Partial<Resumo> };
      ia_messages: { Row: IaMessage; Insert: Omit<IaMessage, 'id' | 'criado_em'>; Update: Partial<IaMessage> };
    };
    Views: {};
    Functions: {};
    Enums: {};
  }
}