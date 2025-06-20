
# Aeight Partners - Arquitetura e Sistema

Sistema completo de gestão desenvolvido com arquitetura moderna e modular, incluindo o inovador **Módulo Diário Executivo**.

## 📐 Arquitetura Geral

### 🏗️ Stack Tecnológica
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Estado**: Context API + Hooks customizados
- **Roteamento**: React Router v6
- **Build**: Vite + TypeScript

### 🎯 Princípios Arquiteturais
- **Modularidade**: Cada funcionalidade em módulo independente
- **Responsabilidade única**: Componentes focados e reutilizáveis
- **Tipagem forte**: TypeScript em 100% do código
- **Segurança**: RLS, validações e auditoria completa

## 🏢 Módulos do Sistema

### 📋 **MÓDULO DIÁRIO EXECUTIVO** (Principal)

#### 📁 Estrutura de Arquivos
```
src/
├── pages/diario/
│   └── index.tsx                    # Página principal (admin-only)
├── components/diario/
│   ├── DiarioTabs.tsx              # Navegação principal
│   ├── Agenda/
│   │   ├── AgendaView.tsx          # Vista principal da agenda
│   │   ├── DiarioCalendar.tsx      # Calendário semanal/diário  
│   │   ├── AgendaEventList.tsx     # Lista paginada de eventos
│   │   ├── AgendaEventForm.tsx     # Formulário de eventos
│   │   └── AgendaSyncGoogle.tsx    # Integração Google (preparada)
│   ├── Crm/
│   │   ├── CrmRegister.tsx         # Interface principal
│   │   ├── CrmActionForm.tsx       # Formulário unificado
│   │   ├── CrmActionList.tsx       # Lista com filtros avançados
│   │   ├── CrmFormAudio.tsx        # Gravação de áudio nativa
│   │   ├── CrmFormVideo.tsx        # Captura de vídeo
│   │   ├── CrmFormText.tsx         # Editor de texto rico
│   │   └── CrmNextSteps.tsx        # Gestão de próximos passos
│   ├── Resumo/
│   │   ├── ResumoView.tsx          # Interface de geração
│   │   └── ResumoList.tsx          # Histórico de resumos
│   └── IA/
│       ├── IaAgentInbox.tsx        # Inbox de sugestões
│       └── IaApproveField.tsx      # Campo de aprovação
├── contexts/
│   ├── DiarioContext.tsx           # Contexto principal
│   ├── AgendaContext.tsx           # Estado da agenda
│   ├── CrmContext.tsx              # Estado do CRM
│   ├── ResumoContext.tsx           # Estado dos resumos
│   └── IAContext.tsx               # Estado da IA
├── services/
│   ├── ResumoService.ts            # Lógica de resumos
│   ├── AgendaService.ts            # Sincronização de calendários
│   └── IAService.ts                # Integração com IA
├── hooks/
│   └── useDiario.ts                # Hook principal
└── types/
    └── diario.ts                   # Tipos específicos (28 interfaces)
```

#### 🔄 Fluxos Principais

**1. Agenda - Gestão de Eventos**
```typescript
Usuário → DiarioCalendar → AgendaEventForm → AgendaContext → Supabase
                         ↓
              Sincronização Google/Outlook (preparada)
```

**2. CRM - Registro Multimídia**
```typescript
Usuário → CrmRegister → [Audio|Video|Text]Form → Storage → Database
                      ↓
             Próximos Passos → Agenda (vinculação automática)
```

**3. Resumos - Geração Automática**
```typescript
ResumoService → Consulta dados período → IA processing → PDF/CSV → Storage
```

**4. IA - Sugestões Automáticas**
```typescript
Trigger evento → IA analysis → IaAgentInbox → Aprovação → Aplicação
```

#### 🎛️ Contextos e Estado

**DiarioContext (Principal)**
- Orquestra todos os sub-contextos
- Controle de permissões (admin-only)
- Navegação entre abas
- Estado global compartilhado

**AgendaContext**
- CRUD de eventos
- Sincronização com calendários externos
- Filtros por data, parceiro, status
- Integração com CRM (próximos passos)

**CrmContext**  
- Gestão de ações multimídia
- Upload para Supabase Storage
- Vinculação com parceiros
- Workflow de próximos passos

**ResumoContext**
- Geração automática por período
- Cache de resumos anteriores
- Exportação de relatórios
- Métricas consolidadas

**IAContext**
- Fila de sugestões pendentes
- Workflow de aprovação
- Histórico de decisões
- Integração com outros módulos

### 🏢 Módulo de Parceiros

#### 📁 Estrutura
```
src/components/partners/
├── PartnersView.tsx        # Vista principal
├── PartnerCard.tsx         # Card individual
├── PartnerForm.tsx         # Formulário de cadastro
├── PartnerIndicators.tsx   # Quadrante e métricas
└── PartnerOnePager.tsx     # One-pager dinâmico
```

#### 🔄 Fluxo Principal
```typescript
Usuário → Lista → Detalhes → Edição → Indicadores → One-pager
```

### 💼 Módulo de Oportunidades

