
-- ================================================================
-- MÓDULO DIÁRIO - SQL SUPABASE/POSTGRESQL
-- ================================================================
-- Este arquivo contém todas as estruturas necessárias para o
-- módulo Diário: tipos, tabelas, políticas RLS e triggers.
-- ================================================================

-- ================================================================
-- 1. CRIAÇÃO DE TIPOS ENUM
-- ================================================================

-- Tipos de eventos da agenda
CREATE TYPE tipo_evento_agenda AS ENUM (
    'reuniao',
    'call', 
    'apresentacao',
    'follow_up',
    'outro'
);

-- Status dos eventos
CREATE TYPE status_evento AS ENUM (
    'agendado',
    'realizado', 
    'cancelado',
    'reagendado'
);

-- Fonte de integração dos eventos
CREATE TYPE fonte_integracao AS ENUM (
    'manual',
    'google',
    'outlook'
);

-- Tipos de ação CRM
CREATE TYPE tipo_acao_crm AS ENUM (
    'audio',
    'video',
    'texto'
);

-- Status das ações CRM
CREATE TYPE status_acao_crm AS ENUM (
    'pendente',
    'em_andamento',
    'concluida',
    'cancelada'
);

-- Tipos de resumo
CREATE TYPE tipo_resumo AS ENUM (
    'semanal',
    'mensal',
    'trimestral'
);

-- Status das sugestões de IA
CREATE TYPE status_sugestao_ia AS ENUM (
    'pendente',
    'em_revisao',
    'aprovada',
    'rejeitada'
);

-- ================================================================
-- 2. CRIAÇÃO DAS TABELAS
-- ================================================================

-- Tabela de eventos da agenda
CREATE TABLE diario_agenda_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ NOT NULL,
    data_fim TIMESTAMPTZ NOT NULL,
    tipo tipo_evento_agenda NOT NULL DEFAULT 'reuniao',
    status status_evento NOT NULL DEFAULT 'agendado',
    parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    usuario_responsavel_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fonte_integracao fonte_integracao NOT NULL DEFAULT 'manual',
    evento_externo_id VARCHAR(255), -- ID do evento no sistema externo (Google/Outlook)
    metadata_integracao JSONB, -- Metadados adicionais da integração
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT data_valida CHECK (data_fim > data_inicio)
);

-- Tabela de ações CRM
CREATE TABLE diario_crm_acoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    tipo tipo_acao_crm NOT NULL,
    status status_acao_crm NOT NULL DEFAULT 'pendente',
    parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    usuario_responsavel_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    arquivo_audio VARCHAR(500), -- URL/path do arquivo de áudio
    arquivo_video VARCHAR(500), -- URL/path do arquivo de vídeo
    conteudo_texto TEXT, -- Conteúdo textual
    data_prevista TIMESTAMPTZ,
    data_realizada TIMESTAMPTZ,
    proximos_passos TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT arquivo_obrigatorio CHECK (
        (tipo = 'audio' AND arquivo_audio IS NOT NULL) OR
        (tipo = 'video' AND arquivo_video IS NOT NULL) OR
        (tipo = 'texto' AND conteudo_texto IS NOT NULL)
    )
);

-- Tabela de resumos
CREATE TABLE diario_resumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo tipo_resumo NOT NULL,
    periodo_inicio TIMESTAMPTZ NOT NULL,
    periodo_fim TIMESTAMPTZ NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo_resumo TEXT NOT NULL,
    total_eventos INTEGER DEFAULT 0,
    total_acoes_crm INTEGER DEFAULT 0,
    total_parceiros_envolvidos INTEGER DEFAULT 0,
    principais_realizacoes TEXT[], -- Array de strings
    proximos_passos TEXT[], -- Array de strings
    arquivo_pdf VARCHAR(500), -- URL/path do PDF gerado
    arquivo_csv VARCHAR(500), -- URL/path do CSV gerado
    usuario_gerador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT periodo_valido CHECK (periodo_fim > periodo_inicio)
);

