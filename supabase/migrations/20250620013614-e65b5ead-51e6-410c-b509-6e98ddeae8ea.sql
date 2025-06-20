
-- Criar tabela para metas de oportunidades
CREATE TABLE metas_oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  tipo_meta varchar(20) CHECK (tipo_meta IN ('quantidade', 'valor')),
  valor_meta numeric NOT NULL,
  periodo varchar(20) CHECK (periodo IN ('mensal', 'trimestral')),
  ano integer NOT NULL,
  mes integer, -- para metas mensais (1-12)
  trimestre integer, -- para metas trimestrais (1-4)
  segmento_grupo varchar(50) CHECK (segmento_grupo IN ('intragrupo', 'de_fora_para_dentro', 'tudo')),
  empresa_id uuid REFERENCES empresas(id), -- opcional, para metas específicas por empresa
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  usuario_criador_id uuid REFERENCES usuarios(id)
);

-- Criar índices para otimização
CREATE INDEX idx_metas_periodo ON metas_oportunidades(ano, mes, trimestre);
CREATE INDEX idx_metas_segmento ON metas_oportunidades(segmento_grupo);
CREATE INDEX idx_metas_ativo ON metas_oportunidades(ativo);

-- Habilitar RLS
ALTER TABLE metas_oportunidades ENABLE ROW LEVEL SECURITY;

-- Política para visualizar metas (usuários ativos)
CREATE POLICY "Usuários podem visualizar metas" ON metas_oportunidades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true
    )
  );

-- Política para criar metas (usuários ativos)
CREATE POLICY "Usuários podem criar metas" ON metas_oportunidades
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_criador_id AND
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND ativo = true
    )
  );

-- Política para atualizar metas (criador ou admin)
CREATE POLICY "Usuários podem atualizar suas metas" ON metas_oportunidades
  FOR UPDATE USING (
    auth.uid() = usuario_criador_id OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND papel = 'admin'
      AND ativo = true
    )
  );

-- Política para deletar metas (criador ou admin)
CREATE POLICY "Usuários podem deletar suas metas" ON metas_oportunidades
  FOR DELETE USING (
    auth.uid() = usuario_criador_id OR
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND papel = 'admin'
      AND ativo = true
    )
  );
