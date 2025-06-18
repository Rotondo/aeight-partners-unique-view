
# Aeight Partners - Banco de Dados, Storage e Auditoria Completa

Documentação exaustiva do banco de dados PostgreSQL/Supabase, incluindo o **Módulo Diário Executivo** e todas as estruturas de dados do sistema.

## 📑 Sumário

1. [Schema Completo do Banco](#schema-completo-do-banco)
2. [Módulo Diário Executivo - Database](#módulo-diário-executivo---database)
3. [Módulos Core - Database](#módulos-core---database)
4. [Módulo de Eventos - Database](#módulo-de-eventos---database)
5. [ENUMs e Validações](#enums-e-validações)
6. [Políticas RLS e Segurança](#políticas-rls-e-segurança)
7. [Triggers e Auditoria](#triggers-e-auditoria)
8. [Supabase Storage](#supabase-storage)
9. [Funções e Procedures](#funções-e-procedures)
10. [FAQ e Troubleshooting](#faq-e-troubleshooting)

---

## 1. Schema Completo do Banco

### 📊 Visão Geral
- **27 tabelas principais** (4 do Diário + 23 core)
- **15 ENUMs** para validação rigorosa
- **50+ políticas RLS** para segurança
- **15+ triggers** para auditoria
- **8+ funções customizadas**

---

## 2. Módulo Diário Executivo - Database

### 📅 **diario_agenda_eventos**
Eventos da agenda com integração Google/Outlook

```sql
CREATE TABLE diario_agenda_eventos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title TEXT NOT NULL,                    -- Título do evento
  description TEXT,                       -- Descrição detalhada
  start TIMESTAMP NOT NULL,               -- Data/hora início
  end TIMESTAMP NOT NULL,                 -- Data/hora fim
  status diario_event_status NOT NULL DEFAULT 'scheduled',
  partner_id UUID REFERENCES empresas(id), -- Parceiro vinculado
  source TEXT NOT NULL DEFAULT 'manual',  -- Fonte: manual/google/outlook
  external_id TEXT,                       -- ID externo (Google/Outlook)
  event_type TEXT,                        -- Tipo: reuniao/call/apresentacao
  related_crm_action_id UUID,             -- Vinculação com CRM
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_agenda_eventos_start ON diario_agenda_eventos(start);
CREATE INDEX idx_agenda_eventos_partner ON diario_agenda_eventos(partner_id);
CREATE INDEX idx_agenda_eventos_status ON diario_agenda_eventos(status);
```

**Campos Críticos:**
- `start/end`: Período do evento (validação: end > start)
- `status`: scheduled | completed | canceled | synced
- `source`: Origem do evento (manual | google | outlook)
- `external_id`: Para sincronização com calendários externos

### 📝 **diario_crm_acoes**
Ações de CRM com suporte multimídia

```sql
CREATE TABLE diario_crm_acoes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  description TEXT,                       -- Descrição da ação
  content TEXT NOT NULL,                  -- Conteúdo principal
  type crm_action_type NOT NULL,          -- audio | video | text
  status status_acao_crm_enum NOT NULL DEFAULT 'pendente',
  communication_method metodo_comunicacao, -- whatsapp | email | call
  partner_id UUID REFERENCES empresas(id), -- Parceiro envolvido
  user_id UUID NOT NULL,                  -- Usuário responsável
  next_step_date TIMESTAMP,               -- Próximo passo agendado
  next_steps TEXT,                        -- Descrição próximos passos
  metadata JSONB,                         -- Dados adicionais (arquivos, etc)
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Índices específicos
CREATE INDEX idx_crm_acoes_user ON diario_crm_acoes(user_id);
CREATE INDEX idx_crm_acoes_partner ON diario_crm_acoes(partner_id);
CREATE INDEX idx_crm_acoes_type ON diario_crm_acoes(type);
CREATE INDEX idx_crm_acoes_status ON diario_crm_acoes(status);
CREATE INDEX idx_crm_acoes_next_step ON diario_crm_acoes(next_step_date);
```

**Campos Específicos:**
- `type`: Tipo de conteúdo (audio/video/text)
- `metadata`: JSON com URLs de arquivos, durações, etc
- `next_steps`: Automáticamente vira evento na agenda
- `communication_method`: Canal de comunicação usado

### 📊 **diario_resumos**
Resumos executivos gerados automaticamente

```sql
CREATE TABLE diario_resumos (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  period diario_period NOT NULL,          -- week | month | quarter
  content TEXT,                           -- Conteúdo JSON estruturado
  export_url TEXT,                        -- URL do PDF/CSV gerado
  generated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Estrutura do content (JSON):
{
  "resumo_completo": { /* Objeto DiarioResumo */ },
  "detalhes_eventos": [ /* Array de eventos */ ],
  "detalhes_acoes": [ /* Array de ações CRM */ ],
  "criterios_busca": { /* Período e filtros */ },
  "metricas": {
    "total_eventos": 15,
    "total_acoes_crm": 23,
    "parceiros_envolvidos": 8,
    "eventos_realizados": 12,
    "acoes_concluidas": 18
  }
}
```

### 🤖 **diario_ia_sugestoes**
Sugestões da IA para aprovação

```sql
CREATE TABLE diario_ia_sugestoes (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  target_type TEXT NOT NULL,              -- evento | acao_crm | resumo
  target_id UUID,                         -- ID do registro relacionado
  field TEXT NOT NULL,                    -- Campo a ser melhorado
  suggestion TEXT NOT NULL,               -- Sugestão da IA
  status ia_suggestion_status NOT NULL DEFAULT 'pending',
  approved_by UUID,                       -- Quem aprovou/rejeitou
  approved_at TIMESTAMP,                  -- Quando foi decidido
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_ia_sugestoes_status ON diario_ia_sugestoes(status);
CREATE INDEX idx_ia_sugestoes_target ON diario_ia_sugestoes(target_type, target_id);
```

---

## 3. Módulos Core - Database

### 🏢 **empresas**
Parceiros, clientes e empresas do grupo

```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,                     -- Nome da empresa
  tipo company_type NOT NULL,             -- intragrupo | parceiro | cliente
  descricao TEXT,                         -- Descrição da empresa
  status BOOLEAN NOT NULL DEFAULT true,   -- Ativa/inativa
  created_at TIMESTAMP DEFAULT now()
);

-- Relacionamentos importantes
-- Uma empresa pode ter: contatos, oportunidades, indicadores, onepager, materiais
```

### 👥 **usuarios**
Usuários do sistema com controle de acesso

```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY,                    -- ID do Supabase Auth
  nome TEXT NOT NULL,
  email TEXT,
  papel user_role NOT NULL DEFAULT 'user', -- admin | manager | user
  empresa_id UUID REFERENCES empresas(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Papel 'admin' = acesso total + módulo diário
-- Papel 'manager' = gestão de equipe + relatórios
-- Papel 'user' = operação básica
```

### 💼 **oportunidades**
Pipeline de vendas e indicações

```sql
CREATE TABLE oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_lead TEXT NOT NULL,                -- Nome do lead/oportunidade
  empresa_origem_id UUID NOT NULL REFERENCES empresas(id),
  empresa_destino_id UUID NOT NULL REFERENCES empresas(id),
  contato_id UUID REFERENCES contatos(id),
  usuario_envio_id UUID REFERENCES usuarios(id),
  usuario_recebe_id UUID REFERENCES usuarios(id),
  valor NUMERIC,                          -- Valor estimado
  status opportunity_status DEFAULT 'em_contato',
  data_indicacao TIMESTAMP DEFAULT now(),
  data_fechamento TIMESTAMP,
  motivo_perda TEXT,                      -- Se perdeu, por que?
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Campos calculados via triggers:
-- - idade_oportunidade (dias desde criação)
-- - taxa_conversao (por usuário/empresa)
```

### 📞 **contatos**
Contatos das empresas parceiras

```sql
CREATE TABLE contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  created_at TIMESTAMP DEFAULT now(),
  
  -- Constraints
  CONSTRAINT contato_info_check CHECK (
    email IS NOT NULL OR telefone IS NOT NULL
  )
);
```

### 📋 **atividades_oportunidade**
Follow-ups e ações nas oportunidades

```sql
CREATE TABLE atividades_oportunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_prevista DATE NOT NULL,
  data_realizada DATE,
  concluida BOOLEAN NOT NULL DEFAULT false,
  usuario_responsavel_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Trigger para atualizar status da oportunidade automaticamente
```

### 📊 **indicadores_parceiro**
Métricas e quadrante de parceiros

```sql
CREATE TABLE indicadores_parceiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  potencial_leads INTEGER NOT NULL,       -- Eixo X
  base_clientes INTEGER,
  engajamento INTEGER NOT NULL,           -- Eixo Y  
  alinhamento INTEGER NOT NULL,
  potencial_investimento INTEGER NOT NULL,
  tamanho company_size NOT NULL,          -- PP | P | M | G | GG
  score_x NUMERIC,                        -- Calculado automaticamente
  score_y NUMERIC,                        -- Calculado automaticamente
  data_avaliacao TIMESTAMP DEFAULT now()
);

-- Fórmulas de cálculo:
-- score_x = (potencial_leads * 0.6) + (base_clientes * 0.4)
-- score_y = (engajamento * 0.5) + (alinhamento * 0.3) + (potencial_investimento * 0.2)
```

### 📄 **onepager**
One-pagers das empresas

```sql
CREATE TABLE onepager (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  nome TEXT,
  url TEXT,                               -- Site da empresa
  icp TEXT,                               -- Ideal Customer Profile
  oferta TEXT,                            -- Principais ofertas
  diferenciais TEXT,                      -- Diferenciais competitivos
  cases_sucesso TEXT,                     -- Cases de sucesso
  big_numbers TEXT,                       -- Números importantes
  ponto_forte TEXT,                       -- Principal força
  ponto_fraco TEXT,                       -- Principal fraqueza
  contato_nome TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  nota_quadrante NUMERIC,                 -- Posição no quadrante
  url_imagem TEXT,                        -- Logo da empresa
  arquivo_upload TEXT,                    -- Arquivo adicional
  data_upload TIMESTAMP DEFAULT now()
);
```

### 📚 **repositorio_materiais**
Repositório de documentos e materiais

```sql
CREATE TABLE repositorio_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  nome VARCHAR NOT NULL,
  tipo_arquivo VARCHAR NOT NULL,          -- pdf | docx | pptx | xlsx
  tag_categoria TEXT[],                   -- Array de tags
  url_arquivo TEXT,                       -- URL no Supabase Storage
  arquivo_upload BYTEA,                   -- Dados binários (deprecated)
  validade_contrato DATE,                 -- Para contratos
  usuario_upload UUID NOT NULL REFERENCES usuarios(id),
  data_upload TIMESTAMP DEFAULT now()
);

-- Estrutura no Storage: /empresa_id/categoria_id/arquivo
```

---

## 4. Módulo de Eventos - Database

### 🎪 **eventos**
Eventos de networking e apresentações

```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP,
  local VARCHAR,
  status VARCHAR DEFAULT 'planejado',      -- planejado | andamento | finalizado
  usuario_responsavel_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### 👤 **contatos_evento**
Contatos coletados em eventos

```sql
CREATE TABLE contatos_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id),
  nome VARCHAR,
  cargo VARCHAR,
  empresa VARCHAR,
  email VARCHAR,
  telefone VARCHAR,
  foto_cartao VARCHAR,                    -- URL da foto do cartão
  interesse_nivel INTEGER DEFAULT 3,      -- 1-5 (1=baixo, 5=alto)
  discussao TEXT,                         -- O que foi discutido
  proximos_passos TEXT,                   -- Ações definidas
  data_contato TIMESTAMP DEFAULT now(),
  sugestao_followup TIMESTAMP,            -- Quando fazer follow-up
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Integração com Diário:
-- Próximos passos viram eventos na agenda automaticamente
```

### 🎯 **Wishlist - Sistema de Apresentações**

#### **wishlist_items**
Solicitações de apresentação entre parceiros

```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_interessada_id UUID NOT NULL REFERENCES empresas(id),
  empresa_desejada_id UUID NOT NULL REFERENCES empresas(id),
  empresa_proprietaria_id UUID NOT NULL REFERENCES empresas(id), -- Quem tem o relacionamento
  motivo TEXT,                            -- Por que quer conhecer
  prioridade INTEGER DEFAULT 3,           -- 1-5
  status VARCHAR DEFAULT 'pendente',       -- pendente | aprovado | rejeitado | convertido
  data_solicitacao TIMESTAMP DEFAULT now(),
  data_resposta TIMESTAMP,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

#### **wishlist_apresentacoes**
Execução das apresentações

```sql
CREATE TABLE wishlist_apresentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id),
  empresa_facilitadora_id UUID NOT NULL REFERENCES empresas(id),
  data_apresentacao TIMESTAMP DEFAULT now(),
  tipo_apresentacao VARCHAR DEFAULT 'email', -- email | reuniao | evento | digital
  status_apresentacao VARCHAR DEFAULT 'pendente', -- pendente | agendada | realizada | cancelada
  tipo_solicitacao VARCHAR DEFAULT 'solicitacao', -- solicitacao | registro
  feedback TEXT,
  converteu_oportunidade BOOLEAN DEFAULT false,
  oportunidade_id UUID REFERENCES oportunidades(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 5. ENUMs e Validações

### 📋 **ENUMs do Sistema**

```sql
-- Tipos de empresa
CREATE TYPE company_type AS ENUM ('intragrupo', 'parceiro', 'cliente');

-- Status de oportunidade  
CREATE TYPE opportunity_status AS ENUM (
  'em_contato', 'negociando', 'ganho', 'perdido', 
  'Contato', 'Apresentado', 'Sem contato'
);

-- Papéis de usuário
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager');

-- Tamanhos de empresa
CREATE TYPE company_size AS ENUM ('PP', 'P', 'M', 'G', 'GG');
```

### 🔄 **ENUMs do Módulo Diário**

```sql
-- Status de eventos da agenda
CREATE TYPE diario_event_status AS ENUM (
  'scheduled', 'synced', 'completed', 'canceled'
);

-- Períodos de resumo
CREATE TYPE diario_period AS ENUM ('week', 'month', 'quarter');

-- Status de sugestões da IA
CREATE TYPE ia_suggestion_status AS ENUM (
  'pending', 'approved', 'rejected', 'applied'
);

-- Tipos de ação CRM
CREATE TYPE crm_action_type AS ENUM ('audio', 'video', 'text');

-- Status das ações CRM
CREATE TYPE status_acao_crm_enum AS ENUM (
  'pendente', 'em_andamento', 'concluida', 'cancelada'
);

-- Métodos de comunicação
CREATE TYPE metodo_comunicacao AS ENUM (
  'whatsapp', 'ligacao', 'email', 'encontro', 'reuniao_meet'
);
```

### ✅ **Validações e Constraints**

```sql
-- Validação de datas
ALTER TABLE diario_agenda_eventos 
ADD CONSTRAINT valid_event_dates CHECK (end > start);

-- Validação de prioridade
ALTER TABLE wishlist_items 
ADD CONSTRAINT valid_priority CHECK (prioridade BETWEEN 1 AND 5);

-- Validação de interesse
ALTER TABLE contatos_evento 
ADD CONSTRAINT valid_interest CHECK (interesse_nivel BETWEEN 1 AND 5);

-- Validação de scores
ALTER TABLE indicadores_parceiro 
ADD CONSTRAINT valid_scores CHECK (
  score_x >= 0 AND score_x <= 10 AND
  score_y >= 0 AND score_y <= 10
);
```

---

## 6. Políticas RLS e Segurança

### 🛡️ **Módulo Diário (Admin-only)**

```sql
-- Função para verificar admin
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies do diário (todas as tabelas)
CREATE POLICY "Admin access diario_agenda_eventos"
ON diario_agenda_eventos FOR ALL
TO authenticated
USING (is_admin_user());

CREATE POLICY "Admin access diario_crm_acoes"
ON diario_crm_acoes FOR ALL
TO authenticated
USING (is_admin_user());

-- Repetir para: diario_resumos, diario_ia_sugestoes
```

### 🔐 **Políticas Core**

```sql
-- Oportunidades: apenas envolvidos
CREATE POLICY "View own opportunities"
ON oportunidades FOR SELECT
USING (
  usuario_envio_id = auth.uid() OR 
  usuario_recebe_id = auth.uid() OR
  is_admin_user()
);

-- Materiais: empresa própria + admins
CREATE POLICY "View company materials"
ON repositorio_materiais FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE id = auth.uid()
  ) OR is_admin_user()
);

-- Contatos: empresa própria
CREATE POLICY "View company contacts"
ON contatos FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id FROM usuarios WHERE id = auth.uid()
  )
);
```

### 🎯 **Políticas Wishlist**

```sql
-- Visualizar wishlist própria
CREATE POLICY "View relevant wishlist"
ON wishlist_items FOR SELECT
USING (
  empresa_interessada_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()) OR
  empresa_proprietaria_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()) OR
  is_admin_user()
);

-- Aprovar apenas se proprietário do relacionamento
CREATE POLICY "Approve wishlist items"
ON wishlist_items FOR UPDATE
USING (
  empresa_proprietaria_id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid()) OR
  is_admin_user()
);
```

---

## 7. Triggers e Auditoria

### 📝 **Trigger de Updated_at**

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas relevantes
CREATE TRIGGER update_diario_agenda_eventos_updated_at
  BEFORE UPDATE ON diario_agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repetir para: atividades_oportunidade, contatos_evento, wishlist_*
```

### 🔍 **Auditoria Completa**

```sql
-- Tabela de auditoria universal
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL,               -- INSERT | UPDATE | DELETE
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMP DEFAULT now()
);

-- Função de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, record_id, operation, 
    old_values, new_values, user_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar em tabelas críticas
CREATE TRIGGER audit_diario_agenda_eventos
  AFTER INSERT OR UPDATE OR DELETE ON diario_agenda_eventos
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Repetir para: oportunidades, repositorio_materiais, etc.
```

### 🤖 **Triggers Específicos do Diário**

```sql
-- Criar evento na agenda automaticamente quando ação CRM tem próximo passo
CREATE OR REPLACE FUNCTION create_agenda_from_crm()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_step_date IS NOT NULL AND NEW.next_steps IS NOT NULL THEN
    INSERT INTO diario_agenda_eventos (
      title, description, start, end, 
      partner_id, source, related_crm_action_id
    ) VALUES (
      'Follow-up: ' || LEFT(NEW.next_steps, 50),
      NEW.next_steps,
      NEW.next_step_date,
      NEW.next_step_date + INTERVAL '1 hour',
      NEW.partner_id,
      'crm_generated',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agenda_from_crm_trigger
  AFTER INSERT OR UPDATE ON diario_crm_acoes
  FOR EACH ROW EXECUTE FUNCTION create_agenda_from_crm();
```

---

## 8. Supabase Storage

### 📁 **Estrutura de Buckets**

```
Storage Buckets:
├── materiais/                   # Repositório de materiais
│   ├── {empresa_id}/
│   │   ├── {categoria_id}/
│   │   │   ├── documento1.pdf
│   │   │   └── apresentacao1.pptx
│   │   └── onepagers/
│   │       └── onepager.pdf
│   └── publicos/               # Materiais públicos
├── diario/                     # Módulo diário
│   ├── audio/
│   │   └── {acao_id}/
│   │       └── gravacao.wav
│   ├── video/
│   │   └── {acao_id}/
│   │       └── video.webm
│   └── reports/
│       ├── resumos/
│       │   ├── {resumo_id}.pdf
│       │   └── {resumo_id}.csv
│       └── exports/
└── eventos/                    # Materiais de eventos
    ├── fotos_cartao/
    │   └── {contato_id}.jpg
    └── materiais_evento/
        └── {evento_id}/
```

### 🔐 **Políticas de Storage**

```sql
-- Leitura pública para materiais específicos
CREATE POLICY "Public read materials"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'materiais' AND (storage.foldername(name))[1] = 'publicos');

-- Upload apenas autenticado
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('materiais', 'diario', 'eventos'));

-- Exclusão apenas pelo dono ou admin
CREATE POLICY "Owner or admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id IN ('materiais', 'diario', 'eventos') AND
  (auth.uid()::text = owner OR is_admin_user())
);

-- Política específica do diário (admin-only)
CREATE POLICY "Admin only diario storage"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'diario' AND is_admin_user())
WITH CHECK (bucket_id = 'diario' AND is_admin_user());
```

### 📊 **Metadados de Arquivos**

```sql
-- Função para extrair metadados
CREATE OR REPLACE FUNCTION extract_file_metadata(
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT
) RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'path', file_path,
    'size', file_size,
    'mime_type', mime_type,
    'uploaded_at', now(),
    'uploaded_by', auth.uid(),
    'bucket', split_part(file_path, '/', 1)
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 9. Funções e Procedures

### 📊 **Estatísticas do Diário**

```sql
CREATE OR REPLACE FUNCTION get_diario_stats(
  user_id UUID,
  start_date TIMESTAMP DEFAULT now() - INTERVAL '30 days',
  end_date TIMESTAMP DEFAULT now()
)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_eventos', (
      SELECT COUNT(*) FROM diario_agenda_eventos 
      WHERE start >= start_date AND start <= end_date
    ),
    'eventos_realizados', (
      SELECT COUNT(*) FROM diario_agenda_eventos 
      WHERE start >= start_date AND start <= end_date AND status = 'completed'
    ),
    'total_acoes_crm', (
      SELECT COUNT(*) FROM diario_crm_acoes 
      WHERE created_at >= start_date AND created_at <= end_date
    ),
    'acoes_concluidas', (
      SELECT COUNT(*) FROM diario_crm_acoes 
      WHERE created_at >= start_date AND created_at <= end_date AND status = 'concluida'
    ),
    'parceiros_envolvidos', (
      SELECT COUNT(DISTINCT partner_id) FROM (
        SELECT partner_id FROM diario_agenda_eventos 
        WHERE start >= start_date AND start <= end_date AND partner_id IS NOT NULL
        UNION
        SELECT partner_id FROM diario_crm_acoes 
        WHERE created_at >= start_date AND created_at <= end_date AND partner_id IS NOT NULL
      ) t
    ),
    'sugestoes_pendentes', (
      SELECT COUNT(*) FROM diario_ia_sugestoes WHERE status = 'pending'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 🔄 **Sincronização de Calendários**

```sql
CREATE OR REPLACE FUNCTION sync_external_calendar_event(
  external_id TEXT,
  source TEXT,
  title TEXT,
  description TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  partner_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
  partner_id UUID;
BEGIN
  -- Buscar parceiro pelo email
  IF partner_email IS NOT NULL THEN
    SELECT e.id INTO partner_id
    FROM empresas e
    JOIN contatos c ON e.id = c.empresa_id
    WHERE c.email = partner_email
    LIMIT 1;
  END IF;
  
  -- Inserir ou atualizar evento
  INSERT INTO diario_agenda_eventos (
    external_id, source, title, description, 
    start, end, partner_id, status
  ) VALUES (
    external_id, source, title, description,
    start_time, end_time, partner_id, 'synced'
  )
  ON CONFLICT (external_id, source) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    start = EXCLUDED.start,
    end = EXCLUDED.end,
    partner_id = EXCLUDED.partner_id,
    updated_at = now()
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 📈 **Cálculo de Indicadores**

```sql
CREATE OR REPLACE FUNCTION calculate_partner_scores(empresa_id UUID)
RETURNS JSONB AS $$
DECLARE
  indicators RECORD;
  score_x NUMERIC;
  score_y NUMERIC;
BEGIN
  -- Buscar indicadores atuais
  SELECT * INTO indicators
  FROM indicadores_parceiro
  WHERE empresa_id = empresa_id
  ORDER BY data_avaliacao DESC
  LIMIT 1;
  
  IF indicators IS NULL THEN
    RETURN jsonb_build_object('error', 'Indicadores not found');
  END IF;
  
  -- Calcular scores
  score_x := (indicators.potencial_leads * 0.6) + (COALESCE(indicators.base_clientes, 0) * 0.4);
  score_y := (indicators.engajamento * 0.5) + (indicators.alinhamento * 0.3) + (indicators.potencial_investimento * 0.2);
  
  -- Atualizar na tabela
  UPDATE indicadores_parceiro 
  SET score_x = score_x, score_y = score_y
  WHERE id = indicators.id;
  
  RETURN jsonb_build_object(
    'score_x', score_x,
    'score_y', score_y,
    'quadrante', 
    CASE 
      WHEN score_x >= 5 AND score_y >= 5 THEN 'Alto Potencial'
      WHEN score_x >= 5 AND score_y < 5 THEN 'Desenvolver'
      WHEN score_x < 5 AND score_y >= 5 THEN 'Manter'
      ELSE 'Avaliar'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 10. FAQ e Troubleshooting

### ❓ **Perguntas Frequentes**

**P: Como criar um novo evento no diário via SQL?**
```sql
INSERT INTO diario_agenda_eventos (title, start, end, partner_id)
VALUES ('Reunião estratégica', '2025-01-20 14:00:00', '2025-01-20 15:00:00', 'uuid-do-parceiro');
```

**P: Como consultar todas as ações CRM de um parceiro?**
```sql
SELECT * FROM diario_crm_acoes 
WHERE partner_id = 'uuid-do-parceiro'
ORDER BY created_at DESC;
```

**P: Como gerar um resumo manual?**
```sql
SELECT get_diario_stats(auth.uid(), '2025-01-01', '2025-01-31');
```

**P: Como ver logs de auditoria de uma tabela?**
```sql
SELECT * FROM audit_log 
WHERE table_name = 'diario_agenda_eventos'
ORDER BY timestamp DESC;
```

### 🔧 **Troubleshooting**

**Erro: RLS policy denying access**
- Verificar se usuário tem papel correto (`is_admin_user()` para diário)
- Confirmar se políticas estão ativadas na tabela
- Checar se `auth.uid()` retorna valor válido

**Erro: Foreign key constraint**
- Verificar se IDs referenciados existem
- Confirmar se tabelas relacionadas têm dados válidos
- Checar se campos UUID não estão como NULL

**Erro: Enum value not valid**
- Verificar valores permitidos em cada ENUM
- Confirmar se não há problemas de case-sensitive
- Validar se ENUM foi criado corretamente

**Storage upload failing**
- Verificar políticas de INSERT no bucket
- Confirmar se usuário está autenticado
- Checar tamanho e tipo de arquivo

### 📋 **Queries Úteis para Debug**

```sql
-- Ver todas as políticas RLS de uma tabela
SELECT schemaname, tablename, policyname, cmd, roles, qual 
FROM pg_policies 
WHERE tablename = 'diario_agenda_eventos';

-- Ver usuário atual e suas permissões
SELECT auth.uid(), 
       (SELECT papel FROM usuarios WHERE id = auth.uid()),
       is_admin_user();

-- Ver estrutura completa de uma tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'diario_crm_acoes'
ORDER BY ordinal_position;

-- Ver todos os ENUMs do sistema
SELECT t.typname, e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%enum%' OR t.typname LIKE 'diario_%'
ORDER BY t.typname, e.enumsortorder;
```

---

## 📊 **Métricas de Performance**

### 📈 **Índices Criados (50+)**
- Todos os campos de JOIN têm índices
- Campos de data para consultas temporais
- Status/enum para filtros frequentes
- Texto para busca (quando necessário)

### ⚡ **Otimizações Implementadas**
- Paginação em todas as listas
- Queries específicas (não SELECT *)
- Uso de JSONB para dados semi-estruturados
- Connection pooling via Supabase

---

> **Banco de Dados Rotondo Partners** - Estrutura robusta, segura e preparada para escala com auditoria completa e performance otimizada.