-- Tabela de sugestões de IA
CREATE TABLE diario_ia_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_sugestao VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    conteudo_original TEXT NOT NULL,
    conteudo_sugerido TEXT NOT NULL,
    conteudo_aprovado TEXT, -- Versão final após revisão do admin
    justificativa_ia TEXT NOT NULL, -- Por que a IA fez essa sugestão
    status status_sugestao_ia NOT NULL DEFAULT 'pendente',
    parceiro_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    referencia_id UUID, -- ID genérico para referenciar outros registros
    referencia_tipo VARCHAR(50), -- Tipo do registro referenciado (evento, acao, etc)
    usuario_revisor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    data_revisao TIMESTAMPTZ,
    observacoes_revisor TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 3. CRIAÇÃO DE ÍNDICES
-- ================================================================

-- Índices para performance em consultas frequentes

-- Agenda
CREATE INDEX idx_agenda_eventos_data_inicio ON diario_agenda_eventos(data_inicio);
CREATE INDEX idx_agenda_eventos_usuario ON diario_agenda_eventos(usuario_responsavel_id);
CREATE INDEX idx_agenda_eventos_parceiro ON diario_agenda_eventos(parceiro_id);
CREATE INDEX idx_agenda_eventos_status ON diario_agenda_eventos(status);
CREATE INDEX idx_agenda_eventos_fonte ON diario_agenda_eventos(fonte_integracao);

-- CRM
CREATE INDEX idx_crm_acoes_usuario ON diario_crm_acoes(usuario_responsavel_id);
CREATE INDEX idx_crm_acoes_parceiro ON diario_crm_acoes(parceiro_id);
CREATE INDEX idx_crm_acoes_tipo ON diario_crm_acoes(tipo);
CREATE INDEX idx_crm_acoes_status ON diario_crm_acoes(status);
CREATE INDEX idx_crm_acoes_created_at ON diario_crm_acoes(created_at);

-- Resumos
CREATE INDEX idx_resumos_periodo ON diario_resumos(periodo_inicio, periodo_fim);
CREATE INDEX idx_resumos_usuario ON diario_resumos(usuario_gerador_id);
CREATE INDEX idx_resumos_tipo ON diario_resumos(tipo);

-- IA
CREATE INDEX idx_ia_sugestoes_status ON diario_ia_sugestoes(status);
CREATE INDEX idx_ia_sugestoes_tipo ON diario_ia_sugestoes(tipo_sugestao);
CREATE INDEX idx_ia_sugestoes_parceiro ON diario_ia_sugestoes(parceiro_id);
CREATE INDEX idx_ia_sugestoes_referencia ON diario_ia_sugestoes(referencia_id, referencia_tipo);

-- ================================================================
-- 4. TRIGGERS DE AUDITORIA E ATUALIZAÇÃO
-- ================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas relevantes
CREATE TRIGGER update_agenda_eventos_updated_at
    BEFORE UPDATE ON diario_agenda_eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_acoes_updated_at
    BEFORE UPDATE ON diario_crm_acoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ia_sugestoes_updated_at
    BEFORE UPDATE ON diario_ia_sugestoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE diario_agenda_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_crm_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diario_ia_sugestoes ENABLE ROW LEVEL SECURITY;

-- Política para agenda_eventos - apenas admins
CREATE POLICY "Admin access diario_agenda_eventos" ON diario_agenda_eventos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
            AND usuarios.ativo = true
        )
    );

-- Política para crm_acoes - apenas admins
CREATE POLICY "Admin access diario_crm_acoes" ON diario_crm_acoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
            AND usuarios.ativo = true
        )
    );

-- Política para resumos - apenas admins
CREATE POLICY "Admin access diario_resumos" ON diario_resumos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
            AND usuarios.ativo = true
        )
    );

-- Política para ia_sugestoes - apenas admins
CREATE POLICY "Admin access diario_ia_sugestoes" ON diario_ia_sugestoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE usuarios.id = auth.uid() 
            AND usuarios.papel = 'admin'
            AND usuarios.ativo = true
        )
    );

-- ================================================================
-- 6. FUNÇÕES AUXILIARES
-- ================================================================

