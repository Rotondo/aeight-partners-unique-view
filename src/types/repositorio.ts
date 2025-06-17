
// Repositorio types

export interface RepositorioMaterial {
  id: string;
  empresa_id: string;
  categoria_id: string;
  nome: string;
  tipo_arquivo: string;
  tag_categoria: string[];
  url_arquivo?: string;
  arquivo_upload?: string;
  validade_contrato?: string;
  data_upload: string;
  usuario_upload: string;
  status?: string;
}

export interface RepositorioTag {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
}
