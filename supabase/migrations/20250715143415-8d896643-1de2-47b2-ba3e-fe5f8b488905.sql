
-- Criar tabela para armazenar campos customizados do feedback VTEX
CREATE TABLE vtex_feedback_campos_customizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('texto', 'email', 'telefone', 'selecao', 'texto_longo', 'data', 'boolean')),
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  label VARCHAR(200) NOT NULL,
  descricao TEXT,
  opcoes JSONB, -- Para campos de seleção
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para armazenar feedbacks das oportunidades VTEX
CREATE TABLE vtex_feedback_oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  data_feedback TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Dados do lead (campos obrigatórios VTEX)
  empresa_lead TEXT NOT NULL,
  nome_lead TEXT NOT NULL,
  sobrenome_lead TEXT NOT NULL,
  email_lead TEXT NOT NULL,
  telefone_lead TEXT NOT NULL,
  -- Andamento da oportunidade
  conseguiu_contato BOOLEAN NOT NULL,
  contexto_breve TEXT NOT NULL,
  -- Campos customizados
  campos_customizados JSONB DEFAULT '{}',
  -- Controle
  usuario_responsavel_id UUID REFERENCES usuarios(id),
  status VARCHAR(20) NOT NULL DEFAULT 'enviado' CHECK (status IN ('rascunho', 'enviado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_vtex_feedback_oportunidade_id ON vtex_feedback_oportunidades(oportunidade_id);
CREATE INDEX idx_vtex_feedback_data_feedback ON vtex_feedback_oportunidades(data_feedback);
CREATE INDEX idx_vtex_feedback_usuario_responsavel ON vtex_feedback_oportunidades(usuario_responsavel_id);
CREATE INDEX idx_vtex_feedback_status ON vtex_feedback_oportunidades(status);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vtex_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vtex_feedback_campos_customizados_updated_at
  BEFORE UPDATE ON vtex_feedback_campos_customizados
  FOR EACH ROW
  EXECUTE FUNCTION update_vtex_feedback_updated_at();

CREATE TRIGGER update_vtex_feedback_oportunidades_updated_at
  BEFORE UPDATE ON vtex_feedback_oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION update_vtex_feedback_updated_at();

-- Habilitar RLS
ALTER TABLE vtex_feedback_campos_customizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE vtex_feedback_oportunidades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para campos customizados
CREATE POLICY "Admin pode gerenciar campos customizados VTEX" ON vtex_feedback_campos_customizados
  FOR ALL USING (is_admin());

CREATE POLICY "Usuários podem visualizar campos customizados VTEX" ON vtex_feedback_campos_customizados
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas RLS para feedbacks
CREATE POLICY "Usuários podem gerenciar feedbacks VTEX de suas oportunidades" ON vtex_feedback_oportunidades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM oportunidades o 
      WHERE o.id = oportunidade_id 
      AND (o.usuario_envio_id = auth.uid() OR o.usuario_recebe_id = auth.uid())
    ) OR is_admin()
  );

-- Inserir campos padrão obrigatórios da VTEX
INSERT INTO vtex_feedback_campos_customizados (nome, tipo, obrigatorio, label, descricao, ordem) VALUES
('observacoes_adicionais', 'texto_longo', false, 'Observações Adicionais', 'Informações complementares sobre o lead ou oportunidade', 1),
('data_proximo_contato', 'data', false, 'Data do Próximo Contato', 'Quando planeja entrar em contato novamente', 2),
('nivel_interesse', 'selecao', false, 'Nível de Interesse', 'Avalie o nível de interesse do lead', 3),
('canal_preferencia', 'selecao', false, 'Canal de Preferência', 'Qual canal o lead prefere para comunicação', 4);

-- Inserir opções para campos de seleção
UPDATE vtex_feedback_campos_customizados 
SET opcoes = '["Alto", "Médio", "Baixo", "Não identificado"]'::jsonb
WHERE nome = 'nivel_interesse';

UPDATE vtex_feedback_campos_customizados 
SET opcoes = '["Email", "Telefone", "WhatsApp", "LinkedIn"]'::jsonb
WHERE nome = 'canal_preferencia';
