
-- Adicionar campo status_oportunidade na tabela metas_oportunidades
ALTER TABLE metas_oportunidades 
ADD COLUMN status_oportunidade VARCHAR(20) 
CHECK (status_oportunidade IN ('todas', 'ganhas')) 
DEFAULT 'todas';

-- Atualizar o trigger de updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Garantir que o trigger existe na tabela metas_oportunidades
DROP TRIGGER IF EXISTS update_metas_oportunidades_updated_at ON metas_oportunidades;
CREATE TRIGGER update_metas_oportunidades_updated_at
    BEFORE UPDATE ON metas_oportunidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
