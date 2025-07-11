
# Sistema de Gestão de Parcerias e Oportunidades

## Visão Geral
Sistema completo para gestão de parcerias empresariais, oportunidades de negócio e metas organizacionais, desenvolvido com React, TypeScript, Tailwind CSS e Supabase.

## Principais Funcionalidades

### 🎯 Dashboard de Metas
- **Criação e acompanhamento de metas** por quantidade ou valor
- **Comprobatórios detalhados** com análises por status e empresa
- **Gráficos semanais** de distribuição de resultados com ordenação interativa
- **Exportação em PDF** dos relatórios de metas com qualidade aprimorada
- **Filtros avançados** por período, segmento e empresa
- **Resumos por status** com somatórias de ganhas/perdidas/outras
- **Somatórias por empresa origem** com ranking de performance

### 🤝 Mapa de Parceiros
- **Gestão visual de parceiros** com visualização grid/lista
- **Seleção múltipla** de empresas para inclusão como parceiros
- **Interface responsiva** otimizada para mobile e desktop
- **Performance tracking** com indicadores visuais e score do quadrante
- **Associação flexível** de parceiros a diferentes etapas da jornada
- **Painel lateral detalhado** com navegação entre parceiros
- **Badges de etapas associadas** nos cards dos parceiros
- **Feedback visual aprimorado** para empresas já cadastradas
- **Acessibilidade completa** com ARIA labels e navegação por teclado

### 📊 Dashboard Analítico
- **KPIs em tempo real** de oportunidades e conversões
- **Análises de matriz intragrupo** e parcerias externas
- **Gráficos interativos** com Recharts
- **Filtros dinâmicos** por período e segmentação
- **Indicadores de qualidade** e performance de parcerias

### 💼 Gestão de Oportunidades
- **CRUD completo** de oportunidades de negócio
- **Histórico de alterações** com auditoria
- **Atividades associadas** com prazos e responsáveis
- **Status tracking** (em contato, negociando, ganho, perdido)
- **Valores e métricas** de conversão

### 📚 Repositório de Materiais
- **Upload e organização** de documentos e links
- **Categorização** por tags e empresas
- **Controle de acesso** baseado em perfis
- **Versionamento** e controle de validade

### 🎪 Gestão de Eventos
- **Criação e acompanhamento** de eventos comerciais
- **Coleta de contatos** com formulários otimizados
- **Analytics de eventos** com métricas de engajamento
- **Exportação de dados** de contatos coletados

### 📝 Diário Empresarial
- **CRM integrado** com histórico de ações
- **Agenda sincronizada** com eventos externos
- **IA para sugestões** de próximos passos
- **Resumos automáticos** por período

## Arquitetura Técnica

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** com sistema de design consistente
- **Shadcn/UI** para componentes base
- **React Query** para gerenciamento de estado
- **React Router** para navegação
- **Recharts** para visualizações

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com Row Level Security (RLS)
- **Edge Functions** para lógica customizada
- **Storage** para arquivos e documentos
- **Auth** com múltiplos provedores

### Segurança
- **Autenticação JWT** via Supabase Auth
- **Políticas RLS** granulares por tabela
- **Controle de acesso** baseado em roles (admin/user)
- **Auditoria** de alterações críticas

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── dashboard/      # Componentes do dashboard
│   ├── mapa-parceiros/ # Componentes do mapa de parceiros
│   ├── ui/            # Componentes base (shadcn)
│   └── ...
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── types/              # Definições de tipos TypeScript
├── lib/                # Utilitários e configurações
└── integrations/       # Integrações externas (Supabase)
```

## Últimas Atualizações (72h)

### 🔧 Melhorias no Mapa de Parceiros
- **Visualização Grid/Lista** para desktop com alternância
- **Score do Quadrante** integrado aos cards de parceiros
- **Badges de etapas associadas** com indicação visual clara
- **Painel lateral reduzido** com navegação próximo/anterior
- **Feedback aprimorado** para empresas já cadastradas
- **Acessibilidade completa** com ARIA labels e tabindex
- **Performance otimizada** com memoização e handlers desacoplados

### 📈 Aprimoramentos nos Comprobatórios de Metas
- **Ordenação interativa** em todas as colunas da tabela
- **Gráfico semanal otimizado** com tooltip personalizado
- **Exportação PDF** com formatação melhorada
- **Resumos por status** com somatórias detalhadas
- **Análise por empresa origem** com ranking de performance
- **Correções TypeScript** para maior estabilidade

### 🎨 Melhorias de Interface e UX
- **Sistema de cores** semântico consistente
- **Responsividade** aprimorada em todos os componentes
- **Empty states** explicativos e onboarding textual
- **Microcopy** clara para melhor experiência do usuário
- **Loading states** e skeleton screens otimizados

### 🏗️ Otimizações Técnicas
- **Performance** melhorada com memoização adequada
- **Bundle size** otimizado com imports específicos
- **Type safety** aprimorada com correções TypeScript
- **Error handling** mais robusto
- **Código limpo** com componentes focados e reutilizáveis

## Como Executar

### Pré-requisitos
- Node.js 16+
- npm ou yarn
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# Execute em desenvolvimento
npm run dev
```

### Build para Produção
```bash
npm run build
npm run preview
```

## Contribuição

### Padrões de Código
- **TypeScript strict** habilitado
- **ESLint + Prettier** para formatação
- **Commits convencionais** (feat, fix, docs, etc.)
- **Testes unitários** para componentes críticos

### Estrutura de Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug identificado
docs: atualiza documentação
style: ajustes de formatação
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou corrige testes
```

## Roadmap

### 🔮 Próximas Features
- [ ] **Dashboard personalizado** por usuário
- [ ] **Integração com CRMs** externos (HubSpot, Salesforce)
- [ ] **Notificações push** para eventos importantes
- [ ] **Mobile app** nativo com React Native
- [ ] **API pública** para integrações externas

### 🚀 Melhorias Planejadas
- [ ] **Performance** com React Server Components
- [ ] **Offline first** com service workers
- [ ] **Multi-tenancy** para diferentes organizações
- [ ] **Advanced analytics** com Machine Learning
- [ ] **Automações** baseadas em regras de negócio

## Changelog Recente

### v2.1.0 - Melhorias no Mapa de Parceiros
- ✅ Visualização Grid/Lista implementada
- ✅ Score do Quadrante integrado
- ✅ Badges de etapas associadas
- ✅ Painel lateral otimizado
- ✅ Acessibilidade aprimorada
- ✅ Performance e UX melhoradas

### v2.0.1 - Correções e Otimizações
- 🐛 Correção de erros TypeScript
- ⚡ Memoização de componentes pesados
- 🎨 Melhorias na interface dos comprobatórios
- 📊 Gráficos semanais otimizados
- 📄 Exportação PDF aprimorada

## Suporte

Para dúvidas ou suporte técnico:
- 📧 Email: [contato@empresa.com]
- 📱 WhatsApp: [número]
- 🐛 Issues: [link-do-github]

---

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 2.1.0
**Status:** ✅ Produção