#### 📁 Estrutura
```
src/components/opportunities/
├── OpportunityPipeline.tsx  # Pipeline visual
├── OpportunityForm.tsx      # Formulário completo
├── OpportunityHistory.tsx   # Histórico detalhado
└── OpportunityActivities.tsx # Atividades e follow-ups
```

### 🎯 Módulo Wishlist

#### 📁 Estrutura
```
src/components/wishlist/
├── WishlistView.tsx         # Interface principal
├── WishlistRequest.tsx      # Solicitações
├── WishlistPresentation.tsx # Gestão de apresentações
└── WishlistStats.tsx        # Métricas de conversão
```

### 📚 Módulo de Materiais

#### 📁 Estrutura
```
src/components/materials/
├── MaterialsRepository.tsx  # Repositório principal
├── MaterialUpload.tsx       # Upload com preview
├── MaterialViewer.tsx       # Visualizador
└── MaterialTags.tsx         # Sistema de tags
```

### 🎪 Módulo de Eventos

#### 📁 Estrutura
```
src/components/events/
├── EventsView.tsx           # Lista de eventos
├── EventForm.tsx            # Criação de eventos
├── EventContacts.tsx        # Coleta de contatos
└── EventNetworking.tsx      # Gestão de networking
```

## 🔐 Segurança e Autenticação

### 🛡️ Row Level Security (RLS)
- **Módulo Diário**: Acesso restrito a administradores
- **Parceiros**: Baseado em empresa/papel
- **Oportunidades**: Apenas envolvidos
- **Materiais**: Criador + admins

### 🔑 Políticas de Acesso
```sql
-- Exemplo: Diário (admin-only)
CREATE POLICY "Admin access diario" ON diario_*
FOR ALL USING (is_admin_user());

-- Exemplo: Oportunidades (envolvidos)
CREATE POLICY "View own opportunities" ON oportunidades  
FOR SELECT USING (
  usuario_envio_id = auth.uid() OR 
  usuario_recebe_id = auth.uid()
);
```

## 📊 Integração com Supabase

### 🗄️ Database
- **23 tabelas principais** + 4 do módulo diário
- **12 ENUMs** para validação rigorosa
- **Triggers automáticos** para auditoria
- **Funções customizadas** para lógica complexa

### 📁 Storage
```
Buckets:
├── materiais/           # Documentos e one-pagers
├── diario/             # Áudios, vídeos, resumos
│   ├── audio/
│   ├── video/
│   └── reports/
└── eventos/            # Materiais de eventos
```

### ⚡ Edge Functions (Preparadas)
```
supabase/functions/
├── generate-summary/    # Geração de resumos
├── ai-suggestions/      # Processamento IA
├── calendar-sync/       # Sync calendários
└── export-reports/      # Exportação de relatórios
```

## 🎨 Padrões de Desenvolvimento

### 📱 Componentes
- **Atomic Design**: Atoms → Molecules → Organisms
- **Composição**: Props interface sempre tipada
- **Reutilização**: Hooks customizados para lógica
- **Performance**: React.memo e useMemo quando necessário

### 🎯 Estado
- **Context**: Para estado compartilhado
- **useState**: Para estado local
- **useQuery**: Para dados do servidor
- **Custom hooks**: Para lógica reutilizável

### 📝 TypeScript
```typescript
// Exemplo: Interface completa
interface AgendaEvento {
  id: string;
  title: string;
  start: string;
  end: string;
  status: "scheduled" | "completed" | "canceled";
  partner_id?: string;
  // ... 8+ campos adicionais
}
```

## 🚀 Performance e Otimização

### ⚡ Frontend
- **Code Splitting**: Lazy loading de rotas
- **Bundle Optimization**: Tree shaking automático
- **Image Optimization**: Lazy loading e compression
- **Caching**: React Query para dados

### 🗄️ Backend
- **Índices**: Em todos os campos consultados frequentemente
- **Pagination**: Implementada em todas as listas
- **Connection Pooling**: Supabase gerenciado
- **Query Optimization**: Consultas específicas e eficientes

## 🔧 DevOps e Deploy

### 🚀 Pipeline
```yaml
Development → Testing → Staging → Production
     ↓           ↓        ↓         ↓
   Local     Supabase   Vercel   Vercel Pro
```

### 📊 Monitoramento
- **Supabase Dashboard**: Métricas de database
- **Vercel Analytics**: Performance frontend
- **Console Logs**: Debug em desenvolvimento
- **Error Boundaries**: Captura de erros

## 📈 Escalabilidade

### 🔄 Horizontal
- **Microserviços**: Módulos independentes
- **API First**: Todas as funcionalidades via API
- **Cacheable**: Dados estáticos em cache
- **CDN Ready**: Assets otimizados

### ⬆️ Vertical  
- **Database Scaling**: Supabase gerenciado
- **Compute Scaling**: Edge Functions auto-scale
- **Storage Scaling**: Ilimitado no Supabase
- **Memory Optimization**: Garbage collection eficiente

## 🎯 Roadmap Técnico

