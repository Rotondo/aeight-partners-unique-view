
-- Criar tabela para armazenar links dos parceiros
CREATE TABLE public.repositorio_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id),
  categoria_id UUID NOT NULL REFERENCES public.categorias(id),
  nome VARCHAR NOT NULL,
  url TEXT NOT NULL,
  descricao TEXT,
  tag_categoria TEXT[] DEFAULT NULL,
  data_upload TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
  usuario_upload UUID NOT NULL,
  status VARCHAR DEFAULT 'ativo'
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_repositorio_links_empresa_id ON public.repositorio_links(empresa_id);
CREATE INDEX idx_repositorio_links_categoria_id ON public.repositorio_links(categoria_id);
CREATE INDEX idx_repositorio_links_status ON public.repositorio_links(status);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.repositorio_links IS 'Links de materiais e conteúdos dos parceiros';
COMMENT ON COLUMN public.repositorio_links.nome IS 'Nome descritivo do link/material';
COMMENT ON COLUMN public.repositorio_links.url IS 'URL do material/conteúdo do parceiro';
COMMENT ON COLUMN public.repositorio_links.descricao IS 'Descrição opcional do conteúdo';
