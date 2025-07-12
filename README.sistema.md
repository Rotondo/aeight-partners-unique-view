
# Sistema A&eight Partners - Documentação Técnica

## 📋 Visão Geral do Sistema

O **A&eight Partners Unique View** é uma plataforma integrada de gestão de parcerias empresariais, desenvolvida especificamente para o Grupo A&eight. O sistema oferece uma solução completa para gerenciamento de relacionamentos, oportunidades de negócio e análise estratégica de parcerias.

## 🏗️ Arquitetura do Sistema

### Frontend
- **Framework**: React 18 com TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Estado**: TanStack React Query para cache e sincronização
- **Roteamento**: React Router Dom v6
- **Build Tool**: Vite para desenvolvimento e build otimizado

### Backend
- **BaaS**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Banco de Dados**: PostgreSQL com Row Level Security (RLS)
- **Autenticação**: Supabase Auth com JWT
- **Storage**: Supabase Storage para arquivos

### Componentes UI
- **Design System**: Shadcn/ui baseado em Radix UI
- **Gráficos**: Recharts para visualizações de dados
- **Ícones**: Lucide React
- **Animações**: CSS Transitions + Tailwind

## 📊 Estrutura de Dados Principal

### Tabelas Core
```sql
-- Usuários e empresas
usuarios (id, nome, email, papel, empresa_id, ativo)
empresas (id, nome, tipo, descricao, status)
contatos (id, nome, email, telefone, empresa_id)

-- Oportunidades e atividades
oportunidades (id, nome_lead, valor, status, empresa_origem_id, empresa_destino_id)
atividades_oportunidade (id, titulo, descricao, data_prevista, concluida)

-- Mapa de parceiros
etapas_jornada (id, nome, descricao, ordem, cor, ativo)
subniveis_etapa (id, etapa_id, nome, ordem, ativo)
parceiros_mapa (id, empresa_id, status, performance_score)
associacoes_parceiro_etapa (id, parceiro_id, etapa_id, subnivel_id)

-- Wishlist e relacionamentos
wishlist_items (id, empresa_proprietaria_id, empresa_desejada_id, status)
empresa_clientes (id, empresa_proprietaria_id, empresa_cliente_id)
```

### Políticas de Segurança (RLS)
- **Isolamento por empresa**: Usuários só acessam dados de sua empresa
- **Controle administrativo**: Admins têm acesso global
- **Auditoria**: Logs automáticos de alterações críticas

## 🔄 Funcionalidades Principais

### 1. Dashboard e Analytics
- **Métricas em tempo real**: Oportunidades, conversões, valores
- **Gráficos interativos**: Recharts com filtros dinâmicos
- **Exportação**: PDF e Excel para relatórios
- **Análise temporal**: Comparações por período

### 2. Gestão de Oportunidades
- **Fluxo completo**: Da indicação ao fechamento
- **Pipeline visual**: Kanban board com drag & drop
- **Atividades**: Tasks e follow-ups organizados
- **Histórico**: Auditoria completa de mudanças

### 3. Mapa de Parceiros
- **Jornada estruturada**: 12 etapas + subníveis
- **Visualização interativa**: Grid, lista e jornada
- **Associações**: Vinculação parceiro-etapa
- **Gaps analysis**: Identificação de lacunas

### 4. Módulo Administrativo do Mapa
- **CRUD completo**: Criar, editar, excluir etapas/subníveis
- **Reordenação**: Drag & drop ou botões up/down
- **Status toggle**: Ativar/desativar elementos
- **Validação**: Integridade referencial mantida
- **Interface responsiva**: Desktop e mobile

### 5. Wishlist e Matching
- **Demandas estruturadas**: Sistema de solicitações
- **Algoritmo de matching**: Conexão automática
- **Apresentações**: Workflow de introduções
- **Feedback loop**: Acompanhamento de resultados

### 6. Repositório de Materiais
- **Upload seguro**: Supabase Storage
- **Categorização**: Tags e filtros avançados
- **Controle de acesso**: Por empresa e categoria
- **Versionamento**: Histórico de uploads

## 🛡️ Segurança e Compliance

### Autenticação
```typescript
// Fluxo de autenticação
const { data, error } = await supabase.auth.signInWithPassword({
  email: user.email,
  password: user.password
});
```

### Row Level Security
```sql
-- Exemplo de política RLS
CREATE POLICY "Users can view their company data" 
ON oportunidades FOR SELECT 
USING (
  empresa_origem_id IN (
    SELECT empresa_id FROM usuarios WHERE id = auth.uid()
  )
);
```

