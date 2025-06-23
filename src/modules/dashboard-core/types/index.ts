
export interface FilterState {
  apenasEmpresasGrupo: boolean;
  tipoRelacao: 'todos' | 'intra' | 'extra';
  dataInicio?: string;
  dataFim?: string;
  empresaOrigemId?: string;
  empresaDestinoId?: string;
  status?: string;
  usuarioId?: string;
  searchTerm?: string;
  valorStatus?: "all" | "com_valor" | "sem_valor";
}

export interface DrillDownData {
  status: string;
  oportunidades: Array<{
    id: string;
    nome_lead: string;
    empresa_origem?: { nome: string; tipo: string };
    valor?: number;
    data_indicacao: string;
    data_fechamento?: string;
    tipo_relacao?: 'intra' | 'extra';
  }>;
}
