import { Empresa } from './empresa';
import { EtapaJornada, SubnivelEtapa } from './mapa-parceiros';

// Representa um fornecedor que foi mapeado para um cliente numa etapa específica.
export interface MapeamentoFornecedor {
  id: string;
  cliente_id: string;
  etapa_id: string;
  subnivel_id?: string | null;
  empresa_fornecedora_id: string;
  observacoes?: string | null;
  ativo: boolean;
  // Incluímos os dados completos da empresa fornecedora para ter acesso ao nome e tipo.
  empresa_fornecedora: Empresa;
}

// Estrutura que o nosso código vai usar para agrupar os fornecedores
// debaixo de cada etapa e subnível, pronta para ser desenhada no diagrama.
export interface MapeamentoAgrupado {
  etapa: EtapaJornada;
  subniveis: {
    subnivel: SubnivelEtapa;
    fornecedores: MapeamentoFornecedor[];
  }[];
  fornecedoresSemSubnivel: MapeamentoFornecedor[];
}