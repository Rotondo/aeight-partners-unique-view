
-- Corrigir o status_apresentacao para incluir 'pendente'
ALTER TABLE wishlist_apresentacoes 
DROP CONSTRAINT IF EXISTS wishlist_apresentacoes_status_apresentacao_check;

ALTER TABLE wishlist_apresentacoes 
ADD CONSTRAINT wishlist_apresentacoes_status_apresentacao_check 
CHECK (status_apresentacao IN ('pendente', 'agendada', 'realizada', 'cancelada'));

-- Atualizar o default para 'pendente' em vez de 'realizada'
ALTER TABLE wishlist_apresentacoes 
ALTER COLUMN status_apresentacao SET DEFAULT 'pendente';

-- Adicionar coluna para diferenciar apresentações solicitadas vs registradas
ALTER TABLE wishlist_apresentacoes 
ADD COLUMN IF NOT EXISTS tipo_solicitacao VARCHAR(20) DEFAULT 'solicitacao' 
CHECK (tipo_solicitacao IN ('solicitacao', 'registro'));

-- Atualizar registros existentes para serem do tipo 'registro'
UPDATE wishlist_apresentacoes 
SET tipo_solicitacao = 'registro' 
WHERE status_apresentacao IN ('realizada', 'agendada');
