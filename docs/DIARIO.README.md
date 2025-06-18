
# Módulo Diário Executivo - Documentação Complete

## 🎯 Visão Geral

O **Módulo Diário Executivo** é o coração do sistema Aeight Partners - uma solução completa de gestão executiva que integra agenda inteligente, CRM multimídia, geração automática de resumos e assistência por IA. Desenvolvido exclusivamente para administradores, oferece controle total sobre atividades, relacionamentos e insights de negócio.

## 🏗️ Arquitetura Completa

### 📁 Estrutura de Arquivos (28+ componentes)

```
src/
├── pages/diario/
│   └── index.tsx                    # Página principal com controle de acesso
├── components/diario/
│   ├── DiarioTabs.tsx              # Navegação principal entre módulos
│   ├── Agenda/                     # 📅 Módulo de Agenda (4 componentes)
│   │   ├── AgendaView.tsx          # Interface principal da agenda
│   │   ├── DiarioCalendar.tsx      # Calendário semanal/diário com eventos
│   │   ├── AgendaEventList.tsx     # Lista paginada com filtros
│   │   └── AgendaEventForm.tsx     # Formulário de criação/edição
│   ├── Crm/                        # 📝 Módulo CRM (8 componentes)
│   │   ├── CrmRegister.tsx         # Interface principal com abas
│   │   ├── CrmActionForm.tsx       # Formulário unificado
│   │   ├── CrmActionList.tsx       # Lista com busca e filtros
│   │   ├── CrmFormAudio.tsx        # Gravação de áudio nativa
│   │   ├── CrmFormVideo.tsx        # Captura de vídeo
│   │   ├── CrmFormText.tsx         # Editor de texto rico
│   │   ├── CrmNextSteps.tsx        # Gestão de próximos passos
│   │   └── CrmActionDetails.tsx    # Detalhes da ação
│   ├── Resumo/                     # 📊 Módulo Resumos (2 componentes)
│   │   ├── ResumoView.tsx          # Interface de geração
│   │   └── ResumoList.tsx          # Histórico de resumos
│   └── IA/                         # 🤖 Módulo IA (2 componentes)
│       ├── IaAgentInbox.tsx        # Inbox de sugestões
│       └── IaApproveField.tsx      # Campo de aprovação
├── contexts/                       # 🔗 Contextos (5 arquivos)
│   ├── DiarioContext.tsx           # Contexto principal orquestrador
│   ├── AgendaContext.tsx           # Estado e ações da agenda
│   ├── CrmContext.tsx              # Estado e ações do CRM
│   ├── ResumoContext.tsx           # Estado e ações dos resumos
│   └── IAContext.tsx               # Estado e ações da IA
├── services/                       # ⚙️ Services (3 arquivos)
│   ├── ResumoService.ts            # Lógica de geração de resumos
│   ├── AgendaService.ts            # Sincronização de calendários
│   └── IAService.ts                # Integração com IA
├── hooks/                          # 🎣 Hooks customizados
│   └── useDiario.ts                # Hook principal do módulo
└── types/
    └── diario.ts                   # 28+ interfaces TypeScript
```

### 🗄️ Database Schema (4 tabelas principais)

```sql
-- 📅 Eventos da Agenda
diario_agenda_eventos (13 campos)
├── id, title, description
├── start, end, status 
├── partner_id, source, external_id
├── event_type, related_crm_action_id
└── created_at, updated_at

-- 📝 Ações CRM  
diario_crm_acoes (12 campos)
├── id, description, content, type
├── status, communication_method
├── partner_id, user_id
├── next_step_date, next_steps
├── metadata, created_at

-- 📊 Resumos Executivos
diario_resumos (6 campos)  
├── id, period, content
├── export_url, generated_at

-- 🤖 Sugestões IA
diario_ia_sugestoes (9 campos)
├── id, target_type, target_id
├── field, suggestion, status
├── approved_by, approved_at, created_at
```

## 🎯 Funcionalidades Detalhadas

### 📅 **Módulo Agenda**

#### Funcionalidades Principais
- **Calendário Visual**: Visualização semanal e diária com navegação intuitiva
- **Gestão de Eventos**: CRUD completo com validações
- **Status Tracking**: agendado → realizado → cancelado
- **Integração Externa**: Preparado para Google Calendar e Outlook
- **Vinculação CRM**: Próximos passos do CRM viram eventos automaticamente

#### Componentes Detalhados

**DiarioCalendar.tsx (280 linhas)**
```typescript
// Funcionalidades implementadas:
- Visualização semanal com 7 dias
- Visualização diária detalhada  
- Navegação entre semanas/dias
- Status visual dos eventos (✅📅❌)
- Filtros por tipo e status
- Integração com parceiros
- Debug completo com logs
```

