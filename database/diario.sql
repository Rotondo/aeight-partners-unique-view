
-- Módulo Diário - Schema PostgreSQL/Supabase
-- Criação de enums, tabelas, policies RLS, triggers e índices

-- ===== ENUMS =====

CREATE TYPE tipo_evento_agenda AS ENUM (
  'reuniao',
  'call', 
  'apresentacao',
  'follow_up',
  'outro'
);

CREATE TYPE status_evento AS ENUM (
  'agendado',
  'realizado',
  'cancelado',
  'reagendado'
);

CREATE TYPE fonte_integracao AS ENUM (
  'manual',
  'google',
  'outlook'
);

CREATE TYPE tipo_acao_crm AS ENUM (
  'audio',
  'video',
  'texto'
);

CREATE TYPE status_acao_crm AS ENUM (
  'pendente',
  'em_andamento',
  'concluida',
  'cancelada'
);

CREATE TYPE tipo_resumo AS ENUM (
  'semanal',
  'mensal',
  'trimestral'
);

CREATE TYPE status_sugestao_ia AS ENUM (
  'pendente',
  'em_revisao',
  'aprovada',
  'rejeitada'
);

-- ===== TABELAS =====

-- Tabela: diario_agenda_eventos
CREATE TABLE diario_agenda_eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo tipo_evento_agenda NOT NULL DEFAULT 'reuniao',
  status status_evento NOT NULL DEFAULT 'agendado',
  parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  usuario_responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  fonte_integracao fonte_integracao NOT NULL DEFAULT 'manual',
  evento_externo_id VARCHAR(255), -- ID do evento no sistema externo (Google/Outlook)
  metadata_integracao JSONB, -- Dados adicionais da integração
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_date_range CHECK (data_fim > data_inicio)
);

-- Tabela: diario_crm_acoes
CREATE TABLE diario_crm_acoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo tipo_acao_crm NOT NULL,
  status status_acao_crm NOT NULL DEFAULT 'pendente',
  parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  usuario_responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  arquivo_audio VARCHAR(255), -- Path do arquivo no Supabase Storage
  arquivo_video VARCHAR(255), -- Path do arquivo no Supabase Storage
  conteudo_texto TEXT,
  data_prevista TIMESTAMP WITH TIME ZONE,
  data_realizada TIMESTAMP WITH TIME ZONE,
  proximos_passos TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT tipo_conteudo_check CHECK (
    (tipo = 'audio' AND arquivo_audio IS NOT NULL) OR
    (tipo = 'video' AND arquivo_video IS NOT NULL) OR
    (tipo = 'texto' AND conteudo_texto IS NOT NULL)
  )
);

-- Tabela: diario_resumos
CREATE TABLE diario_resumos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo tipo_resumo NOT NULL,
  periodo_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  periodo_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  conteudo_resumo TEXT NOT NULL,
  total_eventos INTEGER NOT NULL DEFAULT 0,
  total_acoes_crm INTEGER NOT NULL DEFAULT 0,
  total_parceiros_envolvidos INTEGER NOT NULL DEFAULT 0,
  principais_realizacoes TEXT[] DEFAULT '{}',
  proximos_passos TEXT[] DEFAULT '{}',
  arquivo_pdf VARCHAR(255), -- Path do PDF no Supabase Storage
  arquivo_csv VARCHAR(255), -- Path do CSV no Supabase Storage
  usuario_gerador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT valid_period_range CHECK (periodo_fim > periodo_inicio)
);

-- Tabela: diario_ia_sugestoes
CREATE TABLE diario_ia_sugestoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_sugestao VARCHAR(100) NOT NULL, -- 'melhoria_texto', 'otimizacao_agenda', etc.
  titulo VARCHAR(255) NOT NULL,
  conteudo_original TEXT NOT NULL,
  conteudo_sugerido TEXT NOT NULL,
  conteudo_aprovado TEXT, -- Versão final após revisão
  justificativa_ia TEXT NOT NULL,
  status status_sugestao_ia NOT NULL DEFAULT 'pendente',
  parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  referencia_id UUID, -- ID do registro relacionado (evento, ação, etc.)
  referencia_tipo VARCHAR(50), -- Tipo do registro relacionado
  usuario_revisor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  data_revisao TIMESTAMP WITH TIME ZONE,
  observacoes_revisor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== ÍNDICES =====

-- Índices para performance
CREATE INDEX idx_diario_agenda_eventos_data_inicio ON diario_agenda_eventos (data_inicio);
CREATE INDEX idx_diario_agenda_eventos_usuario ON diario_agenda_eventos (usuario_responsavel_id);
CREATE INDEX idx_diario_agenda_eventos_parceiro ON diario_agenda_eventos (parceiro_id);
CREATE INDEX idx_diario_agenda_eventos_status ON diario_agenda_eventos (status);

