
export interface Evento {
  id: string;
  nome: string;
  data_inicio: string;
  data_fim?: string;
  local?: string;
  descricao?: string;
  usuario_responsavel_id: string;
  status: 'planejado' | 'em_andamento' | 'finalizado' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface ContatoEvento {
  id: string;
  evento_id: string;
  nome?: string;
  email?: string;
  telefone?: string;
  empresa?: string;
  cargo?: string;
  discussao?: string;
  proximos_passos?: string;
  foto_cartao?: string;
  interesse_nivel: number;
  data_contato: string;
  sugestao_followup?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoWithContatos extends Evento {
  contatos: ContatoEvento[];
  total_contatos: number;
}
