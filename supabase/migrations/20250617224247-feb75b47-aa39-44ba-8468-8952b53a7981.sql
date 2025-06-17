
-- Primeiro, criar a função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela de eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  local VARCHAR(500),
  descricao TEXT,
  usuario_responsavel_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'planejado',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de contatos coletados em eventos
CREATE TABLE contatos_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome VARCHAR(255),
  email VARCHAR(255),
  telefone VARCHAR(50),
  empresa VARCHAR(255),
  cargo VARCHAR(255),
  discussao TEXT,
  proximos_passos TEXT,
  foto_cartao VARCHAR(500), -- URL da foto do cartão
  interesse_nivel INTEGER DEFAULT 3, -- 1-5 escala de interesse
  data_contato TIMESTAMPTZ DEFAULT NOW(),
  sugestao_followup TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_eventos_usuario ON eventos(usuario_responsavel_id);
CREATE INDEX idx_eventos_data ON eventos(data_inicio);
CREATE INDEX idx_contatos_evento_evento_id ON contatos_evento(evento_id);
CREATE INDEX idx_contatos_evento_data ON contatos_evento(data_contato);

-- Habilitar RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_evento ENABLE ROW LEVEL SECURITY;

-- Policies para eventos (apenas admins)
CREATE POLICY "Admin access eventos" ON eventos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.papel = 'admin'
      AND usuarios.ativo = true
    )
  );

-- Policies para contatos_evento (apenas admins)
CREATE POLICY "Admin access contatos_evento" ON contatos_evento
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id = auth.uid() 
      AND usuarios.papel = 'admin'
      AND usuarios.ativo = true
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contatos_evento_updated_at
  BEFORE UPDATE ON contatos_evento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE eventos IS 'Eventos para coleta de contatos (feiras, networking, etc)';
COMMENT ON TABLE contatos_evento IS 'Contatos coletados durante eventos';
