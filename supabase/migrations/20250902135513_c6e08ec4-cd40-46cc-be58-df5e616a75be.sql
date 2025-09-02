-- Criar tabela para mapear fornecedores por cliente/etapa
CREATE TABLE cliente_etapa_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  etapa_id UUID NOT NULL REFERENCES etapas_jornada(id) ON DELETE CASCADE,
  subnivel_id UUID REFERENCES subniveis_etapa(id) ON DELETE CASCADE,
  empresa_fornecedora_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  data_mapeamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Adicionar índices para performance
CREATE INDEX idx_cliente_etapa_fornecedores_cliente_id ON cliente_etapa_fornecedores(cliente_id);
CREATE INDEX idx_cliente_etapa_fornecedores_etapa_id ON cliente_etapa_fornecedores(etapa_id);
CREATE INDEX idx_cliente_etapa_fornecedores_empresa_id ON cliente_etapa_fornecedores(empresa_fornecedora_id);
CREATE INDEX idx_cliente_etapa_fornecedores_ativo ON cliente_etapa_fornecedores(ativo);

-- Habilitar RLS
ALTER TABLE cliente_etapa_fornecedores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários autenticados podem ver mapeamentos" 
ON cliente_etapa_fornecedores 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem gerenciar mapeamentos" 
ON cliente_etapa_fornecedores 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cliente_etapa_fornecedores_updated_at
  BEFORE UPDATE ON cliente_etapa_fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();