-- Função para gerar estatísticas do diário
CREATE OR REPLACE FUNCTION get_diario_stats(usuario_id UUID)
RETURNS TABLE (
    total_eventos_hoje INTEGER,
    total_eventos_semana INTEGER,
    total_acoes_pendentes INTEGER,
    total_sugestoes_pendentes INTEGER,
    eventos_proxima_semana INTEGER,
    parceiros_ativos INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Eventos hoje
        (SELECT COUNT(*)::INTEGER 
         FROM diario_agenda_eventos 
         WHERE DATE(data_inicio) = CURRENT_DATE
         AND usuario_responsavel_id = $1)::INTEGER,
        
        -- Eventos esta semana
        (SELECT COUNT(*)::INTEGER 
         FROM diario_agenda_eventos 
         WHERE DATE(data_inicio) >= DATE_TRUNC('week', CURRENT_DATE)
         AND DATE(data_inicio) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
         AND usuario_responsavel_id = $1)::INTEGER,
        
        -- Ações pendentes
        (SELECT COUNT(*)::INTEGER 
         FROM diario_crm_acoes 
         WHERE status = 'pendente'
         AND usuario_responsavel_id = $1)::INTEGER,
        
        -- Sugestões pendentes
        (SELECT COUNT(*)::INTEGER 
         FROM diario_ia_sugestoes 
         WHERE status = 'pendente')::INTEGER,
        
        -- Eventos próxima semana
        (SELECT COUNT(*)::INTEGER 
         FROM diario_agenda_eventos 
         WHERE DATE(data_inicio) >= DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
         AND DATE(data_inicio) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '14 days'
         AND usuario_responsavel_id = $1)::INTEGER,
        
        -- Parceiros ativos (com atividade no último mês)
        (SELECT COUNT(DISTINCT parceiro_id)::INTEGER 
         FROM (
             SELECT parceiro_id FROM diario_agenda_eventos 
             WHERE parceiro_id IS NOT NULL 
             AND created_at >= CURRENT_DATE - INTERVAL '30 days'
             AND usuario_responsavel_id = $1
             UNION
             SELECT parceiro_id FROM diario_crm_acoes 
             WHERE parceiro_id IS NOT NULL 
             AND created_at >= CURRENT_DATE - INTERVAL '30 days'
             AND usuario_responsavel_id = $1
         ) sub)::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para sincronização com calendários externos
CREATE OR REPLACE FUNCTION sync_external_event(
    evento_externo_id VARCHAR(255),
    fonte fonte_integracao,
    titulo VARCHAR(255),
    descricao TEXT,
    data_inicio TIMESTAMPTZ,
    data_fim TIMESTAMPTZ,
    usuario_id UUID,
    metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    evento_id UUID;
BEGIN
    -- Verificar se o evento já existe
    SELECT id INTO evento_id 
    FROM diario_agenda_eventos 
    WHERE evento_externo_id = $1 AND fonte_integracao = $2;
    
    IF evento_id IS NULL THEN
        -- Criar novo evento
        INSERT INTO diario_agenda_eventos (
            titulo, descricao, data_inicio, data_fim, 
            usuario_responsavel_id, fonte_integracao, 
            evento_externo_id, metadata_integracao
        ) VALUES (
            $3, $4, $5, $6, $7, $2, $1, $8
        ) RETURNING id INTO evento_id;
    ELSE
        -- Atualizar evento existente
        UPDATE diario_agenda_eventos 
        SET titulo = $3, descricao = $4, data_inicio = $5, 
            data_fim = $6, metadata_integracao = $8, updated_at = NOW()
        WHERE id = evento_id;
    END IF;
    
    RETURN evento_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. GRANTS E PERMISSÕES
-- ================================================================

-- Garantir que apenas usuários autenticados acessem as funções
GRANT EXECUTE ON FUNCTION get_diario_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_external_event(VARCHAR(255), fonte_integracao, VARCHAR(255), TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID, JSONB) TO authenticated;

-- ================================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ================================================================

COMMENT ON TABLE diario_agenda_eventos IS 'Eventos da agenda do diário executivo com integração com Google Calendar e Outlook';
COMMENT ON TABLE diario_crm_acoes IS 'Ações de CRM com suporte a áudio, vídeo e texto';
COMMENT ON TABLE diario_resumos IS 'Resumos executivos gerados automaticamente (semanal, mensal, trimestral)';
COMMENT ON TABLE diario_ia_sugestoes IS 'Sugestões de melhorias geradas pela IA para revisão dos administradores';

COMMENT ON FUNCTION get_diario_stats(UUID) IS 'Retorna estatísticas consolidadas do diário para um usuário específico';
COMMENT ON FUNCTION sync_external_event IS 'Sincroniza eventos de calendários externos (Google, Outlook) com a agenda do diário';

-- ================================================================
-- FIM DO ARQUIVO SQL PARA MÓDULO DIÁRIO
-- ================================================================
