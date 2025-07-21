
import { EmpresaTipoString } from './common';

// Empresa types

export interface Empresa {
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
  descricao?: string;
  logo_url?: string;
  status: boolean;
  created_at?: string;
  // New field for owner partner information
  parceiro_proprietario?: {
    id: string;
    nome: string;
    tipo: EmpresaTipoString;
  };
}

export interface EmpresaCategoria {
  empresa_id: string;
  categoria_id: string;
}

export interface Contato {
  id?: string;
  empresa_id?: string;
  nome?: string;
  telefone?: string;
  email?: string;
}