**AgendaEventForm.tsx (224 linhas)**
```typescript
// Funcionalidades implementadas:
- Formulário completo de eventos
- Validação de parceiros
- Seleção de data/hora
- Status management
- Integração com contexto
```

#### Fluxo de Uso
1. **Visualizar**: DiarioCalendar mostra eventos por semana/dia
2. **Criar**: AgendaEventForm com todos os campos
3. **Editar**: Clique em evento existente
4. **Sincronizar**: (Preparado) Google/Outlook automático

#### Database Integration
```sql
-- Eventos são criados automaticamente quando:
-- 1. Usuário cria manualmente
-- 2. CRM action tem next_step_date
-- 3. Sincronização externa (futuro)

INSERT INTO diario_agenda_eventos (
  title, start, end, partner_id, source
) VALUES (
  'Follow-up Cliente X', 
  '2025-01-20 14:00', 
  '2025-01-20 15:00',
  'uuid-partner',
  'crm_generated'
);
```

### 📝 **Módulo CRM**

#### Funcionalidades Principais
- **Multi-formato**: Áudio, vídeo e texto em uma interface
- **Gravação Nativa**: Captura de áudio/vídeo pelo browser
- **Storage Automático**: Upload para Supabase Storage
- **Próximos Passos**: Gestão automatizada de follow-ups
- **Vinculação**: Integração total com agenda e parceiros

#### Componentes Detalhados

**CrmRegister.tsx**
```typescript
// Interface principal com abas:
- "Nova Ação": Formulário de criação
- "Ações Recentes": Lista com filtros
- Auto-switch após criação bem-sucedida
```

**CrmActionForm.tsx**  
```typescript
// Formulário unificado para todos os tipos:
- Tipo: audio/video/texto via tabs
- Parceiro: Dropdown com validação
- Método: whatsapp/email/ligação/etc
- Próximos passos: Data + descrição
- Upload automático para Storage
```

**CrmFormAudio.tsx/Video.tsx/Text.tsx**
```typescript
// Formulários especializados:
Audio: MediaRecorder API nativo
Video: getUserMedia + gravação
Texto: Editor rico com formatação
```

#### Fluxo Completo
1. **Selecionar Tipo**: Áudio, vídeo ou texto
2. **Gravar/Digitar**: Interface específica por tipo
3. **Adicionar Contexto**: Parceiro, método, observações
4. **Definir Follow-up**: Data e ação para próximo passo
5. **Salvar**: Upload automático + registro no banco
6. **Agenda**: Próximo passo vira evento automaticamente

#### Storage Structure
```
diario/
├── audio/
│   └── {acao_id}/
│       ├── gravacao.wav
│       └── metadata.json
├── video/  
│   └── {acao_id}/
│       ├── video.webm
│       └── thumbnail.jpg
└── transcriptions/
    └── {acao_id}.txt
```

### 📊 **Módulo Resumos**

#### Funcionalidades Principais
- **Geração Automática**: Baseada em dados reais do período
- **Múltiplos Períodos**: Semanal, mensal, trimestral
- **Métricas Reais**: Eventos, ações, parceiros envolvidos
- **Exportação**: PDF e CSV para relatórios
- **Inteligência**: Análise de padrões e tendências

#### Algoritmo de Geração

**ResumoService.ts (279 linhas - CORRIGIDO)**
```typescript
// Processo de geração:
1. Consultar eventos no período (agendados + realizados)
2. Consultar ações CRM no período  
3. Calcular parceiros únicos envolvidos
4. Extrair principais realizações:
   - ✅ Eventos realizados
   - 📅 Eventos agendados
   - ✅ Ações CRM concluídas
   - 🔄 Ações em andamento
5. Extrair próximos passos:
   - Next steps das ações CRM
   - Eventos futuros agendados
6. Gerar conteúdo inteligente baseado nos dados
7. Salvar no banco com estrutura JSON completa
```

#### Estrutura do Resumo
```typescript
interface DiarioResumo {
  id: string;
  tipo: 'semanal' | 'mensal' | 'trimestral';
  periodo_inicio: string;
  periodo_fim: string;
  titulo: string;
  conteudo_resumo: string;           // Análise gerada
  total_eventos: number;
  total_acoes_crm: number;
  total_parceiros_envolvidos: number;
  principais_realizacoes: string[];   // Lista detalhada
  proximos_passos: string[];         // Ações futuras
  usuario_gerador_id: string;
  created_at: string;
}
```

### 🤖 **Módulo Assistente IA**

