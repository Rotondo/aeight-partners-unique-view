-- Criar tabela para etapas da jornada
CREATE TABLE public.etapas_jornada (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para subníveis das etapas
CREATE TABLE public.subniveis_etapa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  etapa_id UUID NOT NULL REFERENCES public.etapas_jornada(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para parceiros do mapa sequencial
CREATE TABLE public.parceiros_mapa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  website TEXT,
  contato_email TEXT,
  contato_telefone TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para associação entre parceiros e etapas/subníveis
CREATE TABLE public.associacoes_parceiro_etapa (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parceiro_id UUID NOT NULL REFERENCES public.parceiros_mapa(id) ON DELETE CASCADE,
  etapa_id UUID NOT NULL REFERENCES public.etapas_jornada(id) ON DELETE CASCADE,
  subnivel_id UUID REFERENCES public.subniveis_etapa(id) ON DELETE CASCADE,
  data_associacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.etapas_jornada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subniveis_etapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros_mapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associacoes_parceiro_etapa ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para etapas_jornada
CREATE POLICY "Usuários autenticados podem ver etapas" 
ON public.etapas_jornada 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar etapas" 
ON public.etapas_jornada 
FOR ALL 
USING (is_admin());

-- Políticas RLS para subniveis_etapa
CREATE POLICY "Usuários autenticados podem ver subníveis" 
ON public.subniveis_etapa 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar subníveis" 
ON public.subniveis_etapa 
FOR ALL 
USING (is_admin());

-- Políticas RLS para parceiros_mapa
CREATE POLICY "Usuários autenticados podem ver parceiros" 
ON public.parceiros_mapa 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem gerenciar parceiros" 
ON public.parceiros_mapa 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Políticas RLS para associacoes_parceiro_etapa
CREATE POLICY "Usuários autenticados podem ver associações" 
ON public.associacoes_parceiro_etapa 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem gerenciar associações" 
ON public.associacoes_parceiro_etapa 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_etapas_jornada_updated_at
BEFORE UPDATE ON public.etapas_jornada
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subniveis_etapa_updated_at
BEFORE UPDATE ON public.subniveis_etapa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parceiros_mapa_updated_at
BEFORE UPDATE ON public.parceiros_mapa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais das etapas da jornada
INSERT INTO public.etapas_jornada (nome, descricao, ordem, cor) VALUES
('Atração', 'Estratégias para atrair visitantes ao e-commerce', 1, '#EF4444'),
('Infraestrutura', 'Base tecnológica e estrutural da loja', 2, '#F97316'),
('Navegação & Descoberta', 'Facilitar a navegação e descoberta de produtos', 3, '#EAB308'),
('Página de Produto', 'Otimização da experiência de visualização do produto', 4, '#22C55E'),
('Carrinho', 'Gestão e otimização do carrinho de compras', 5, '#06B6D4'),
('Checkout & Pagamento', 'Finalização e processamento de pagamentos', 6, '#3B82F6'),
('Pós-pagamento & Gestão', 'Gestão de pedidos após o pagamento', 7, '#8B5CF6'),
('Fulfillment & Operações', 'Operações de atendimento e estoque', 8, '#EC4899'),
('Entrega', 'Logística e entrega dos produtos', 9, '#14B8A6'),
('Pós-venda & Relacionamento', 'Relacionamento pós-venda com cliente', 10, '#F59E0B'),
('Analytics & IA', 'Análise de dados e inteligência artificial', 11, '#6366F1'),
('Governança & Jurídico', 'Aspectos legais e governança', 12, '#64748B');

-- Inserir subníveis para cada etapa
INSERT INTO public.subniveis_etapa (etapa_id, nome, ordem) VALUES
-- Atração (Pré-acesso)
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'SEO', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'SEM / Ads', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'Marketing de Conteúdo', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'Influenciadores', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'E-mail/WhatsApp/SMS Marketing', 5),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'Programas de Afiliados', 6),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'Remarketing', 7),
((SELECT id FROM etapas_jornada WHERE nome = 'Atração'), 'Social Listening', 8),