CREATE INDEX idx_diario_crm_acoes_usuario ON diario_crm_acoes (usuario_responsavel_id);
CREATE INDEX idx_diario_crm_acoes_parceiro ON diario_crm_acoes (parceiro_id);
CREATE INDEX idx_diario_crm_acoes_status ON diario_crm_acoes (status);
CREATE INDEX idx_diario_crm_acoes_tipo ON diario_crm_acoes (tipo);
CREATE INDEX idx_diario_crm_acoes_data_prevista ON diario_crm_acoes (data_prevista);

CREATE INDEX idx_diario_resumos_tipo ON diario_resumos (tipo);
CREATE INDEX idx_diario_resumos_periodo ON diario_resumos (periodo_inicio, periodo_fim);
CREATE INDEX idx_diario_resumos_usuario ON diario_resumos (usuario_gerador_id);

CREATE INDEX idx_diario_ia_sugestoes_status ON diario_ia_sugestoes (status);
CREATE INDEX idx_diario_ia_sugestoes_tipo ON diario_ia_sugestoes (tipo_sugestao);
CREATE INDEX idx_diario_ia_sugestoes_parceiro ON diario_ia_sugestoes (parceiro_id);
CREATE INDEX idx_diario_ia_sugestoes_revisor ON diario_ia_sugestoes (usuario_revisor_id);

-- ===== TRIGGERS DE AUDITORIA =====

-- Trigger para updated_at em eventos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diario_agenda_eventos_updated_at
  BEFORE UPDATE ON diario_agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diario_crm_acoes_updated_at
  BEFORE UPDATE ON diario_crm_acoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diario_ia_sugestoes_updated_at
  BEFORE UPDATE ON diario_ia_sugestoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auditoria de exclusões
CREATE TABLE diario_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  acao VARCHAR(20) NOT NULL, -- 'DELETE', 'UPDATE', 'INSERT'
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION audit_diario_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO diario_audit_log (
    tabela,
    registro_id,
    acao,
    dados_anteriores,
    dados_novos,
    usuario_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Aplicar trigger de auditoria em todas as tabelas do diário
CREATE TRIGGER audit_diario_agenda_eventos
  AFTER INSERT OR UPDATE OR DELETE ON diario_agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION audit_diario_changes();

CREATE TRIGGER audit_diario_crm_acoes
  AFTER INSERT OR UPDATE OR DELETE ON diario_crm_acoes
  FOR EACH ROW EXECUTE FUNCTION audit_diario_changes();

CREATE TRIGGER audit_diario_resumos
  AFTER INSERT OR UPDATE OR DELETE ON diario_resumos
  FOR EACH ROW EXECUTE FUNCTION audit_diario_changes();

CREATE TRIGGER audit_diario_ia_sugestoes
  AFTER INSERT OR UPDATE OR DELETE ON diario_ia_sugestoes
  FOR EACH ROW EXECUTE FUNCTION audit_diario_changes();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Habilitar RLS em todas as tabelas
ALTER TABLE diario_agenda_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_crm_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_ia_sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_audit_log ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND papel = 'admin'
    AND ativo = true
  );
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Policies para agenda_eventos (apenas admins)
CREATE POLICY "Admin can view all agenda events"
  ON diario_agenda_eventos FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admin can insert agenda events"
  ON diario_agenda_eventos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can update agenda events"
  ON diario_agenda_eventos FOR UPDATE
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can delete agenda events"
  ON diario_agenda_eventos FOR DELETE
  TO authenticated
  USING (is_admin_user());

-- Policies para crm_acoes (apenas admins)
CREATE POLICY "Admin can view all crm actions"
  ON diario_crm_acoes FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admin can insert crm actions"
  ON diario_crm_acoes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can update crm actions"
  ON diario_crm_acoes FOR UPDATE
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can delete crm actions"
  ON diario_crm_acoes FOR DELETE
  TO authenticated
  USING (is_admin_user());

-- Policies para resumos (apenas admins)
CREATE POLICY "Admin can view all summaries"
  ON diario_resumos FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admin can insert summaries"
  ON diario_resumos FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can update summaries"
  ON diario_resumos FOR UPDATE
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can delete summaries"
  ON diario_resumos FOR DELETE
  TO authenticated
  USING (is_admin_user());

