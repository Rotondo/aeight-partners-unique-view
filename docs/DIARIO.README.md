
# Módulo Diário - Documentação Técnica

## Visão Geral

O módulo Diário é um sistema completo de gestão executiva que integra agenda, CRM, geração de resumos e assistência por IA. Desenvolvido para o projeto Aeight Partners, este módulo permite que administradores gerenciem eficientemente suas atividades, registrem interações e obtenham insights automatizados.

## Arquitetura

### Estrutura de Pastas

```
src/
├── pages/diario/
│   └── index.tsx                    # Página principal do módulo
├── components/diario/
│   ├── DiarioTabs.tsx              # Componente de navegação principal
│   ├── Agenda/
│   │   ├── AgendaView.tsx          # Vista principal da agenda
│   │   ├── AgendaEventList.tsx     # Lista de eventos
│   │   ├── AgendaSyncGoogle.tsx    # Integração Google Calendar
│   │   └── AgendaSyncOutlook.tsx   # Integração Outlook Calendar
│   ├── Crm/
│   │   ├── CrmRegister.tsx         # Registro principal do CRM
│   │   ├── CrmFormAudio.tsx        # Formulário para registros de áudio
│   │   ├── CrmFormVideo.tsx        # Formulário para registros de vídeo
│   │   ├── CrmFormText.tsx         # Formulário para registros de texto
│   │   ├── CrmActionList.tsx       # Lista de ações do CRM
│   │   └── CrmNextSteps.tsx        # Próximos passos
│   ├── Resumo/
│   │   └── ResumoView.tsx          # Geração e visualização de resumos
│   └── IA/
│       ├── IaAgentInbox.tsx        # Inbox de sugestões da IA
│       └── IaApproveField.tsx      # Campo de aprovação de sugestões
├── contexts/
│   └── DiarioContext.tsx           # Contexto principal do módulo
├── types/
│   └── diario.ts                   # Tipos TypeScript específicos
├── hooks/
│   └── usePartners.ts              # Hook para carregar parceiros
└── integrations/
    ├── outlook/
    │   └── outlookApi.ts           # API do Outlook (estrutura)
    ├── google/
    │   └── googleCalendarApi.ts    # API do Google Calendar (estrutura)
    └── ia/
        └── iaApi.ts                # API de IA (estrutura)
```

### Banco de Dados

O módulo utiliza 4 tabelas principais no PostgreSQL/Supabase:

1. **diario_agenda_eventos** - Eventos da agenda com integrações externas
2. **diario_crm_acoes** - Ações e registros do CRM (áudio, vídeo, texto)
3. **diario_resumos** - Resumos executivos gerados automaticamente
4. **diario_ia_sugestoes** - Sugestões da IA para revisão e aprovação

## Funcionalidades

### 1. Agenda

**Recursos:**
- Visualização de eventos por data
- Integração com Google Calendar e Outlook
- CRUD completo de eventos
- Categorização por tipo (reunião, call, apresentação, etc.)
- Status de acompanhamento (agendado, realizado, cancelado, reagendado)
- Vinculação com parceiros
- Sincronização bidirecional (planejada)

**Componentes principais:**
- `AgendaView`: Interface principal com calendário e controles
- `AgendaEventList`: Lista paginada e filtrada de eventos
- `AgendaSyncGoogle/Outlook`: Componentes de integração

### 2. CRM

**Recursos:**
- Registro multimídia (áudio, vídeo, texto)
- Gravação nativa de áudio/vídeo pelo browser
- Upload de arquivos para Supabase Storage
- Definição de próximos passos
- Status de acompanhamento das ações
- Filtros avançados e busca textual
- Vinculação com parceiros

**Componentes principais:**
- `CrmRegister`: Interface de abas para diferentes tipos de registro
- `CrmFormAudio/Video/Text`: Formulários especializados por mídia
- `CrmActionList`: Lista com filtros e busca
- `CrmNextSteps`: Widget de próximas ações

### 3. Resumos

**Recursos:**
- Geração automática de resumos por período
- Tipos: semanal, mensal, trimestral
- Exportação em PDF e CSV
- Métricas automáticas (eventos, ações, parceiros)
- Principais realizações e próximos passos
- Histórico de resumos gerados

**Componentes principais:**
- `ResumoView`: Interface de geração e visualização
- Integração com APIs de exportação

### 4. Assistente IA

**Recursos:**
- Sugestões automáticas de melhorias
- Ciclo de aprovação (pendente → revisão → aprovado/rejeitado)
- Edição antes da aprovação
- Diferentes tipos de sugestão
- Rastreabilidade completa das decisões
- Observações do revisor

