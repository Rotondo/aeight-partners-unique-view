-- Remover campos que agora vêm da empresa
ALTER TABLE parceiros_mapa 
DROP COLUMN IF EXISTS nome,
DROP COLUMN IF EXISTS descricao,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS contato_email,
DROP COLUMN IF EXISTS contato_telefone,
DROP COLUMN IF EXISTS logo_url;

-- Tornar empresa_id obrigatório se ainda não for
ALTER TABLE parceiros_mapa 
ALTER COLUMN empresa_id SET NOT NULL;

-- Garantir que uma empresa só pode ser cadastrada uma vez como parceiro
ALTER TABLE parceiros_mapa 
ADD CONSTRAINT unique_empresa_parceiro UNIQUE (empresa_id);