### Validação de Dados
- **Frontend**: Zod schemas para validação
- **Backend**: Constraints e triggers PostgreSQL
- **Sanitização**: Input sanitization automática

## 📱 Responsividade e UX

### Breakpoints Tailwind
- **sm**: 640px+ (mobile landscape)
- **md**: 768px+ (tablet)  
- **lg**: 1024px+ (desktop)
- **xl**: 1280px+ (large desktop)

### Componentes Adaptativos
```typescript
// Exemplo de componente responsivo
const MapaParceirosSidebar = () => {
  const isMobile = useIsMobile();
  
  return (
    <aside className={`${isMobile ? 'w-full' : 'w-80'} overflow-y-auto`}>
      {/* Conteúdo adaptativo */}
    </aside>
  );
};
```

## 🔧 Padrões de Desenvolvimento

### Estrutura de Arquivos
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn)
│   ├── admin/          # Módulos administrativos
│   └── [feature]/      # Componentes por funcionalidade
├── hooks/              # Custom hooks
├── pages/              # Páginas/rotas
├── types/              # Definições TypeScript
├── lib/                # Utilitários e configurações
└── integrations/       # Integrações externas
```

### Convenções de Código
- **Naming**: camelCase para JS, kebab-case para CSS
- **Components**: PascalCase, arquivos .tsx
- **Hooks**: Prefixo "use", lógica reutilizável
- **Types**: Interfaces descritivas, sufixo adequado

### Performance
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoization**: React.memo para componentes pesados
- **Query Optimization**: TanStack Query com cache inteligente
- **Bundle Splitting**: Vite code splitting automático

## 🚀 Deploy e Infraestrutura

### Supabase Configuration
```typescript
// Client configuration
export const supabase = createClient(
  'https://amuadbftctnmckncgeua.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

### Environment Variables
- **VITE_SUPABASE_URL**: URL do projeto Supabase
- **VITE_SUPABASE_ANON_KEY**: Chave pública
- **Database URL**: Para migrations e seed

### CI/CD Pipeline
1. **Build**: Vite build otimizado
2. **Tests**: Unit tests com Vitest
3. **Deploy**: Vercel/Netlify automático
4. **Database**: Migrations automáticas via Supabase CLI

## 📊 Monitoramento e Logs

### Métricas de Performance
- **Core Web Vitals**: LCP, FID, CLS
- **Bundle Size**: Análise com Vite Bundle Analyzer
- **Query Performance**: React Query DevTools

### Error Tracking
```typescript
// Error boundary customizado
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
    // Enviar para serviço de monitoramento
  }
}
```

## 🔄 Atualizações e Manutenção

### Versionamento
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **Git Flow**: Feature branches + pull requests
- **Database**: Migrations versionadas com Supabase

### Backup e Recovery
- **Database**: Backup automático diário (Supabase)
- **Storage**: Replicação automática de arquivos
- **Point-in-time recovery**: 7 dias de histórico

### Monitoramento de Saúde
- **Health Checks**: Endpoints de status
- **Alertas**: Notificações para falhas críticas
- **Métricas**: Dashboard de performance interna

## 📚 Documentação de APIs

### Supabase Client Methods
```typescript
// Exemplos de queries otimizadas
const { data: oportunidades } = await supabase
  .from('oportunidades')
  .select(`
    *,
    empresa_origem:empresas!empresa_origem_id(nome),
    empresa_destino:empresas!empresa_destino_id(nome)
  `)
  .eq('status', 'ativa')
  .order('created_at', { ascending: false });
```

### Custom Hooks Pattern
```typescript
// Hook reutilizável para dados
export const useMapaParceiros = () => {
  const queryClient = useQueryClient();
  
  const { data: etapas, isLoading } = useQuery({
    queryKey: ['etapas-jornada'],
    queryFn: () => fetchEtapas(),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });
  
  return { etapas, isLoading, refetch: () => queryClient.invalidateQueries() };
};
```

## 🎯 Roadmap Técnico

### Próximas Implementações
- **Real-time**: WebSockets para colaboração
- **Offline-first**: Service Workers + IndexedDB
- **Mobile App**: React Native ou Capacitor
- **AI/ML**: Integração com OpenAI para insights

### Otimizações Planejadas
- **Performance**: Virtualização de listas grandes
- **SEO**: Meta tags dinâmicas
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: Implementação de CSP headers

---

*Documentação técnica atualizada - Versão 2.0 | Sistema A&eight Partners*