**Componentes principais:**
- `IaAgentInbox`: Inbox principal com tabs por status
- `IaApproveField`: Interface de aprovação com edição

## Permissões e Segurança

### Row Level Security (RLS)

Todas as tabelas do módulo implementam RLS com as seguintes regras:

- **Acesso restrito**: Apenas usuários com papel `admin` podem acessar qualquer funcionalidade
- **Verificação por função**: `is_admin_user()` valida papel e status ativo
- **Operações CRUD**: Todas protegidas por policies específicas
- **Auditoria**: Log completo de todas as operações

### Implementação de Segurança

```sql
-- Exemplo de policy
CREATE POLICY "Admin can view all agenda events"
  ON diario_agenda_eventos FOR SELECT
  TO authenticated
  USING (is_admin_user());
```

### Verificação no Frontend

```typescript
// Verificação no componente principal
if (!user || user.papel !== 'admin') {
  return <AccessDeniedAlert />;
}
```

## Integrações Externas

### Google Calendar

**Estrutura preparada para:**
- OAuth2 com escopos mínimos
- Sincronização bidirecional
- Mapeamento de campos
- Tratamento de conflitos

**Arquivo:** `src/integrations/google/googleCalendarApi.ts`

### Outlook Calendar

**Estrutura preparada para:**
- Microsoft Graph API
- OAuth2 empresarial
- Sincronização de eventos
- Metadados customizados

**Arquivo:** `src/integrations/outlook/outlookApi.ts`

### IA/LLM

**Estrutura preparada para:**
- API REST ou GraphQL
- Diferentes tipos de sugestão
- Processamento assíncrono
- Rate limiting

**Arquivo:** `src/integrations/ia/iaApi.ts`

## Tipos TypeScript

### Principais Interfaces

```typescript
// Evento da agenda
interface AgendaEvento {
  id: string;
  titulo: string;
  data_inicio: string;
  data_fim: string;
  tipo: TipoEventoAgenda;
  status: StatusEvento;
  parceiro_id?: string;
  fonte_integracao: FonteIntegracao;
  // ... outros campos
}

// Ação do CRM
interface CrmAcao {
  id: string;
  titulo: string;
  tipo: TipoAcaoCrm;
  status: StatusAcaoCrm;
  arquivo_audio?: string;
  arquivo_video?: string;
  conteudo_texto?: string;
  // ... outros campos
}

// Sugestão da IA
interface IaSugestao {
  id: string;
  tipo_sugestao: string;
  conteudo_original: string;
  conteudo_sugerido: string;
  status: StatusSugestaoIA;
  // ... outros campos
}
```

### Enums

Todos os enums estão centralizados em `src/types/diario.ts`:

- `TipoEventoAgenda`, `StatusEvento`, `FonteIntegracao`
- `TipoAcaoCrm`, `StatusAcaoCrm`
- `TipoResumo`, `StatusSugestaoIA`

## Contexto e Estado

### DiarioContext

O contexto centraliza todo o estado e operações do módulo:

```typescript
interface DiarioContextType {
  // Estados
  agendaEventos: AgendaEvento[];
  crmAcoes: CrmAcao[];
  resumos: DiarioResumo[];
  iaSugestoes: IaSugestao[];
  
  // Ações
  createEvento: (evento: Partial<AgendaEvento>) => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
  generateResumo: (tipo: TipoResumo, inicio: string, fim: string) => Promise<void>;
  approveSugestao: (id: string) => Promise<void>;
  // ... outras ações
}
```

### Hooks Customizados

- `useDiario()`: Acesso ao contexto principal
- `usePartners()`: Carregamento de parceiros para seleção

## Padrões de Código

### Organização de Componentes

1. **Imports** organizados por categoria (React, UI, custom)
2. **Interface props** sempre tipada
3. **Estado local** apenas quando necessário
4. **Handlers** com nomenclatura clara
5. **JSX** bem estruturado com componentes pequenos

### Tratamento de Erros

```typescript
try {
  await createEvento(dados);
  toast({ title: "Sucesso", description: "Evento criado" });
} catch (error) {
  console.error('Erro ao criar evento:', error);
  toast({ 
    title: "Erro", 
    description: "Falha ao criar evento",
    variant: "destructive" 
  });
}
```

### Loading States

Todos os componentes implementam estados de carregamento:

```typescript
if (loading) {
  return <SkeletonLoader />;
}

if (data.length === 0) {
  return <EmptyState />;
}
```

## Storage de Arquivos

### Estrutura no Supabase

```
bucket: materiais/
├── diario/
│   ├── audio/
│   │   └── {acao_id}/arquivo.wav
│   ├── video/
│   │   └── {acao_id}/arquivo.webm
│   └── resumos/
│       ├── pdf/{resumo_id}.pdf
│       └── csv/{resumo_id}.csv
```

