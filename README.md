
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
- **Visualização em Jornada** - Nova interface visual que apresenta os parceiros organizados por etapas da jornada do e-commerce
- **Trilha Visual Interativa** - Layout em forma de trilha com etapas conectadas, permitindo navegação intuitiva
- **Subníveis Expansíveis** - Cada etapa pode ter subníveis que se expandem ao clicar, mostrando parceiros específicos
- **Logos dos Parceiros** - Integração com sistema de logos que aparecem nos cards, repositório e OnePager
- **Gestão Dupla de Visualização**:
  - **Modo Jornada**: Visualização sequencial das etapas com trilha visual
  - **Modo Grade**: Visualização grid/lista tradicional com filtros avançados
- **Performance tracking** com indicadores visuais e score do quadrante
- **Associação flexível** de parceiros a diferentes etapas e subníveis
- **Painel lateral detalhado** com navegação entre parceiros
- **Badges de etapas associadas** nos cards dos parceiros
- **Interface responsiva** otimizada para mobile e desktop
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
- **Integração com logos** dos parceiros

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
│   │   ├── JornadaVisualization.tsx    # Nova visualização em jornada
│   │   ├── MapaParceirosGrid.tsx       # Visualização em grade
│   │   ├── ParceiroCard.tsx            # Cards dos parceiros
│   │   └── ...
│   ├── ui/            # Componentes base (shadcn)
│   └── ...
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── types/              # Definições de tipos TypeScript
├── lib/                # Utilitários e configurações
└── integrations/       # Integrações externas (Supabase)
```

## Últimas Atualizações (Atual)

### 🚀 Nova Visualização em Jornada - Mapa de Parceiros
- **Interface Visual Revolucionária**: Substituição da visualização tradicional por uma trilha visual das etapas da jornada do e-commerce
- **Navegação Intuitiva**: Etapas conectadas por linha visual com indicadores coloridos personalizáveis
- **Expansão de Subníveis**: Ao clicar em uma etapa, os subníveis se expandem mostrando a hierarquia completa
- **Cards de Parceiros Otimizados**: 
  - Suporte a logos dos parceiros com dimensionamento automático
  - Indicadores de performance com sistema de cores
  - Badges de status com design aprimorado
- **Dupla Visualização**: Alternância entre modo Jornada e modo Grade via tabs
- **Refatoração Arquitetural**: Separação em componentes focados para melhor manutenibilidade

### 🔧 Melhorias Técnicas
- **Correção de Erros TypeScript**: Resolução definitiva dos problemas de tipagem com `performance_score`
- **Componentes Modulares**: Separação da lógica em componentes especializados:
  - `JornadaVisualization.tsx` - Visualização da trilha
  - `MapaParceirosGrid.tsx` - Grade de parceiros
  - `MapaParceirosPage.tsx` - Orquestração principal (reduzido)
- **Performance Otimizada**: Lazy loading e memoização adequada dos componentes
- **Responsividade Aprimorada**: Layout adaptativo para todos os tamanhos de tela

### 🎨 Design e UX
- **Sistema Visual Coerente**: Cores, espaçamentos e tipografia padronizados
- **Logos dos Parceiros**: Suporte completo a logos com fallback para iniciais
- **Indicadores Visuais**: Sistema de cores para performance e status
- **Navegação Fluida**: Transições suaves entre estados e componentes
- **Empty States**: Estados vazios informativos e calls-to-action claros

## Roadmap

### 🔮 Próximas Features
- [ ] **Dashboard personalizado** por usuário
- [ ] **Integração com CRMs** externos (HubSpot, Salesforce)
- [ ] **Notificações push** para eventos importantes
- [ ] **Mobile app** nativo com React Native
- [ ] **API pública** para integrações externas
- [ ] **Sistema de workflows** para automação de processos
- [ ] **Analytics avançada** da jornada de parceiros

### 🚀 Melhorias Planejadas
- [ ] **Performance** com React Server Components
- [ ] **Offline first** com service workers
- [ ] **Multi-tenancy** para diferentes organizações
- [ ] **Advanced analytics** com Machine Learning
- [ ] **Automações** baseadas em regras de negócio
- [ ] **Relatórios customizáveis** com exportação avançada

## Changelog Recente

### v3.0.0 - Revolução Visual do Mapa de Parceiros
- ✅ **Nova Visualização em Jornada**: Interface completamente redesenhada
- ✅ **Trilha Visual Interativa**: Navegação por etapas com linha conectora
- ✅ **Suporte a Logos**: Integração completa com sistema de logos
- ✅ **Componentes Refatorados**: Arquitetura modular e focada
- ✅ **Dupla Visualização**: Tabs para alternar entre Jornada e Grade
- ✅ **Correções TypeScript**: Resolução definitiva de erros de tipagem
- ✅ **Performance Otimizada**: Loading states e componentes otimizados

### v2.1.0 - Melhorias no Mapa de Parceiros (Anterior)
- ✅ Visualização Grid/Lista implementada
- ✅ Score do Quadrante integrado
- ✅ Badges de etapas associadas
- ✅ Painel lateral otimizado
- ✅ Acessibilidade aprimorada

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
- **Componentes focados** (máximo 300 linhas)

### Estrutura de Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug identificado
docs: atualiza documentação
style: ajustes de formatação
refactor: refatoração sem mudança de funcionalidade
test: adiciona ou corrige testes
```

## Suporte

Para dúvidas ou suporte técnico:
- 📧 Email: [contato@empresa.com]
- 📱 WhatsApp: [número]
- 🐛 Issues: [link-do-github]

---

**Última atualização:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 3.0.0
**Status:** ✅ Produção - Nova Interface Jornada
