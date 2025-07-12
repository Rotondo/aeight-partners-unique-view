
# A&eight Partners - Documentação de Dados

## 📊 Estrutura do Banco de Dados

### Visão Geral
O sistema utiliza PostgreSQL através do Supabase, com Row Level Security (RLS) ativado para todas as tabelas sensíveis. A arquitetura de dados foi projetada para suportar multi-tenancy por empresa, garantindo isolamento e segurança dos dados.

## 🏗️ Esquema Principal

### 👥 Gestão de Usuários e Empresas

#### `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE,
  papel user_role NOT NULL DEFAULT 'user',
  empresa_id UUID REFERENCES empresas(id),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Campos:**
- `id`: Identificador único do usuário
- `nome`: Nome completo do usuário
- `email`: Email para login e comunicação
- `papel`: Enum ('admin', 'user') - controla permissões
- `empresa_id`: Referência à empresa do usuário
- `ativo`: Status ativo/inativo do usuário

**RLS Policies:**
- Usuários podem visualizar e editar apenas seu próprio perfil
- Admins têm acesso total a todos os usuários

#### `empresas`
```sql
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo empresa_tipo NOT NULL,
  descricao TEXT,
  status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Tipos de Empresa:**
- `parceiro`: Empresa parceira do ecossistema
- `cliente`: Empresa cliente
- `prospecto`: Empresa em prospecção

### 🤝 Sistema de Oportunidades

#### `oportunidades`
```sql
CREATE TABLE oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_lead TEXT NOT NULL,
  valor NUMERIC,
  status opportunity_status DEFAULT 'em_contato',
  empresa_origem_id UUID NOT NULL REFERENCES empresas(id),
  empresa_destino_id UUID NOT NULL REFERENCES empresas(id),
  usuario_envio_id UUID REFERENCES usuarios(id),
  usuario_recebe_id UUID REFERENCES usuarios(id),
  data_indicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fechamento TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  motivo_perda TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Status Possíveis:**
- `em_contato`: Contato inicial realizado
- `apresentacao_feita`: Apresentação realizada
- `proposta_enviada`: Proposta comercial enviada
- `negociacao`: Em processo de negociação
- `fechada_ganha`: Oportunidade convertida
- `fechada_perdida`: Oportunidade perdida
- `cancelada`: Processo cancelado

#### `atividades_oportunidade`
```sql
CREATE TABLE atividades_oportunidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_prevista DATE NOT NULL,
  data_realizada DATE,
  concluida BOOLEAN DEFAULT false,
  usuario_responsavel_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 🗺️ Mapa de Parceiros - Jornada do E-commerce

#### `etapas_jornada`
```sql
CREATE TABLE etapas_jornada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Etapas Padrão da Jornada:**
1. **Atração** - Estratégias para atrair visitantes
2. **Infraestrutura** - Base tecnológica da loja
3. **Navegação & Descoberta** - UX de navegação
4. **Página de Produto** - Experiência do produto
5. **Carrinho** - Gestão do carrinho
6. **Checkout & Pagamento** - Finalização
7. **Pós-pagamento & Gestão** - Gestão de pedidos
8. **Fulfillment & Operações** - Operações
9. **Entrega** - Logística
10. **Pós-venda & Relacionamento** - CRM
11. **Analytics & IA** - Dados e insights
12. **Governança & Jurídico** - Compliance

#### `subniveis_etapa`
```sql
CREATE TABLE subniveis_etapa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID NOT NULL REFERENCES etapas_jornada(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Exemplos de Subníveis:**
- **Atração**: SEO, SEM/Ads, Marketing de Conteúdo, Influenciadores
- **Checkout**: Gateways, Meios de Pagamento, Antifraude
- **Analytics**: Web Analytics, BI/Data Viz, IA Generativa

#### `parceiros_mapa`
```sql
CREATE TABLE parceiros_mapa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_empresa_parceiro UNIQUE (empresa_id)
);
```

#### `associacoes_parceiro_etapa`
```sql
CREATE TABLE associacoes_parceiro_etapa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parceiro_id UUID NOT NULL REFERENCES parceiros_mapa(id) ON DELETE CASCADE,
  etapa_id UUID NOT NULL REFERENCES etapas_jornada(id) ON DELETE CASCADE,
  subnivel_id UUID REFERENCES subniveis_etapa(id) ON DELETE CASCADE,
  data_associacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 📋 Sistema Wishlist