#### Funcionalidades Principais
- **Sugestões Automáticas**: Melhoria de textos, otimizações
- **Workflow de Aprovação**: Pendente → Revisão → Aprovado/Rejeitado
- **Edição Colaborativa**: Admin pode editar antes de aprovar
- **Rastreabilidade**: Histórico completo de decisões
- **Tipos Múltiplos**: Eventos, ações CRM, resumos

#### Fluxo de Aprovação
```typescript
// Estados possíveis:
'pending'   → Aguardando revisão
'approved'  → Aprovado e aplicado
'rejected'  → Rejeitado com observações
'applied'   → Já aplicado ao registro original
```

#### Componentes

**IaAgentInbox.tsx**
```typescript
// Inbox principal com abas:
- Pendentes: Sugestões aguardando revisão
- Aprovadas: Histórico de aprovações
- Rejeitadas: Sugestões rejeitadas
- Filtros: Por tipo, data, status
```

**IaApproveField.tsx** 
```typescript
// Interface de aprovação:
- Conteúdo original vs sugerido
- Campo de edição para ajustes
- Botões aprovar/rejeitar
- Campo de observações
```

## 🔐 Segurança e Controle de Acesso

### 🛡️ **Admin-Only Access**
```typescript
// Verificação em todos os níveis:
1. Página: if (!user || user.papel !== 'admin') return <AccessDenied>;
2. Contexto: Verificação no DiarioContext
3. Database: RLS policies restritivas
4. Components: Props de permissão
```

### 🔒 **Row Level Security**
```sql
-- Todas as tabelas do diário:
CREATE POLICY "Admin access only" ON diario_* 
FOR ALL TO authenticated 
USING (is_admin_user());

-- Função de verificação:
CREATE FUNCTION is_admin_user() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios 
    WHERE id = auth.uid() 
    AND papel = 'admin' 
    AND ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 📋 **Auditoria Completa**
```sql
-- Triggers em todas as tabelas:
- INSERT: Log de criação
- UPDATE: Log de alteração (antes/depois)
- DELETE: Log de exclusão
- Usuário: Quem fez a ação
- Timestamp: Quando foi feita
```

## 🎨 Padrões de Desenvolvimento

### 📦 **Estrutura de Componentes**
```typescript
// Padrão seguido em todos os componentes:
1. Imports organizados (React, UI, custom)
2. Interface props sempre tipada
3. Estado local com useState
4. Contexto via custom hooks
5. Handlers com nomenclatura clara
6. JSX bem estruturado
7. Export default no final
```

### 🎣 **Hooks Customizados**
```typescript
// useDiario(): Hook principal
const { 
  currentView, setCurrentView,
  agendaEventos, createEvento,
  crmAcoes, createAcao,
  resumos, generateResumo,
  sugestoes, approveSugestao
} = useDiario();
```

### 🔄 **Contextos Hierárquicos**
```typescript
// DiarioProvider engloba todos os sub-contextos:
<DiarioProvider>
  <AgendaProvider>
    <CrmProvider>
      <ResumoProvider>
        <IAProvider>
          {children}
        </IAProvider>
      </ResumoProvider>
    </CrmProvider>
  </AgendaProvider>
