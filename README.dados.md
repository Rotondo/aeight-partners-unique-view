
# Aeight Partners - Banco de Dados PWA, Storage e Auditoria Completa

Documentação exaustiva do banco de dados PostgreSQL/Supabase com suporte PWA, incluindo cache offline, sincronização automática e todas as estruturas de dados do sistema modular refatorado.

## 📑 Sumário

1. [Schema PWA e Cache Offline](#schema-pwa-e-cache-offline)
2. [Módulo Indicadores Refatorado - Database](#módulo-indicadores-refatorado---database)
3. [Módulo Wishlist Aprimorado - Database](#módulo-wishlist-aprimorado---database)
4. [Sistema de Classificação e Scoring](#sistema-de-classificação-e-scoring)
5. [Cache e Sincronização PWA](#cache-e-sincronização-pwa)
6. [Módulo Diário Executivo - Database](#módulo-diário-executivo---database)
7. [Módulos Core - Database](#módulos-core---database)
8. [ENUMs e Validações Aprimoradas](#enums-e-validações-aprimoradas)
9. [Políticas RLS e Segurança PWA](#políticas-rls-e-segurança-pwa)
10. [Triggers e Auditoria Avançada](#triggers-e-auditoria-avançada)
11. [Supabase Storage PWA](#supabase-storage-pwa)
12. [Funções e Procedures Otimizadas](#funções-e-procedures-otimizadas)

---

## 1. Schema PWA e Cache Offline

### 📊 **Visão Geral PWA**
- **27 tabelas principais** com cache inteligente
- **15+ ENUMs** com validação client-side
- **60+ políticas RLS** otimizadas para PWA
- **20+ triggers** com sincronização automática
- **12+ funções customizadas** com cache
- **Cache Strategy**: Network-first com fallback offline

### 🔄 **Estratégia de Sincronização**
```sql
-- Tabela de controle de sincronização PWA
CREATE TABLE public.sync_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT now(),
  sync_status TEXT DEFAULT 'pending', -- pending | syncing | completed | error
  device_id TEXT,
  user_id UUID REFERENCES auth.users,
  changes_count INTEGER DEFAULT 0,
  error_message TEXT
);

-- Índices para performance PWA
CREATE INDEX idx_sync_control_table ON sync_control(table_name);
CREATE INDEX idx_sync_control_user ON sync_control(user_id);
CREATE INDEX idx_sync_control_status ON sync_control(sync_status);
```

---

## 2. Módulo Indicadores Refatorado - Database

### 📊 **Estruturas de Dados Aprimoradas**

#### **indicadores_parceiro** (Otimizada)
```sql
-- Tabela principal com novos campos calculados
CREATE TABLE indicadores_parceiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  
  -- Métricas core (mantidas)
  potencial_leads INTEGER NOT NULL,
  base_clientes INTEGER,
  engajamento INTEGER NOT NULL,
  alinhamento INTEGER NOT NULL,
  potencial_investimento INTEGER NOT NULL,
  tamanho company_size NOT NULL,
  
  -- Novos campos calculados automaticamente
  oportunidades_indicadas INTEGER DEFAULT 0,
  share_of_wallet NUMERIC(5,2),
  score_relevancia NUMERIC(5,2),
  classificacao_automatica TEXT,
  
  -- Campos de controle aprimorados
  score_x NUMERIC GENERATED ALWAYS AS (
    (potencial_leads * 0.6) + (COALESCE(base_clientes, 0) * 0.4)
  ) STORED,
  score_y NUMERIC GENERATED ALWAYS AS (
    (engajamento * 0.5) + (alinhamento * 0.3) + (potencial_investimento * 0.2)
  ) STORED,
  
  data_avaliacao TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  -- Cache PWA
  cached_data JSONB,
  cache_expires_at TIMESTAMP
);
```

#### **Novos Índices para Performance**
```sql
-- Índices otimizados para consultas frequentes PWA
CREATE INDEX idx_indicadores_empresa_ativo ON indicadores_parceiro(empresa_id) 
  WHERE cached_data IS NOT NULL;
CREATE INDEX idx_indicadores_score_x ON indicadores_parceiro(score_x DESC);
CREATE INDEX idx_indicadores_score_y ON indicadores_parceiro(score_y DESC);
CREATE INDEX idx_indicadores_relevancia ON indicadores_parceiro(score_relevancia DESC);
CREATE INDEX idx_indicadores_share_wallet ON indicadores_parceiro(share_of_wallet DESC);

-- Índice composto para dashboard PWA
CREATE INDEX idx_indicadores_dashboard ON indicadores_parceiro(
  empresa_id, score_x, score_y, oportunidades_indicadas
) WHERE cached_data IS NOT NULL;
```

### 🎯 **Interfaces TypeScript Refatoradas**

#### **types.ts - Estruturas Centralizadas**
```sql
-- Estrutura JSON para interface IndicadoresParceiroWithEmpresa
/*
{
  "id": "uuid",
  "empresa_id": "uuid", 
  "empresa": {
    "id": "uuid",
    "nome": "string"
  },
  "potencial_leads": "number",
  "engajamento": "number",
  "alinhamento": "number", 
  "potencial_investimento": "number",
  "tamanho": "company_size_enum",
  "oportunidades_indicadas": "number",
  "share_of_wallet": "number",
  "score_relevancia": "number",
  "classificacao_automatica": "string"
}
*/
```

---

## 3. Módulo Wishlist Aprimorado - Database

### 🎪 **Novas Estruturas de Dados**

#### **clientes_sobrepostos** (Nova Tabela)
```sql
-- Detecção automática de clientes compartilhados
CREATE TABLE public.clientes_sobrepostos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_a_id UUID NOT NULL REFERENCES empresas(id),
  parceiro_b_id UUID NOT NULL REFERENCES empresas(id),
  cliente_sobreposto_id UUID NOT NULL REFERENCES empresas(id),
  score_sobreposicao NUMERIC(5,2) NOT NULL,
  relevancia_a NUMERIC(5,2),
  relevancia_b NUMERIC(5,2),
  oportunidade_mutua BOOLEAN DEFAULT false,
  data_deteccao TIMESTAMP DEFAULT now(),
  status TEXT DEFAULT 'detectado', -- detectado | analisado | oportunidade | descartado
  
  -- Cache para PWA
  cached_analysis JSONB,
  
  CONSTRAINT unique_sobreposicao UNIQUE(parceiro_a_id, parceiro_b_id, cliente_sobreposto_id)
);

-- Índices otimizados
CREATE INDEX idx_sobrepostos_parceiro_a ON clientes_sobrepostos(parceiro_a_id);
CREATE INDEX idx_sobrepostos_parceiro_b ON clientes_sobrepostos(parceiro_b_id);
CREATE INDEX idx_sobrepostos_score ON clientes_sobrepostos(score_sobreposicao DESC);
CREATE INDEX idx_sobrepostos_oportunidade ON clientes_sobrepostos(oportunidade_mutua) 
  WHERE oportunidade_mutua = true;
```

#### **parceiro_relevancia** (Nova Tabela)
```sql
-- Scoring automático de relevância entre parceiros
CREATE TABLE public.parceiro_relevancia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_origem_id UUID NOT NULL REFERENCES empresas(id),
  parceiro_destino_id UUID NOT NULL REFERENCES empresas(id),
  score_relevancia NUMERIC(5,2) NOT NULL,
  fatores_calculo JSONB NOT NULL, -- Detalhamento do cálculo
  
  -- Métricas específicas
  clientes_compartilhados INTEGER DEFAULT 0,
  oportunidades_historicas INTEGER DEFAULT 0,
  compatibilidade_segmento NUMERIC(3,2),
  potencial_negocio NUMERIC(5,2),
  
  -- Controle temporal
  calculado_em TIMESTAMP DEFAULT now(),
  valido_ate TIMESTAMP DEFAULT (now() + INTERVAL '30 days'),
  
  -- Cache PWA
  cached_details JSONB,
  
  CONSTRAINT unique_relevancia UNIQUE(parceiro_origem_id, parceiro_destino_id)
);

-- Índices para performance
CREATE INDEX idx_relevancia_origem ON parceiro_relevancia(parceiro_origem_id);
CREATE INDEX idx_relevancia_score ON parceiro_relevancia(score_relevancia DESC);
CREATE INDEX idx_relevancia_valido ON parceiro_relevancia(valido_ate) 
  WHERE valido_ate > now();
```

### 🔄 **Wishlist Items Aprimorado**
```sql
-- Extensão da tabela existente com novos campos
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS score_prioridade NUMERIC(3,2);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS relevancia_automatica NUMERIC(5,2);
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS clientes_comuns INTEGER DEFAULT 0;
ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS cached_analysis JSONB;

-- Novos índices
CREATE INDEX idx_wishlist_score_prioridade ON wishlist_items(score_prioridade DESC) 
  WHERE status = 'pendente';
CREATE INDEX idx_wishlist_relevancia ON wishlist_items(relevancia_automatica DESC);
```

---

## 4. Sistema de Classificação e Scoring

### 🏢 **Empresa Classification Enhanced**
```sql
-- Função para classificação automática
CREATE OR REPLACE FUNCTION classify_empresa_automatica(empresa_id UUID)
RETURNS JSONB AS $$
DECLARE
  classificacao RECORD;
  resultado JSONB;
BEGIN
  -- Buscar dados da empresa
  SELECT 
    e.nome,
    e.tipo,
    COALESCE(i.base_clientes, 0) as base_clientes,
    COALESCE(i.potencial_leads, 0) as potencial_leads,
    COALESCE(i.tamanho, 'P'::company_size) as tamanho,
    COUNT(o.id) as total_oportunidades
  INTO classificacao
  FROM empresas e
  LEFT JOIN indicadores_parceiro i ON e.id = i.empresa_id
  LEFT JOIN oportunidades o ON e.id = o.empresa_origem_id
  WHERE e.id = classify_empresa_automatica.empresa_id
  GROUP BY e.id, e.nome, e.tipo, i.base_clientes, i.potencial_leads, i.tamanho;
  
  -- Calcular classificação
  resultado := jsonb_build_object(
    'porte', classificacao.tamanho,
    'categoria', CASE 
      WHEN classificacao.total_oportunidades > 10 THEN 'Parceiro Ativo'
      WHEN classificacao.potencial_leads > 50 THEN 'Alto Potencial'
      WHEN classificacao.base_clientes > 100 THEN 'Base Sólida'
      ELSE 'Em Desenvolvimento'
    END,
    'score_atividade', LEAST(classificacao.total_oportunidades * 0.1, 10),
    'score_potencial', LEAST(classificacao.potencial_leads * 0.02, 10),
    'score_base', LEAST(classificacao.base_clientes * 0.01, 10)
  );
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 📊 **Algoritmo de Relevância**
```sql
-- Função para calcular relevância entre parceiros
CREATE OR REPLACE FUNCTION calculate_parceiro_relevancia(
  origem_id UUID,
  destino_id UUID
) RETURNS NUMERIC AS $$
DECLARE
  score_final NUMERIC := 0;
  clientes_comuns INTEGER;
  oportunidades_historicas INTEGER;
  compatibilidade NUMERIC;
BEGIN
  -- Contar clientes compartilhados
  SELECT COUNT(DISTINCT cs.cliente_sobreposto_id)
  INTO clientes_comuns
  FROM clientes_sobrepostos cs
  WHERE (cs.parceiro_a_id = origem_id AND cs.parceiro_b_id = destino_id)
     OR (cs.parceiro_a_id = destino_id AND cs.parceiro_b_id = origem_id);
  
  -- Contar oportunidades históricas
  SELECT COUNT(*)
  INTO oportunidades_historicas
  FROM oportunidades o
  WHERE (o.empresa_origem_id = origem_id AND o.empresa_destino_id = destino_id)
     OR (o.empresa_origem_id = destino_id AND o.empresa_destino_id = origem_id);
  
  -- Calcular compatibilidade de segmento (simplificado)
  SELECT 
    CASE 
      WHEN i1.tamanho = i2.tamanho THEN 1.0
      WHEN abs(
        CASE i1.tamanho 
          WHEN 'PP' THEN 1 WHEN 'P' THEN 2 WHEN 'M' THEN 3 
          WHEN 'G' THEN 4 WHEN 'GG' THEN 5 ELSE 3 END -
        CASE i2.tamanho 
          WHEN 'PP' THEN 1 WHEN 'P' THEN 2 WHEN 'M' THEN 3 
          WHEN 'G' THEN 4 WHEN 'GG' THEN 5 ELSE 3 END
      ) = 1 THEN 0.8
      ELSE 0.5
    END
  INTO compatibilidade
  FROM indicadores_parceiro i1, indicadores_parceiro i2
  WHERE i1.empresa_id = origem_id AND i2.empresa_id = destino_id;
  
  -- Calcular score final
  score_final := 
    (clientes_comuns * 2.0) + 
    (oportunidades_historicas * 1.5) + 
    (COALESCE(compatibilidade, 0.5) * 3.0);
  
  RETURN LEAST(score_final, 10.0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 5. Cache e Sincronização PWA

### 🔄 **Sistema de Cache Inteligente**
```sql
-- Tabela para controle de cache PWA
CREATE TABLE public.pwa_cache_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users,
  device_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  accessed_at TIMESTAMP DEFAULT now(),
  access_count INTEGER DEFAULT 1
);

-- Índices para performance
CREATE INDEX idx_pwa_cache_key ON pwa_cache_control(cache_key);
CREATE INDEX idx_pwa_cache_expires ON pwa_cache_control(expires_at);
CREATE INDEX idx_pwa_cache_user ON pwa_cache_control(user_id);

-- Função para limpeza automática de cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM pwa_cache_control 
  WHERE expires_at < now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### 📱 **Triggers de Sincronização**
```sql
-- Trigger para marcar dados para sync quando alterados
CREATE OR REPLACE FUNCTION mark_for_sync()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO sync_control (table_name, user_id, changes_count)
  VALUES (TG_TABLE_NAME, auth.uid(), 1)
  ON CONFLICT (table_name, user_id) 
  DO UPDATE SET 
    changes_count = sync_control.changes_count + 1,
    last_sync = now(),
    sync_status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas críticas
CREATE TRIGGER sync_indicadores_parceiro
  AFTER INSERT OR UPDATE OR DELETE ON indicadores_parceiro
  FOR EACH ROW EXECUTE FUNCTION mark_for_sync();

CREATE TRIGGER sync_oportunidades
  AFTER INSERT OR UPDATE OR DELETE ON oportunidades
  FOR EACH ROW EXECUTE FUNCTION mark_for_sync();
```

---

## 6. Módulo Diário Executivo - Database

### 📅 **Estruturas Mantidas com Melhorias PWA**

#### **diario_agenda_eventos** (Cache Otimizado)
```sql
-- Adição de campos para PWA
ALTER TABLE diario_agenda_eventos ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced';
ALTER TABLE diario_agenda_eventos ADD COLUMN IF NOT EXISTS offline_changes JSONB;
ALTER TABLE diario_agenda_eventos ADD COLUMN IF NOT EXISTS device_id TEXT;

-- Índice para sincronização
CREATE INDEX idx_agenda_sync_status ON diario_agenda_eventos(sync_status)
  WHERE sync_status != 'synced';
```

#### **diario_crm_acoes** (Upload Otimizado)
```sql
-- Melhorias para arquivos PWA
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS upload_progress INTEGER DEFAULT 100;
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS offline_file_data BYTEA;
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS sync_priority INTEGER DEFAULT 1;

-- Índice para uploads pendentes
CREATE INDEX idx_crm_upload_pending ON diario_crm_acoes(upload_progress)
  WHERE upload_progress < 100;
```

#### **🤖 Integração Automática CRM - Wishlist**
Nova funcionalidade de integração automática com CRM para todas as solicitações de wishlist:

```sql
-- Estrutura da tabela diario_crm_acoes já existente, com novos campos específicos
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS wishlist_metadata JSONB;
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS partner_id UUID;
ALTER TABLE diario_crm_acoes ADD COLUMN IF NOT EXISTS reciprocidade_info JSONB;

-- Índices para performance das consultas de wishlist
CREATE INDEX idx_crm_wishlist_metadata ON diario_crm_acoes
  USING gin(wishlist_metadata) WHERE wishlist_metadata IS NOT NULL;
CREATE INDEX idx_crm_partner_id ON diario_crm_acoes(partner_id) 
  WHERE partner_id IS NOT NULL;

-- Função para criação automática de ação CRM
CREATE OR REPLACE FUNCTION create_wishlist_crm_action(
  p_empresa_solicitante TEXT,
  p_empresa_demandada TEXT,
  p_clientes_solicitados JSONB,
  p_clientes_reciprocidade JSONB DEFAULT NULL,
  p_motivo TEXT DEFAULT '',
  p_partner_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_crm_id UUID;
  v_description TEXT;
  v_content TEXT;
  v_metadata JSONB;
BEGIN
  -- Gerar descrição automática
  v_description := format('Solicitação de Wishlist concluída entre %s e %s', 
    p_empresa_solicitante, p_empresa_demandada);
  
  -- Construir conteúdo detalhado
  v_content := format('Solicitação de Wishlist concluída:

DIREÇÃO PRINCIPAL:
%s → %s
Clientes solicitados (%s):', 
    p_empresa_solicitante, 
    p_empresa_demandada,
    jsonb_array_length(p_clientes_solicitados)
  );
  
  -- Adicionar lista de clientes solicitados
  FOR i IN 0..jsonb_array_length(p_clientes_solicitados)-1 LOOP
    v_content := v_content || format('
• %s (Prioridade: %s)', 
      (p_clientes_solicitados->i->>'nome'),
      (p_clientes_solicitados->i->>'prioridade')
    );
  END LOOP;
  
  -- Adicionar reciprocidade se existir
  IF p_clientes_reciprocidade IS NOT NULL THEN
    v_content := v_content || format('

DIREÇÃO RECÍPROCA:
%s → %s
Clientes solicitados (%s):', 
      p_empresa_demandada,
      p_empresa_solicitante,
      jsonb_array_length(p_clientes_reciprocidade)
    );
    
    FOR i IN 0..jsonb_array_length(p_clientes_reciprocidade)-1 LOOP
      v_content := v_content || format('
• %s (Prioridade: %s)', 
        (p_clientes_reciprocidade->i->>'nome'),
        (p_clientes_reciprocidade->i->>'prioridade')
      );
    END LOOP;
  END IF;
  
  -- Adicionar motivo
  IF p_motivo != '' THEN
    v_content := v_content || format('

Motivo: %s', p_motivo);
  END IF;
  
  -- Construir metadata estruturada
  v_metadata := jsonb_build_object(
    'wishlist_request', true,
    'empresa_solicitante', p_empresa_solicitante,
    'empresa_demandada', p_empresa_demandada,
    'reciprocidade', p_clientes_reciprocidade IS NOT NULL,
    'clientes_solicitados', p_clientes_solicitados,
    'clientes_reciprocidade', COALESCE(p_clientes_reciprocidade, '[]'::jsonb),
    'motivo', p_motivo,
    'created_at', now()
  );
  
  -- Inserir ação CRM
  INSERT INTO diario_crm_acoes (
    description,
    content,
    communication_method,
    status,
    partner_id,
    user_id,
    wishlist_metadata,
    metadata
  ) VALUES (
    v_description,
    v_content,
    'outro',
    'concluida',
    p_partner_id,
    COALESCE(p_user_id, auth.uid()),
    v_metadata,
    v_metadata
  ) RETURNING id INTO v_crm_id;
  
  RETURN v_crm_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Características da Integração CRM:**
- **Automática**: Toda solicitação de wishlist gera ação CRM
- **Detalhada**: Conteúdo completo com ambas as direções
- **Metadata**: Dados estruturados para análise e relatórios
- **Partner ID**: Identificação automática do parceiro externo
- **Auditoria**: Registro completo de usuário e timestamps

---

## 7. Módulos Core - Database

### 🏢 **Empresas (Classificação Automática)**
```sql
-- Extensão da tabela empresas
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS classificacao_automatica JSONB;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS score_relevancia_media NUMERIC(5,2);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS ultima_analise TIMESTAMP;

-- Trigger para atualização automática
CREATE OR REPLACE FUNCTION update_empresa_classificacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.classificacao_automatica := classify_empresa_automatica(NEW.id);
  NEW.ultima_analise := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_classify_empresa
  BEFORE INSERT OR UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION update_empresa_classificacao();
```

### 💼 **Oportunidades (Análise Aprimorada)**
```sql
-- Campos adicionais para análise
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS score_qualificacao NUMERIC(5,2);
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS origem_deteccao TEXT DEFAULT 'manual';
ALTER TABLE oportunidades ADD COLUMN IF NOT EXISTS potencial_sobreposicao BOOLEAN DEFAULT false;

-- Índices para relatórios PWA
CREATE INDEX idx_oportunidades_score ON oportunidades(score_qualificacao DESC);
CREATE INDEX idx_oportunidades_origem ON oportunidades(origem_deteccao);
```

---

## 8. ENUMs e Validações Aprimoradas

### 📋 **Novos ENUMs para PWA**
```sql
-- Status de sincronização PWA
CREATE TYPE sync_status_enum AS ENUM (
  'pending', 'syncing', 'synced', 'error', 'conflict'
);

-- Prioridade de sincronização
CREATE TYPE sync_priority_enum AS ENUM (
  'low', 'normal', 'high', 'critical'
);

-- Status de cache
CREATE TYPE cache_status_enum AS ENUM (
  'fresh', 'stale', 'expired', 'invalid'
);

-- Origem de detecção
CREATE TYPE detection_origin_enum AS ENUM (
  'manual', 'automatic', 'ai_suggested', 'bulk_import', 'api_integration'
);
```

---

## 9. Políticas RLS e Segurança PWA

### 🛡️ **Políticas Otimizadas para PWA**
```sql
-- Cache: usuário pode ver apenas seu próprio cache
CREATE POLICY "User can access own cache"
ON pwa_cache_control FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Indicadores: acesso otimizado com cache
CREATE POLICY "Indicadores with cache optimization"
ON indicadores_parceiro FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios u 
    WHERE u.id = auth.uid() 
    AND u.ativo = true
    AND (u.papel = 'admin' OR u.empresa_id IS NOT NULL)
  )
);

-- Clientes sobrepostos: apenas parceiros envolvidos
CREATE POLICY "View relevant client overlaps"
ON clientes_sobrepostos FOR SELECT
TO authenticated
USING (
  parceiro_a_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
  OR parceiro_b_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
  OR is_admin()
);
```

---

## 10. Triggers e Auditoria Avançada

### 📝 **Sistema de Auditoria PWA**
```sql
-- Auditoria com contexto PWA
CREATE TABLE audit_log_pwa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  device_id TEXT,
  sync_status TEXT DEFAULT 'pending',
  client_timestamp TIMESTAMP,
  server_timestamp TIMESTAMP DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Índices para performance
CREATE INDEX idx_audit_pwa_table ON audit_log_pwa(table_name);
CREATE INDEX idx_audit_pwa_user ON audit_log_pwa(user_id);
CREATE INDEX idx_audit_pwa_sync ON audit_log_pwa(sync_status);
```

### 🔄 **Triggers Especializados**
```sql
-- Trigger para atualização automática de relevância
CREATE OR REPLACE FUNCTION update_relevancia_automatica()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalcular relevância quando indicadores mudam
  INSERT INTO parceiro_relevancia (
    parceiro_origem_id, parceiro_destino_id, score_relevancia, fatores_calculo
  )
  SELECT 
    NEW.empresa_id,
    e.id,
    calculate_parceiro_relevancia(NEW.empresa_id, e.id),
    jsonb_build_object(
      'base_clientes', NEW.base_clientes,
      'potencial_leads', NEW.potencial_leads,
      'data_calculo', now()
    )
  FROM empresas e 
  WHERE e.id != NEW.empresa_id 
    AND e.tipo = 'parceiro' 
    AND e.status = true
  ON CONFLICT (parceiro_origem_id, parceiro_destino_id)
  DO UPDATE SET
    score_relevancia = EXCLUDED.score_relevancia,
    fatores_calculo = EXCLUDED.fatores_calculo,
    calculado_em = now(),
    valido_ate = now() + INTERVAL '30 days';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_relevancia
  AFTER INSERT OR UPDATE ON indicadores_parceiro
  FOR EACH ROW EXECUTE FUNCTION update_relevancia_automatica();
```

---

## 11. Supabase Storage PWA

### 📁 **Estrutura Otimizada para PWA**
```
Storage Buckets PWA:
├── materiais/                   # Cache-First strategy
│   ├── {empresa_id}/
│   │   ├── thumbs/              # Thumbnails para PWA
│   │   └── compressed/          # Versões comprimidas
├── diario/                     # Network-First com fallback
│   ├── audio/
│   │   └── {acao_id}/
│   │       ├── original.wav
│   │       └── compressed.webm  # Formato otimizado web
│   ├── video/
│   │   └── {acao_id}/
│   │       ├── original.webm
│   │       └── preview.jpg      # Preview para lista
│   └── cache/                   # Cache temporário PWA
├── offline-cache/              # Bucket para dados offline
│   ├── critical/               # Dados essenciais
│   └── background/             # Sync em background
└── user-uploads/               # Uploads pendentes
    └── {user_id}/
        └── pending/            # Arquivos aguardando sync
```

### 🔐 **Políticas de Storage PWA**
```sql
-- Cache offline: acesso próprio usuário
CREATE POLICY "User offline cache access"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'offline-cache' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'offline-cache' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Uploads pendentes: usuário próprio
CREATE POLICY "User pending uploads"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 12. Funções e Procedures Otimizadas

### 📊 **Dashboard PWA com Cache**
```sql
CREATE OR REPLACE FUNCTION get_dashboard_data_cached(
  user_id UUID,
  force_refresh BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
  cached_data JSONB;
  fresh_data JSONB;
  cache_key TEXT;
BEGIN
  cache_key := 'dashboard_' || user_id::text;
  
  -- Verificar cache se não forçar refresh
  IF NOT force_refresh THEN
    SELECT data INTO cached_data
    FROM pwa_cache_control
    WHERE cache_key = get_dashboard_data_cached.cache_key
      AND expires_at > now()
      AND user_id = get_dashboard_data_cached.user_id;
    
    IF cached_data IS NOT NULL THEN
      -- Atualizar estatísticas de acesso
      UPDATE pwa_cache_control
      SET accessed_at = now(), access_count = access_count + 1
      WHERE cache_key = get_dashboard_data_cached.cache_key;
      
      RETURN cached_data;
    END IF;
  END IF;
  
  -- Gerar dados frescos
  SELECT jsonb_build_object(
    'indicadores_resumo', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'empresa_id', i.empresa_id,
          'nome', e.nome,
          'score_x', i.score_x,
          'score_y', i.score_y,
          'oportunidades_indicadas', i.oportunidades_indicadas,
          'share_of_wallet', i.share_of_wallet
        )
      )
      FROM indicadores_parceiro i
      JOIN empresas e ON i.empresa_id = e.id
      WHERE e.status = true
    ),
    'oportunidades_stats', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'abertas', COUNT(*) FILTER (WHERE status IN ('em_contato', 'negociando')),
        'fechadas', COUNT(*) FILTER (WHERE status = 'ganho'),
        'perdidas', COUNT(*) FILTER (WHERE status = 'perdido')
      )
      FROM oportunidades
      WHERE created_at >= now() - INTERVAL '30 days'
    ),
    'clientes_sobrepostos_count', (
      SELECT COUNT(*)
      FROM clientes_sobrepostos
      WHERE oportunidade_mutua = true
    ),
    'generated_at', now()
  ) INTO fresh_data;
  
  -- Salvar no cache
  INSERT INTO pwa_cache_control (cache_key, data, expires_at, user_id)
  VALUES (
    get_dashboard_data_cached.cache_key,
    fresh_data,
    now() + INTERVAL '15 minutes',
    get_dashboard_data_cached.user_id
  )
  ON CONFLICT (cache_key)
  DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = EXCLUDED.expires_at,
    accessed_at = now(),
    access_count = pwa_cache_control.access_count + 1;
  
  RETURN fresh_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 🔍 **Busca com Sobreposições**
```sql
CREATE OR REPLACE FUNCTION find_clientes_sobrepostos_smart(
  parceiro_id UUID,
  limite INTEGER DEFAULT 10
)
RETURNS TABLE (
  sobreposto_id UUID,
  nome_cliente TEXT,
  parceiros_compartilhados TEXT[],
  score_oportunidade NUMERIC,
  sugestao_acao TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cs.cliente_sobreposto_id,
    e.nome,
    array_agg(DISTINCT ep.nome) as parceiros_compartilhados,
    AVG(cs.score_sobreposicao) as score_oportunidade,
    CASE 
      WHEN COUNT(DISTINCT cs.parceiro_b_id) > 2 THEN 'Alto potencial - múltiplos parceiros'
      WHEN AVG(cs.score_sobreposicao) > 7 THEN 'Apresentação recomendada'
      WHEN AVG(cs.score_sobreposicao) > 5 THEN 'Análise mais profunda sugerida'
      ELSE 'Monitorar evolução'
    END as sugestao_acao
  FROM clientes_sobrepostos cs
  JOIN empresas e ON cs.cliente_sobreposto_id = e.id
  JOIN empresas ep ON cs.parceiro_b_id = ep.id
  WHERE cs.parceiro_a_id = find_clientes_sobrepostos_smart.parceiro_id
    OR cs.parceiro_b_id = find_clientes_sobrepostos_smart.parceiro_id
  GROUP BY cs.cliente_sobreposto_id, e.nome
  ORDER BY score_oportunidade DESC
  LIMIT find_clientes_sobrepostos_smart.limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 **Queries Especializadas PWA**

### 🔍 **Performance Monitoring**
```sql
-- Monitorar performance de cache PWA
SELECT 
  cache_key,
  access_count,
  EXTRACT(EPOCH FROM (now() - created_at))/3600 as hours_alive,
  access_count / GREATEST(EXTRACT(EPOCH FROM (now() - created_at))/3600, 1) as accesses_per_hour
FROM pwa_cache_control
WHERE created_at > now() - INTERVAL '24 hours'
ORDER BY access_count DESC;

-- Análise de sincronização
SELECT 
  table_name,
  COUNT(*) as pending_syncs,
  AVG(changes_count) as avg_changes,
  MAX(last_sync) as last_successful_sync
FROM sync_control
WHERE sync_status = 'pending'
GROUP BY table_name
ORDER BY pending_syncs DESC;
```

### 📱 **Dados Essenciais PWA**
```sql
-- View para dados essenciais offline
CREATE VIEW essential_data_pwa AS
SELECT 
  'empresa' as tipo,
  e.id,
  e.nome,
  e.tipo,
  NULL as valor_numerico,
  NULL as data_relevante
FROM empresas e
WHERE e.status = true

UNION ALL

SELECT 
  'indicador' as tipo,
  i.empresa_id as id,
  e.nome,
  i.tamanho::text as tipo,
  i.score_x as valor_numerico,
  i.data_avaliacao as data_relevante
FROM indicadores_parceiro i
JOIN empresas e ON i.empresa_id = e.id

UNION ALL

SELECT 
  'oportunidade' as tipo,
  o.id,
  o.nome_lead as nome,
  o.status as tipo,
  o.valor as valor_numerico,
  o.data_indicacao as data_relevante
FROM oportunidades o
WHERE o.created_at > now() - INTERVAL '90 days';
```

---

## 🎯 **Métricas de Performance PWA**

### 📊 **KPIs de Cache**
- **Hit Rate**: Meta > 85% para dados frequentes
- **Storage Usage**: Máximo 50MB por usuário
- **Sync Frequency**: Média < 5 minutos para dados críticos
- **Offline Capability**: 90% das funcionalidades disponíveis

### ⚡ **Otimizações Implementadas**
- **Índices Compostos**: Para queries complexas do dashboard
- **Views Materializadas**: Para relatórios frequentes
- **Particionamento**: Por data nas tabelas de auditoria
- **Compressão**: JSONB com dados otimizados

---

> **Banco de Dados PWA Aeight Partners** - Estrutura robusta, cache inteligente e sincronização automática preparada para experiência offline completa com performance otimizada.
