
// OnePager types

export interface OnePager {
  id: string;
  empresa_id: string;
  categoria_id: string;
  url_imagem?: string;
  arquivo_upload?: string;
  data_upload: string;
  nome?: string;
  url?: string;
  icp?: string;
  oferta?: string;
  diferenciais?: string;
  cases_sucesso?: string;
  big_numbers?: string;
  ponto_forte?: string;
  ponto_fraco?: string;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  nota_quadrante?: number;
}

export interface OnePagerCliente {
  id: string;
  onepager_id: string;
  cliente_id: string;
  created_at: string;
}

export interface ShareIcp {
  id: string;
  empresa_id: string;
  share_of_wallet?: number;
  icp_alinhado?: boolean;
  observacoes?: string;
}