</DiarioProvider>
```

## 🚀 Integrações Externas (Preparadas)

### 📆 **Google Calendar**
```typescript
// Estrutura preparada em AgendaService.ts:
class GoogleCalendarAPI {
  async syncEvents(): Promise<AgendaEvento[]>
  async createEvent(evento: AgendaEvento): Promise<string>
  async updateEvent(id: string, evento: AgendaEvento): Promise<void>
  async deleteEvent(id: string): Promise<void>
}
```

### 📅 **Outlook Calendar**
```typescript
// Microsoft Graph API integration:
class OutlookCalendarAPI {
  async authenticate(): Promise<string>
  async getEvents(dateRange: DateRange): Promise<AgendaEvento[]>
  async webhookHandler(notification: OutlookWebhook): Promise<void>
}
```

### 🤖 **IA/LLM Integration**
```typescript
// Preparado para OpenAI/Claude/outros:
class IAService {
  async generateSuggestion(content: string, type: string): Promise<string>
  async improveText(original: string): Promise<string>
  async extractInsights(data: any[]): Promise<string>
}
```

## 📊 Performance e Otimização

### ⚡ **Frontend Optimizations**
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoization**: React.memo em componentes pesados
- **Debounced Search**: Busca com delay para reduzir requests
- **Pagination**: Listas grandes com paginação
- **Cache**: Context mantém dados em memória

### 🗄️ **Database Optimizations**
- **Índices**: Todos os campos de consulta têm índices
- **Queries Específicas**: Não usa SELECT *
- **JSONB**: Para dados semi-estruturados
- **Connection Pool**: Supabase gerenciado

## 🎯 Casos de Uso Reais

### 👔 **Executivo de Vendas**
1. **Manhã**: Abre agenda, vê reuniões do dia
2. **Pós-reunião**: Grava áudio rápido no CRM
3. **Define follow-up**: Data + ação específica
4. **Sistema**: Cria evento automático na agenda
5. **Fim da semana**: Gera resumo automático

### 📈 **Diretor Comercial**  
1. **Review semanal**: Gera resumo da equipe
2. **Analisa IA**: Revisa sugestões de melhoria
3. **Exporta relatório**: PDF para board/investidores
4. **Planeja próxima semana**: Base no resumo gerado

### 🤝 **Head de Parcerias**
1. **Evento networking**: Registra contatos coletados
2. **CRM pós-evento**: Grava vídeos de contexto
3. **Agenda follow-ups**: Sistema sugere datas ótimas
4. **IA otimiza**: Melhora textos de apresentação

## 🔧 Troubleshooting

### ❓ **Problemas Comuns**

**Eventos não aparecem na agenda:**
```typescript
// Debug no DiarioCalendar.tsx:
console.log('[DiarioCalendar] Eventos carregados:', agendaEventos.length);
console.log('[DiarioCalendar] Data selecionada:', selectedDate);
// Verificar se datas estão no formato correto
```

**Resumo vazio ou incorreto:**
```typescript
// Verificar no ResumoService.ts:
// 1. Período correto (inicio/fim)
// 2. Dados existem no banco
// 3. Status dos eventos/ações
// 4. Validação de parceiros
```

**Upload de arquivo falha:**
```typescript
// Verificar:
// 1. Políticas RLS do bucket 'diario'
// 2. Usuário é admin
// 3. Formato e tamanho do arquivo
// 4. Conexão com Supabase
```

**IA não gera sugestões:**
```typescript
// Verificar:
// 1. Integração configurada
// 2. Dados suficientes para análise
// 3. Permissões de API
// 4. Rate limits
```

## 📈 Métricas e Analytics

### 📊 **KPIs Monitorados**
- Eventos criados/dia
- Taxa de conclusão de eventos
- Ações CRM por tipo
- Tempo médio de follow-up
- Taxa de aprovação de sugestões IA
- Parceiros mais ativos

### 📋 **Queries Úteis**
```sql
-- Eventos por status últimos 30 dias
SELECT status, COUNT(*) 
FROM diario_agenda_eventos 
WHERE start >= now() - INTERVAL '30 days'
GROUP BY status;

-- Top parceiros por atividade
SELECT e.nome, COUNT(*) as atividades
FROM empresas e
JOIN diario_agenda_eventos dae ON e.id = dae.partner_id
WHERE dae.created_at >= now() - INTERVAL '30 days'
GROUP BY e.nome
ORDER BY atividades DESC;

-- Resumos gerados por período
SELECT period, COUNT(*), 
       AVG(LENGTH(content)) as avg_content_size
FROM diario_resumos 
GROUP BY period;
```

## 🎯 Roadmap e Futuro

### 🔜 **Próximas Versões**
- **Q1 2025**: Integração Google/Outlook funcional
- **Q2 2025**: IA avançada com NLP e transcrições
- **Q3 2025**: App mobile para gravações rápidas  
- **Q4 2025**: Dashboard analytics avançado

### 🧪 **Features Experimentais**
- **Voice Commands**: "Criar evento para próxima terça"
- **Auto-categorização**: IA categoriza ações automaticamente
- **Sentiment Analysis**: Análise de humor em áudios/textos
- **Predictive Scheduling**: IA sugere melhores horários

### 🌟 **Visão Futura**
- **AI Assistant**: Chatbot integrado para consultas
- **Real-time Collaboration**: Múltiplos admins simultâneos
- **Advanced Analytics**: Machine learning para insights
- **API Pública**: Integrações com outras ferramentas

---

## 📞 **Suporte e Documentação**

### 📚 **Documentação Relacionada**
- **[README.md](../README.md)**: Visão geral do sistema
- **[README.sistema.md](../README.sistema.md)**: Arquitetura completa
- **[README.dados.md](../README.dados.md)**: Database detalhado

### 🔧 **Para Desenvolvedores**
- **Setup**: Configurar `.env` com Supabase
- **Database**: Executar migrations do diário
- **Storage**: Configurar buckets e políticas
- **Auth**: Criar usuário admin para testes

### 💬 **Contato**
Para dúvidas específicas do módulo diário, consulte o código-fonte ou entre em contato com a equipe de desenvolvimento.

---

> **Módulo Diário Aeight Partners** - A evolução da gestão executiva através de tecnologia, inteligência artificial e design centrado no usuário.