### 🔜 Próximas Versões
- **Q2 2025**: Integração completa Google/Outlook
- **Q2 2025**: IA avançada com NLP
- **Q3 2025**: App mobile React Native
- **Q4 2025**: Analytics dashboard avançado

### 🧪 Experimentais
- **Real-time**: Colaboração em tempo real
- **Offline**: PWA com sync automático
- **Voice**: Comandos de voz para CRM
- **AR/VR**: Visualização imersiva de dados

## Diretrizes de Arquitetura e Otimização

Para manter a performance, manutenibilidade e consistência da aplicação Aeight Partners, as seguintes diretrizes devem ser observadas em novos desenvolvimentos e refatorações:

### 1. Processamento e Agregação de Dados no Backend

*   **Priorize o Backend para Cálculos Pesados:** Toda lógica de filtragem complexa, joins entre múltiplas tabelas, agregações (somas, contagens, médias) e cálculos estatísticos devem ser, preferencialmente, implementados no backend (Supabase), utilizando funções SQL (`CREATE FUNCTION ... LANGUAGE sql` ou `plpgsql`) chamadas via RPC.
*   **Minimize a Transferência de Dados:** Evite buscar grandes volumes de dados brutos para o frontend. As funções SQL devem retornar apenas os dados necessários e, idealmente, já no formato ou estrutura próxima à de exibição.
*   **Exemplo:** Em vez de buscar todas as `oportunidades` e `empresas` para calcular uma matriz de performance no frontend, crie uma função SQL que receba os filtros necessários, realize os joins e cálculos no banco, e retorne a matriz já calculada. (Veja `get_matriz_intragrupo_data` como referência).

### 2. Serviços de Frontend para Acesso a Dados

*   **Centralize o Acesso a Dados em Serviços:** Crie ou utilize serviços dedicados no diretório `src/services/` para encapsular as chamadas RPC ao backend. Esses serviços atuam como uma camada de abstração entre a UI e a lógica de busca de dados.
*   **Exemplos:** `MatrizService.ts`, `DashboardDataService.ts`.
*   **Responsabilidade dos Serviços:** Devem ser responsáveis por chamar as RPCs, tratar erros básicos da chamada e, se necessário, fazer um leve mapeamento do resultado da RPC para os tipos de dados do frontend (embora o ideal seja que a RPC já retorne dados em um formato compatível).

### 3. Hooks para Lógica de UI e Estado do Componente

*   **Hooks para Estado e Lógica de Apresentação:** Utilize React Hooks (`useState`, `useEffect`, `useMemo`, hooks customizados) para gerenciar o estado dos componentes, lógica de interação da UI e chamadas aos serviços de dados.
*   **Simplicidade nos Hooks de Dados:** Hooks que buscam dados devem, em geral, chamar os métodos dos serviços e expor os dados e o estado de carregamento/erro. Evite colocar lógica de negócio complexa ou manipulação pesada de dados diretamente nos hooks.
*   **Exemplo:** `useStatsCalculation.ts` foi refatorado para chamar uma RPC (indiretamente, pois agora a chamada RPC está dentro do `DashboardDataService` que o hook consumiria idealmente, ou o hook usa uma função SQL que faz tudo), em vez de realizar todos os cálculos no cliente.

### 4. Componentes Focados na Apresentação

*   **Componentes "Dumb" ou de Apresentação:** Componentes React devem ser, na medida do possível, focados em renderizar a UI com base nas props recebidas e em disparar callbacks para interações do usuário.
*   **Delegação da Lógica:** A lógica de busca de dados, manipulação de estado complexo e lógica de negócio deve residir em hooks e serviços, não diretamente nos componentes de renderização.

### 5. Normalização e Tipagem

*   **Tipos Consistentes:** Utilize os tipos definidos em `src/types/` para garantir a consistência dos dados em toda a aplicação.
*   **Normalização no Backend:** Processos de normalização de dados (ex: padronizar strings de status, categorias) devem, idealmente, ocorrer no backend (na função SQL ou até mesmo no schema do banco com `CHECK constraints` ou `enums`) para garantir que o frontend receba dados consistentes. As funções `normalizeStatus` e `normalizeRelacao` que existiam no frontend foram incorporadas à lógica das funções SQL.

### 6. Migrações SQL para Funções de Backend

*   **Versionamento:** Todas as novas funções SQL criadas no Supabase para processamento de dados devem ser adicionadas através de arquivos de migração no diretório `supabase/migrations/`, garantindo o versionamento e a reproducibilidade do schema e da lógica do banco.

### Benefícios Esperados

*   **Melhor Performance:** Redução da carga no cliente e menor tráfego de dados.
*   **Maior Manutenibilidade:** Lógica de negócio centralizada e mais fácil de encontrar e modificar.
*   **Código Frontend Mais Limpo:** Componentes e hooks mais simples e focados.
*   **Reutilização:** Funções SQL e serviços podem ser reutilizados por diferentes partes da aplicação.
*   **Robustez:** Cálculos críticos feitos próximos aos dados, no ambiente controlado do banco de dados.

---

> **Arquitetura Rotondo Partners** - Construída para escalar, evoluir e inovar no futuro do relacionamento empresarial.