### Policies de Storage

- Upload: apenas usuários autenticados e admin
- Download: acesso controlado por RLS das tabelas relacionadas
- Exclusão: apenas owner ou admin

## Auditoria e Logs

### Triggers Automáticos

- `updated_at` atualizado automaticamente
- Log completo em `diario_audit_log`
- Rastreamento de usuário responsável
- Histórico de alterações em JSON

### Consulta de Auditoria

```sql
-- Ver histórico de uma ação específica
SELECT * FROM diario_audit_log 
WHERE tabela = 'diario_crm_acoes' 
AND registro_id = 'uuid-da-acao'
ORDER BY timestamp DESC;
```

## Testes e Qualidade

### Estrutura para Testes (Planejada)

```
tests/
├── diario/
│   ├── __tests__/
│   │   ├── DiarioContext.test.tsx
│   │   ├── AgendaView.test.tsx
│   │   └── CrmRegister.test.tsx
│   └── __mocks__/
│       └── diarioData.ts
```

### Pontos de Teste Críticos

1. **Contexto**: Estado e ações funcionam corretamente
2. **Permissions**: RLS funcionando no frontend
3. **Integrations**: Mocks das APIs externas
4. **Forms**: Validação e submissão
5. **File Upload**: Storage funcionando

## Performance e Otimização

### Queries Otimizadas

- Índices em campos frequentemente consultados
- Paginação em listas longas
- Lazy loading de relações
- Cache inteligente no contexto

### Bundle Size

- Tree shaking de componentes não utilizados
- Lazy loading de rotas
- Otimização de imports
- Componentes menores e focados

## Deployment e Infraestrutura

### Variáveis de Ambiente

```env
# APIs externas (futuras)
VITE_GOOGLE_CALENDAR_CLIENT_ID=
VITE_OUTLOOK_CLIENT_ID=
VITE_IA_API_ENDPOINT=
VITE_IA_API_KEY=
```

### Configuração Supabase

- RLS habilitado em todas as tabelas
- Triggers e funções instaladas
- Storage bucket configurado
- Políticas de backup ativadas

## Expansão Futura

### Funcionalidades Planejadas

1. **Notificações Push**
   - Lembretes de eventos
   - Ações pendentes
   - Aprovações de IA

2. **Dashboard Analytics**
   - Métricas de produtividade
   - Gráficos de tendências
   - KPIs personalizados

3. **Mobile App**
   - Gravação rápida
   - Sincronização offline
   - Notificações nativas

4. **Integrações Avançadas**
   - Slack/Teams
   - CRM externos
   - Calendários adicionais

### Pontos de Extensão

- **Tipos de mídia**: Adicionar suporte a outros formatos
- **IA avançada**: Análise de sentimentos, transcrições
- **Relatórios**: Templates customizáveis
- **Workflows**: Automações baseadas em regras

## Troubleshooting

### Problemas Comuns

1. **Permissão negada**
   - Verificar papel do usuário
   - Confirmar RLS policies
   - Checar autenticação

2. **Upload falha**
   - Verificar storage policies
   - Confirmar formato de arquivo
   - Checar tamanho máximo

3. **Sincronização não funciona**
   - Verificar OAuth tokens
   - Confirmar escopos de API
   - Checar rate limits

### Logs e Debug

```typescript
// Debug habilitado em desenvolvimento
console.log('[Diario] Estado atual:', {
  agendaEventos,
  loading,
  user
});
```

## Referências

### Documentação Externa

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph](https://docs.microsoft.com/graph)
- [React Context Patterns](https://reactjs.org/docs/context.html)

### Arquivos Relacionados

- `src/types/index.ts` - Tipos globais do projeto
- `README.dados.md` - Documentação detalhada do banco
- `README.sistema.md` - Arquitetura geral do sistema

---

## Changelog

### v1.0.0 (MVP)
- ✅ Estrutura completa do módulo
- ✅ Agenda com eventos básicos
- ✅ CRM multimídia
- ✅ Geração de resumos
- ✅ Assistente IA
- ✅ Permissões admin-only
- ✅ Auditoria completa
- 🔄 Integrações (estrutura preparada)

### Próximas Versões
- 🎯 v1.1.0: Integrações Google/Outlook funcionais
- 🎯 v1.2.0: IA com processamento real
- 🎯 v1.3.0: Notificações e alertas
- 🎯 v2.0.0: Dashboard analytics

---

> **Nota**: Esta documentação deve ser atualizada sempre que houver alterações significativas no módulo. Mantenha a rastreabilidade entre código, banco de dados e documentação.
