
-- Corrigir warnings do Supabase - versão corrigida

-- 1. Adicionar campo description na tabela diario_crm_acoes
ALTER TABLE diario_crm_acoes 
ADD COLUMN description TEXT;

-- 2. Adicionar campo communication_method na tabela diario_crm_acoes
ALTER TABLE diario_crm_acoes 
ADD COLUMN communication_method TEXT;

-- 3. Adicionar campo next_steps na tabela diario_crm_acoes
ALTER TABLE diario_crm_acoes 
ADD COLUMN next_steps TEXT;

-- 4. Criar enum para métodos de comunicação
CREATE TYPE metodo_comunicacao AS ENUM (
    'whatsapp',
    'ligacao', 
    'email',
    'encontro',
    'reuniao_meet'
);

-- 5. Criar enum para status das ações CRM
CREATE TYPE status_acao_crm_enum AS ENUM (
    'pendente',
    'em_andamento',
    'concluida',
    'cancelada'
);

-- 6. Adicionar campo status sem default primeiro
ALTER TABLE diario_crm_acoes 
ADD COLUMN status status_acao_crm_enum;

-- 7. Definir valor padrão para registros existentes
UPDATE diario_crm_acoes 
SET status = 'pendente' 
WHERE status IS NULL;

-- 8. Tornar o campo status obrigatório com default
ALTER TABLE diario_crm_acoes 
ALTER COLUMN status SET DEFAULT 'pendente'::status_acao_crm_enum,
ALTER COLUMN status SET NOT NULL;

-- 9. Atualizar o campo communication_method para usar o enum
ALTER TABLE diario_crm_acoes 
ALTER COLUMN communication_method TYPE metodo_comunicacao 
USING CASE 
    WHEN communication_method = 'whatsapp' THEN 'whatsapp'::metodo_comunicacao
    WHEN communication_method = 'ligacao' THEN 'ligacao'::metodo_comunicacao
    WHEN communication_method = 'email' THEN 'email'::metodo_comunicacao
    WHEN communication_method = 'encontro' THEN 'encontro'::metodo_comunicacao
    WHEN communication_method = 'reuniao_meet' THEN 'reuniao_meet'::metodo_comunicacao
    ELSE 'email'::metodo_comunicacao
END;

-- 10. Adicionar campo event_type na tabela diario_agenda_eventos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diario_agenda_eventos' 
                   AND column_name = 'event_type') THEN
        ALTER TABLE diario_agenda_eventos ADD COLUMN event_type TEXT;
    END IF;
END $$;

-- 11. Adicionar campo related_crm_action_id na tabela diario_agenda_eventos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'diario_agenda_eventos' 
                   AND column_name = 'related_crm_action_id') THEN
        ALTER TABLE diario_agenda_eventos ADD COLUMN related_crm_action_id UUID;
    END IF;
END $$;

-- 12. Adicionar constraint para relacionamento CRM -> Agenda
ALTER TABLE diario_agenda_eventos 
ADD CONSTRAINT fk_crm_action 
FOREIGN KEY (related_crm_action_id) 
REFERENCES diario_crm_acoes(id) 
ON DELETE SET NULL;

-- 13. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_crm_acoes_communication_method ON diario_crm_acoes(communication_method);
CREATE INDEX IF NOT EXISTS idx_crm_acoes_status ON diario_crm_acoes(status);
CREATE INDEX IF NOT EXISTS idx_agenda_eventos_related_crm ON diario_agenda_eventos(related_crm_action_id);

-- 14. Atualizar comentários para documentação
COMMENT ON COLUMN diario_crm_acoes.description IS 'Título/resumo da ação CRM';
COMMENT ON COLUMN diario_crm_acoes.communication_method IS 'Método de comunicação usado na ação';
COMMENT ON COLUMN diario_crm_acoes.status IS 'Status atual da ação CRM';
COMMENT ON COLUMN diario_crm_acoes.next_steps IS 'Próximos passos definidos para esta ação';
COMMENT ON COLUMN diario_agenda_eventos.related_crm_action_id IS 'ID da ação CRM que gerou este evento da agenda';