#### `wishlist_items`
```sql
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_proprietaria_id UUID NOT NULL REFERENCES empresas(id),
  empresa_desejada_id UUID NOT NULL REFERENCES empresas(id),
  empresa_interessada_id UUID NOT NULL REFERENCES empresas(id),
  status VARCHAR DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_analise', 'aprovada', 'rejeitada')),
  prioridade INTEGER DEFAULT 3 CHECK (prioridade BETWEEN 1 AND 5),
  motivo TEXT,
  observacoes TEXT,
  data_solicitacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_resposta TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `wishlist_apresentacoes`
```sql
CREATE TABLE wishlist_apresentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_item_id UUID NOT NULL REFERENCES wishlist_items(id),
  empresa_facilitadora_id UUID NOT NULL REFERENCES empresas(id),
  tipo_solicitacao VARCHAR DEFAULT 'solicitacao' CHECK (tipo_solicitacao IN ('solicitacao', 'oferta')),
  tipo_apresentacao VARCHAR DEFAULT 'email' CHECK (tipo_apresentacao IN ('email', 'reuniao', 'evento')),
  status_apresentacao VARCHAR DEFAULT 'pendente' CHECK (status_apresentacao IN ('pendente', 'realizada', 'cancelada')),
  data_apresentacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  converteu_oportunidade BOOLEAN DEFAULT false,
  oportunidade_id UUID REFERENCES oportunidades(id),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 📊 Indicadores e Métricas

#### `indicadores_parceiro`
```sql
CREATE TABLE indicadores_parceiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  tamanho empresa_tamanho NOT NULL,
  potencial_leads INTEGER NOT NULL,
  base_clientes INTEGER,
  engajamento INTEGER NOT NULL CHECK (engajamento BETWEEN 1 AND 10),
  alinhamento INTEGER NOT NULL CHECK (alinhamento BETWEEN 1 AND 10),
  potencial_investimento INTEGER NOT NULL CHECK (potencial_investimento BETWEEN 1 AND 10),
  score_x NUMERIC,
  score_y NUMERIC,
  data_avaliacao TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `metas_oportunidades`
```sql
CREATE TABLE metas_oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_meta VARCHAR CHECK (tipo_meta IN ('quantidade', 'valor')),
  valor_meta NUMERIC NOT NULL,
  periodo VARCHAR CHECK (periodo IN ('mensal', 'trimestral')),
  ano INTEGER NOT NULL,
  mes INTEGER CHECK (mes BETWEEN 1 AND 12),
  trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 4),
  segmento_grupo VARCHAR CHECK (segmento_grupo IN ('intragrupo', 'de_fora_para_dentro', 'tudo')),
  status_oportunidade VARCHAR DEFAULT 'todas' CHECK (status_oportunidade IN ('todas', 'ganhas')),
  empresa_id UUID REFERENCES empresas(id),
  usuario_criador_id UUID REFERENCES usuarios(id),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 📄 Repositório e Materiais

#### `categorias`
```sql
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `repositorio_materiais`
```sql
CREATE TABLE repositorio_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  nome VARCHAR NOT NULL,
  tipo_arquivo VARCHAR NOT NULL,
  url_arquivo TEXT,
  arquivo_upload BYTEA,
  tag_categoria TEXT[],
  validade_contrato DATE,
  data_upload TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  usuario_upload UUID NOT NULL
);
```

#### `onepager`
```sql
CREATE TABLE onepager (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id),
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  nome TEXT,
  oferta TEXT,
  icp TEXT,
  diferenciais TEXT,
  ponto_forte TEXT,
  ponto_fraco TEXT,
  cases_sucesso TEXT,
  big_numbers TEXT,
  contato_nome TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  url TEXT,
  url_imagem TEXT,
  arquivo_upload TEXT,
  nota_quadrante NUMERIC,
  data_upload TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 📅 Eventos e Contatos