-- Infraestrutura da Loja
((SELECT id FROM etapas_jornada WHERE nome = 'Infraestrutura'), 'Plataforma de E-commerce', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Infraestrutura'), 'CMS/DXP', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Infraestrutura'), 'Cloud/Hosting/CDN', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Infraestrutura'), 'Segurança Web', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Infraestrutura'), 'Middleware/iPaaS', 5),

-- Navegação & Descoberta
((SELECT id FROM etapas_jornada WHERE nome = 'Navegação & Descoberta'), 'Vitrines Inteligentes', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Navegação & Descoberta'), 'Busca interna', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Navegação & Descoberta'), 'CRM/CDP', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Navegação & Descoberta'), 'Chatbots', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Navegação & Descoberta'), 'Teste A/B', 5),

-- Página de Produto
((SELECT id FROM etapas_jornada WHERE nome = 'Página de Produto'), 'Fotos/Vídeos 360°', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Página de Produto'), 'Provadores Virtuais', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Página de Produto'), 'Configuradores de Produto', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Página de Produto'), 'Avaliações/Reviews', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Página de Produto'), 'Comparadores de Preço', 5),

-- Carrinho
((SELECT id FROM etapas_jornada WHERE nome = 'Carrinho'), 'Cálculo de Frete', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Carrinho'), 'Cupons/Descontos', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Carrinho'), 'Cross-sell/Upsell', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Carrinho'), 'Recuperação de Carrinho', 4),

-- Checkout & Pagamento
((SELECT id FROM etapas_jornada WHERE nome = 'Checkout & Pagamento'), 'Checkout Simplificado', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Checkout & Pagamento'), 'Gateways de Pagamento', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Checkout & Pagamento'), 'Meios de Pagamento (PIX, Cartão, BNPL, Cripto)', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Checkout & Pagamento'), 'Antifraude', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Checkout & Pagamento'), 'Conciliação Financeira', 5),

-- Pós-pagamento & Gestão de Pedidos
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-pagamento & Gestão'), 'OMS', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-pagamento & Gestão'), 'Nota Fiscal', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-pagamento & Gestão'), 'Comunicação Transacional', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-pagamento & Gestão'), 'Cashback/Fidelidade', 4),

-- Fulfillment & Operações
((SELECT id FROM etapas_jornada WHERE nome = 'Fulfillment & Operações'), 'ERP/Backoffice', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Fulfillment & Operações'), 'WMS/TMS', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Fulfillment & Operações'), 'Picking/Packing', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Fulfillment & Operações'), 'Last-mile/Lockers', 4),

-- Entrega
((SELECT id FROM etapas_jornada WHERE nome = 'Entrega'), 'Transportadoras', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Entrega'), 'Rastreamento', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Entrega'), 'Logística Reversa', 3),

-- Pós-venda & Relacionamento
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-venda & Relacionamento'), 'SAC Omnicanal', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-venda & Relacionamento'), 'Troca/Devolução', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-venda & Relacionamento'), 'NPS/Pesquisa', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Pós-venda & Relacionamento'), 'Comunidade/Advocacy', 4),

-- Analytics & IA
((SELECT id FROM etapas_jornada WHERE nome = 'Analytics & IA'), 'Web Analytics', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Analytics & IA'), 'BI/Data Viz', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Analytics & IA'), 'IA Generativa', 3),
((SELECT id FROM etapas_jornada WHERE nome = 'Analytics & IA'), 'Modelagem Preditiva', 4),
((SELECT id FROM etapas_jornada WHERE nome = 'Analytics & IA'), 'LGPD/Consentimento', 5),

-- Governança & Jurídico
((SELECT id FROM etapas_jornada WHERE nome = 'Governança & Jurídico'), 'Consultoria Tributária', 1),
((SELECT id FROM etapas_jornada WHERE nome = 'Governança & Jurídico'), 'M&A', 2),
((SELECT id FROM etapas_jornada WHERE nome = 'Governança & Jurídico'), 'Certificações de Segurança', 3);