-- Policies para ia_sugestoes (apenas admins)
CREATE POLICY "Admin can view all ai suggestions"
  ON diario_ia_sugestoes FOR SELECT
  TO authenticated
  USING (is_admin_user());

CREATE POLICY "Admin can insert ai suggestions"
  ON diario_ia_sugestoes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can update ai suggestions"
  ON diario_ia_sugestoes FOR UPDATE
  TO authenticated
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Admin can delete ai suggestions"
  ON diario_ia_sugestoes FOR DELETE
  TO authenticated
  USING (is_admin_user());

-- Policies para audit_log (apenas admins podem visualizar)
CREATE POLICY "Admin can view audit log"
  ON diario_audit_log FOR SELECT
  TO authenticated
  USING (is_admin_user());

-- ===== COMENTÁRIOS PARA DOCUMENTAÇÃO =====

COMMENT ON TABLE diario_agenda_eventos IS 'Eventos da agenda com integração Google/Outlook';
COMMENT ON TABLE diario_crm_acoes IS 'Ações e registros do CRM com suporte a mídia';
COMMENT ON TABLE diario_resumos IS 'Resumos executivos gerados por período';
COMMENT ON TABLE diario_ia_sugestoes IS 'Sugestões da IA para aprovação/rejeição';
COMMENT ON TABLE diario_audit_log IS 'Log de auditoria para todas as operações do diário';

COMMENT ON COLUMN diario_agenda_eventos.evento_externo_id IS 'ID do evento no sistema externo (Google/Outlook)';
COMMENT ON COLUMN diario_agenda_eventos.metadata_integracao IS 'Dados JSON da integração externa';
COMMENT ON COLUMN diario_crm_acoes.arquivo_audio IS 'Path do arquivo de áudio no Supabase Storage';
COMMENT ON COLUMN diario_crm_acoes.arquivo_video IS 'Path do arquivo de vídeo no Supabase Storage';
COMMENT ON COLUMN diario_resumos.principais_realizacoes IS 'Array de strings com principais realizações';
COMMENT ON COLUMN diario_resumos.proximos_passos IS 'Array de strings com próximos passos';
COMMENT ON COLUMN diario_ia_sugestoes.referencia_id IS 'ID do registro relacionado à sugestão';
COMMENT ON COLUMN diario_ia_sugestoes.referencia_tipo IS 'Tipo do registro relacionado (evento, acao_crm, etc)';

-- ===== FUNÇÕES AUXILIARES =====

-- Função para calcular estatísticas do diário
CREATE OR REPLACE FUNCTION get_diario_stats(
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_eventos', (
      SELECT COUNT(*) FROM diario_agenda_eventos 
      WHERE data_inicio >= $1 AND data_inicio <= $2
    ),
    'total_acoes_crm', (
      SELECT COUNT(*) FROM diario_crm_acoes 
      WHERE created_at >= $1 AND created_at <= $2
    ),
    'eventos_realizados', (
      SELECT COUNT(*) FROM diario_agenda_eventos 
      WHERE data_inicio >= $1 AND data_inicio <= $2 AND status = 'realizado'
    ),
    'acoes_concluidas', (
      SELECT COUNT(*) FROM diario_crm_acoes 
      WHERE created_at >= $1 AND created_at <= $2 AND status = 'concluida'
    ),
    'sugestoes_pendentes', (
      SELECT COUNT(*) FROM diario_ia_sugestoes 
      WHERE created_at >= $1 AND created_at <= $2 AND status = 'pendente'
    ),
    'parceiros_envolvidos', (
      SELECT COUNT(DISTINCT COALESCE(e.parceiro_id, c.parceiro_id))
      FROM diario_agenda_eventos e
      FULL OUTER JOIN diario_crm_acoes c ON false
      WHERE (e.data_inicio >= $1 AND e.data_inicio <= $2)
         OR (c.created_at >= $1 AND c.created_at <= $2)
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ===== DADOS INICIAIS (OPCIONAL) =====

-- Inserir algumas sugestões de IA de exemplo (apenas para desenvolvimento)
-- INSERT INTO diario_ia_sugestoes (tipo_sugestao, titulo, conteudo_original, conteudo_sugerido, justificativa_ia)
-- VALUES 
--   ('melhoria_texto', 'Otimização de descrição de evento', 'Reunião com cliente', 'Reunião de alinhamento estratégico com cliente sobre expansão de portfólio', 'Sugestão mais específica e profissional'),
--   ('otimizacao_agenda', 'Reagendamento sugerido', 'Duas reuniões no mesmo horário', 'Reagendar segunda reunião para 1 hora depois', 'Conflito de horário detectado');

-- ===== FIM DO SCRIPT =====