#### `eventos`
```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  descricao TEXT,
  local VARCHAR,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
  usuario_responsavel_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `contatos_evento`
```sql
CREATE TABLE contatos_evento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id),
  nome VARCHAR,
  email VARCHAR,
  telefone VARCHAR,
  empresa VARCHAR,
  cargo VARCHAR,
  interesse_nivel INTEGER DEFAULT 3 CHECK (interesse_nivel BETWEEN 1 AND 5),
  discussao TEXT,
  proximos_passos TEXT,
  sugestao_followup TIMESTAMP WITH TIME ZONE,
  foto_cartao VARCHAR,
  observacoes TEXT,
  data_contato TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 🔐 Políticas de Segurança (RLS)

### Padrões de Acesso

#### Multi-tenancy por Empresa
```sql
-- Política padrão para isolamento por empresa
CREATE POLICY "users_can_view_own_company_data" 
ON table_name FOR SELECT 
USING (
  empresa_id = (
    SELECT empresa_id FROM usuarios WHERE id = auth.uid()
  )
);
```

#### Controle Administrativo
```sql
-- Admins têm acesso total
CREATE POLICY "admins_full_access" 
ON table_name FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND papel = 'admin' 
    AND ativo = true
  )
);
```

#### Acesso Específico por Oportunidade
```sql
-- Função para verificar acesso a oportunidade
CREATE OR REPLACE FUNCTION can_access_oportunidade(oportunidade_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM oportunidades o
    JOIN usuarios u ON u.id = auth.uid()
    WHERE o.id = oportunidade_id
    AND (
      o.usuario_envio_id = auth.uid() OR 
      o.usuario_recebe_id = auth.uid() OR
      u.papel = 'admin'
    )
    AND u.ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Funções e Procedures

### Funções de Utilidade
```sql
-- Atualização automática de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verificação de pertencimento à empresa
CREATE OR REPLACE FUNCTION user_belongs_to_empresa(empresa_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND empresa_id = user_belongs_to_empresa.empresa_id
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Triggers Automáticos
```sql
-- Trigger para updated_at em todas as tabelas relevantes
CREATE TRIGGER update_etapas_jornada_updated_at
BEFORE UPDATE ON etapas_jornada
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parceiros_mapa_updated_at
BEFORE UPDATE ON parceiros_mapa
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 📈 Índices e Performance

### Índices Principais
```sql
-- Índices para performance em consultas frequentes
CREATE INDEX idx_oportunidades_empresa_origem ON oportunidades(empresa_origem_id);
CREATE INDEX idx_oportunidades_empresa_destino ON oportunidades(empresa_destino_id);
CREATE INDEX idx_oportunidades_status ON oportunidades(status);
CREATE INDEX idx_oportunidades_data_indicacao ON oportunidades(data_indicacao);

-- Índices compostos para queries complexas
CREATE INDEX idx_oportunidades_empresa_status ON oportunidades(empresa_origem_id, status);
CREATE INDEX idx_associacoes_parceiro_etapa ON associacoes_parceiro_etapa(parceiro_id, etapa_id);

-- Índices para o sistema de mapa de parceiros
CREATE INDEX idx_parceiros_mapa_empresa ON parceiros_mapa(empresa_id);
CREATE INDEX idx_parceiros_mapa_status ON parceiros_mapa(status);
CREATE INDEX idx_etapas_ordem ON etapas_jornada(ordem);
CREATE INDEX idx_subniveis_etapa_ordem ON subniveis_etapa(etapa_id, ordem);
```

## 🔄 Migrations e Versionamento

### Estrutura de Migrations
```
supabase/migrations/
├── 20250708225247_create_mapa_parceiros_schema.sql
├── 20250709010544_add_empresa_foreign_keys.sql
├── 20250709010618_cleanup_parceiros_mapa.sql
└── [timestamp]_[description].sql
```

### Seed Data
```sql
-- Dados iniciais das etapas da jornada
INSERT INTO etapas_jornada (nome, descricao, ordem, cor) VALUES
('Atração', 'Estratégias para atrair visitantes ao e-commerce', 1, '#EF4444'),
('Infraestrutura', 'Base tecnológica e estrutural da loja', 2, '#F97316'),
-- ... demais etapas
('Governança & Jurídico', 'Aspectos legais e governança', 12, '#64748B');
```

## 📊 Queries de Análise Comuns

### Dashboard Principal
```sql
-- Métricas básicas do dashboard
SELECT 
  COUNT(*) FILTER (WHERE status = 'fechada_ganha') as oportunidades_ganhas,
  COUNT(*) FILTER (WHERE status IN ('em_contato', 'apresentacao_feita', 'proposta_enviada', 'negociacao')) as oportunidades_ativas,
  SUM(valor) FILTER (WHERE status = 'fechada_ganha') as valor_total_ganho,
  AVG(valor) FILTER (WHERE status = 'fechada_ganha') as ticket_medio
FROM oportunidades
WHERE empresa_origem_id = $1 
AND data_indicacao >= $2;
```

### Análise do Mapa de Parceiros
```sql
-- Contagem de parceiros por etapa
SELECT 
  e.id,
  e.nome,
  e.ordem,
  COUNT(DISTINCT ape.parceiro_id) as total_parceiros
FROM etapas_jornada e
LEFT JOIN associacoes_parceiro_etapa ape ON e.id = ape.etapa_id AND ape.ativo = true
LEFT JOIN parceiros_mapa pm ON ape.parceiro_id = pm.id AND pm.status = 'ativo'
WHERE e.ativo = true
GROUP BY e.id, e.nome, e.ordem
ORDER BY e.ordem;
```

### Performance de Parceiros
```sql
-- Ranking de parceiros por performance
SELECT 
  emp.nome,
  pm.performance_score,
  COUNT(o.id) as total_oportunidades,
  COUNT(o.id) FILTER (WHERE o.status = 'fechada_ganha') as oportunidades_ganhas,
  ROUND(
    COUNT(o.id) FILTER (WHERE o.status = 'fechada_ganha')::numeric / 
    NULLIF(COUNT(o.id), 0) * 100, 2
  ) as taxa_conversao
FROM parceiros_mapa pm
JOIN empresas emp ON pm.empresa_id = emp.id
LEFT JOIN oportunidades o ON emp.id = o.empresa_origem_id
WHERE pm.status = 'ativo'
GROUP BY emp.nome, pm.performance_score
ORDER BY pm.performance_score DESC, taxa_conversao DESC;
```

## 🚀 Backup e Recovery

### Estratégia de Backup
- **Backup Automático**: Diário via Supabase (7 dias de retenção)
- **Point-in-time Recovery**: Últimas 7 dias
- **Export Manual**: Scripts SQL para backup completo

### Monitoramento de Integridade
```sql
-- Verificação de integridade referencial
SELECT 
  'parceiros_mapa' as tabela,
  COUNT(*) as registros_orfaos
FROM parceiros_mapa pm
LEFT JOIN empresas e ON pm.empresa_id = e.id
WHERE e.id IS NULL

UNION ALL

SELECT 
  'associacoes_parceiro_etapa' as tabela,
  COUNT(*) as registros_orfaos
FROM associacoes_parceiro_etapa ape
LEFT JOIN parceiros_mapa pm ON ape.parceiro_id = pm.id
WHERE pm.id IS NULL;
```

---

*Documentação de dados atualizada - Sistema A&eight Partners v2.0*

**Última atualização**: Janeiro 2025  
**Versão do Schema**: 2.0  
**Responsável**: Equipe de Desenvolvimento A&eight
