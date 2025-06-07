
# Aeight Partners Unique View

**Repositório:** [Rotondo/aeight-partners-unique-view](https://github.com/Rotondo/aeight-partners-unique-view)

## Sumário

- [Descrição](#descrição)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Banco de Dados](#banco-de-dados)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Stack e principais dependências](#stack-e-principais-dependências)
- [Padrão de código e boas práticas](#padrão-de-código-e-boas-práticas)
- [Deploy e Produção](#deploy-e-produção)
- [Licença](#licença)

---

## Descrição

Sistema web completo para gestão, acompanhamento e análise de oportunidades de negócio, indicadores estratégicos, empresas e parcerias da Aeight Partners. O projeto é desenvolvido em **TypeScript** com **React**, utilizando **Supabase** como backend, roteamento via `react-router-dom` e UI moderna baseada em [shadcn/ui](https://ui.shadcn.com/).

O sistema permite o controle completo do funil de vendas, análise de performance de parcerias, gestão de indicadores e visualizações analíticas avançadas para tomada de decisão estratégica.

---

## Arquitetura do Sistema

### Frontend
- **React 18** com **TypeScript** para type safety
- **Vite** como bundler e dev server
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes de interface
- **Recharts** para visualizações de dados
- **React Router DOM** para roteamento SPA
- **Context API** para gerenciamento de estado global

### Backend
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** como banco de dados principal
- **Row Level Security (RLS)** para controle de acesso
- **Real-time subscriptions** para atualizações em tempo real
- **Edge Functions** para lógica customizada

### Autenticação e Segurança
- Sistema de autenticação via Supabase Auth
- Controle de acesso baseado em papéis (admin, user, manager)
- Políticas RLS para segurança em nível de linha
- Validação de UUIDs e integridade referencial

---

## Banco de Dados

### Estrutura Principal

#### Tabelas de Entidades

**empresas**
- `id` (UUID, PK) - Identificador único
- `nome` (TEXT) - Nome da empresa
- `tipo` (ENUM) - Tipo: 'intragrupo', 'parceiro', 'cliente'
- `status` (BOOLEAN) - Status ativo/inativo
- `descricao` (TEXT) - Descrição opcional
- `created_at` (TIMESTAMP) - Data de criação

**usuarios**
- `id` (UUID, PK) - Identificador único (referência auth.users)
- `nome` (TEXT) - Nome do usuário
- `email` (TEXT) - Email do usuário
- `papel` (ENUM) - Papel: 'admin', 'user', 'manager'
- `empresa_id` (UUID, FK) - Empresa associada
- `ativo` (BOOLEAN) - Status ativo/inativo
- `created_at` (TIMESTAMP) - Data de criação

**contatos**
- `id` (UUID, PK) - Identificador único
- `empresa_id` (UUID, FK) - Empresa associada
- `nome` (TEXT) - Nome do contato
- `email` (TEXT) - Email do contato
- `telefone` (TEXT) - Telefone do contato
- `created_at` (TIMESTAMP) - Data de criação

#### Tabela Central - Oportunidades

**oportunidades**
- `id` (UUID, PK) - Identificador único
- `empresa_origem_id` (UUID, FK) - Empresa que indica
- `empresa_destino_id` (UUID, FK) - Empresa que recebe indicação
- `contato_id` (UUID, FK) - Contato relacionado
- `usuario_envio_id` (UUID, FK) - Usuário que envia
- `usuario_recebe_id` (UUID, FK) - Usuário responsável
- `nome_lead` (TEXT) - Nome do lead/oportunidade
- `valor` (NUMERIC) - Valor da oportunidade
- `status` (ENUM) - Status: 'em_contato', 'negociando', 'ganho', 'perdido', etc.
- `data_indicacao` (TIMESTAMP) - Data da indicação
- `data_fechamento` (TIMESTAMP) - Data de fechamento
- `motivo_perda` (TEXT) - Motivo da perda (se aplicável)
- `observacoes` (TEXT) - Observações gerais
- `created_at` (TIMESTAMP) - Data de criação

#### Gestão de Atividades

**atividades_oportunidade**
- `id` (UUID, PK) - Identificador único
- `oportunidade_id` (UUID, FK) - Oportunidade relacionada
- `titulo` (TEXT) - Título da atividade
- `descricao` (TEXT) - Descrição da atividade
- `data_prevista` (DATE) - Data prevista
- `data_realizada` (DATE) - Data realizada
- `concluida` (BOOLEAN) - Status de conclusão
- `usuario_responsavel_id` (UUID, FK) - Usuário responsável
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

#### Histórico e Auditoria

**historico_oportunidade**
- `id` (UUID, PK) - Identificador único
- `oportunidade_id` (UUID, FK) - Oportunidade alterada
- `usuario_id` (UUID, FK) - Usuário que fez a alteração
- `campo_alterado` (TEXT) - Campo que foi alterado
- `valor_antigo` (TEXT) - Valor anterior
- `valor_novo` (TEXT) - Novo valor
- `data_alteracao` (TIMESTAMP) - Data da alteração

#### Indicadores e Analytics

**indicadores_parceiro**
- `id` (UUID, PK) - Identificador único
- `empresa_id` (UUID, FK) - Empresa avaliada
- `potencial_leads` (INTEGER) - Potencial de leads
- `base_clientes` (INTEGER) - Base de clientes
- `engajamento` (INTEGER) - Nível de engajamento
- `alinhamento` (INTEGER) - Alinhamento estratégico
- `potencial_investimento` (INTEGER) - Potencial de investimento
- `tamanho` (ENUM) - Tamanho: 'PP', 'P', 'M', 'G', 'GG'
- `score_x` (NUMERIC) - Score eixo X do quadrante
- `score_y` (NUMERIC) - Score eixo Y do quadrante
- `data_avaliacao` (TIMESTAMP) - Data da avaliação

**share_icp**
- `id` (UUID, PK) - Identificador único
- `empresa_id` (UUID, FK) - Empresa avaliada
- `share_of_wallet` (NUMERIC) - Participação na carteira
- `icp_alinhado` (BOOLEAN) - ICP alinhado
- `observacoes` (TEXT) - Observações
- `created_at` (TIMESTAMP) - Data de criação

#### Gestão de Conteúdo

**categorias**
- `id` (UUID, PK) - Identificador único
- `nome` (TEXT) - Nome da categoria
- `descricao` (TEXT) - Descrição da categoria
- `created_at` (TIMESTAMP) - Data de criação

**onepager**
- `id` (UUID, PK) - Identificador único
- `empresa_id` (UUID, FK) - Empresa associada
- `categoria_id` (UUID, FK) - Categoria do OnePager
- `nome` (TEXT) - Nome do OnePager
- `url` (TEXT) - URL do OnePager
- `icp` (TEXT) - ICP (Ideal Customer Profile)
- `oferta` (TEXT) - Oferta da empresa
- `diferenciais` (TEXT) - Diferenciais competitivos
- `cases_sucesso` (TEXT) - Cases de sucesso
- `big_numbers` (TEXT) - Números importantes
- `ponto_forte` (TEXT) - Principal ponto forte
- `ponto_fraco` (TEXT) - Principal ponto fraco
- `contato_nome` (TEXT) - Nome do contato
- `contato_email` (TEXT) - Email do contato
- `contato_telefone` (TEXT) - Telefone do contato
- `nota_quadrante` (NUMERIC) - Nota no quadrante
- `url_imagem` (TEXT) - URL da imagem
- `arquivo_upload` (TEXT) - Arquivo carregado
- `data_upload` (TIMESTAMP) - Data do upload

**repositorio_materiais**
- `id` (UUID, PK) - Identificador único
- `empresa_id` (UUID, FK) - Empresa associada
- `categoria_id` (UUID, FK) - Categoria do material
- `nome` (VARCHAR) - Nome do material
- `tipo_arquivo` (VARCHAR) - Tipo do arquivo
- `tag_categoria` (ARRAY) - Tags de categoria
- `url_arquivo` (TEXT) - URL do arquivo
- `arquivo_upload` (BYTEA) - Arquivo em binário
- `validade_contrato` (DATE) - Validade do contrato
- `usuario_upload` (UUID) - Usuário que fez upload
- `data_upload` (TIMESTAMP) - Data do upload

### Enums Utilizados

```sql
-- Tipos de empresa
CREATE TYPE company_type AS ENUM ('intragrupo', 'parceiro', 'cliente');

-- Status de oportunidade
CREATE TYPE opportunity_status AS ENUM (
  'em_contato', 
  'negociando', 
  'ganho', 
  'perdido', 
  'Contato', 
  'Apresentado', 
  'Sem contato'
);

-- Papéis de usuário
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager');

-- Tamanhos de empresa
CREATE TYPE company_size AS ENUM ('PP', 'P', 'M', 'G', 'GG');
```

### Relacionamentos Principais

1. **Oportunidades ↔ Empresas**: Uma oportunidade conecta empresa origem e destino
2. **Oportunidades ↔ Usuários**: Usuário de envio e usuário responsável
3. **Atividades ↔ Oportunidades**: Múltiplas atividades por oportunidade
4. **Histórico ↔ Oportunidades**: Auditoria completa de alterações
5. **Indicadores ↔ Empresas**: Métricas de performance por empresa
6. **OnePager ↔ Empresas**: Materiais promocionais por empresa

---

## Funcionalidades

### 📊 Dashboard Principal
- **Visão Geral de KPIs**: Métricas consolidadas de oportunidades
- **Gráficos Interativos**: 
  - Distribuição por status
  - Taxas de conversão mensais
  - Análise de valores do pipeline
  - Matriz intragrupo vs parcerias
- **Filtros Avançados**: Por período, empresa, status e usuário
- **Exportação de Dados**: Relatórios em diferentes formatos

### 🎯 Gestão de Oportunidades
- **CRUD Completo**: Criar, editar, visualizar e excluir oportunidades
- **Workflow de Status**: Acompanhamento do funil de vendas
- **Gestão de Atividades**: Tasks relacionadas a cada oportunidade
- **Histórico de Alterações**: Auditoria completa de mudanças
- **Filtros Inteligentes**: Busca por múltiplos critérios
- **Indicadores de Atividade**: Status visual de pendências

### 🏢 Gestão de Empresas
- **Cadastro de Empresas**: Intragrupo, parceiros e clientes
- **Gestão de Contatos**: Múltiplos contatos por empresa
- **Categorização**: Sistema flexível de categorias
- **Status de Ativação**: Controle de empresas ativas/inativas

### 📈 Indicadores Estratégicos
- **Métricas de Performance**: Potencial de leads, engajamento, alinhamento
- **Quadrante Analítico**: Visualização estratégica de parcerias
- **Scores Personalizados**: Eixos X e Y configuráveis
- **Análise de Tamanho**: Classificação PP, P, M, G, GG
- **Share of Wallet**: Participação na carteira de clientes

### 📋 OnePager e Repositório
- **OnePagers Estruturados**: Templates padronizados
- **Upload de Materiais**: Gestão de arquivos por categoria
- **Tags Inteligentes**: Sistema de categorização flexível
- **Controle de Validade**: Alertas para contratos vencendo
- **Busca Avançada**: Localização rápida de materiais

### 🔐 Administração
- **Gestão de Usuários**: Controle de acesso e papéis
- **Configuração de Categorias**: Organização do sistema
- **Gestão de Tags**: Sistema de etiquetagem
- **Auditoria Completa**: Logs de todas as ações
- **Configurações de Sistema**: Personalização avançada

### 🔍 Analytics Avançados
- **Matriz de Relacionamentos**: Visualização de indicações
- **Qualidade de Indicações**: Análise de conversão por origem
- **Ranking de Parceiros**: Top performers em indicações
- **Balanço Grupo vs Parcerias**: Fluxo bidirecional
- **Análise de Valores**: Pipeline financeiro detalhado

---

## Estrutura do Projeto

```
src/
│
├── App.tsx                     # Componente raiz e configuração das rotas
├── main.tsx                    # Bootstrap da aplicação
├── App.css / index.css         # Estilos globais
├── vite-env.d.ts              # Tipos do Vite
│
├── components/                 # Componentes reutilizáveis
│   ├── admin/                  # Área administrativa
│   │   ├── AdminPage.tsx
│   │   ├── EmpresasList.tsx
│   │   ├── UsuariosList.tsx
│   │   └── ...
│   │
│   ├── auth/                   # Autenticação
│   │   ├── LoginForm.tsx
│   │   └── PrivateRoute.tsx
│   │
│   ├── dashboard/              # Dashboard e métricas
│   │   ├── DashboardStats.tsx
│   │   ├── StatusDistributionChart.tsx
│   │   ├── ConversionRatesChart.tsx
│   │   ├── MatrizIntragrupoChart.tsx
│   │   └── ...
│   │
│   ├── layout/                 # Layouts e navegação
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── AppSidebar.tsx
│   │
│   ├── oportunidades/          # Gestão de oportunidades
│   │   ├── OportunidadesContext.tsx    # Context Provider
│   │   ├── OportunidadesList.tsx
│   │   ├── OportunidadesForm.tsx
│   │   ├── OportunidadesDetails.tsx
│   │   ├── OportunidadesFilter.tsx
│   │   ├── ActivityIndicator.tsx
│   │   └── ...
│   │
│   ├── quadrante/              # Análise quadrante
│   │   ├── QuadranteChart.tsx
│   │   └── QuadranteForm.tsx
│   │
│   ├── onepager/               # Gestão de OnePagers
│   │   ├── OnePagerViewer.tsx
│   │   ├── OnePagerForm.tsx
│   │   └── OnePagerUpload.tsx
│   │
│   ├── privacy/                # Privacidade e demo
│   │   ├── DemoModeToggle.tsx
│   │   └── PrivateData.tsx
│   │
│   └── ui/                     # Componentes de UI base
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── chart.tsx
│       └── ...
│
├── hooks/                      # Hooks personalizados
│   ├── useAuth.tsx            # Hook de autenticação
│   ├── useDashboardStats.ts   # Hook para stats do dashboard
│   └── use-toast.ts           # Hook para notificações
│
├── integrations/               # Integrações externas
│   └── supabase/
│       ├── client.ts          # Cliente Supabase
│       └── types.ts           # Tipos do banco
│
├── lib/                        # Funções utilitárias
│   ├── supabase.ts            # Configuração Supabase
│   ├── utils.ts               # Utilitários gerais
│   ├── dbFunctions.ts         # Funções de banco
│   ├── dbFunctionsValues.ts   # Funções de valores
│   └── dbFunctionsActivities.ts # Funções de atividades
│
├── pages/                      # Páginas principais
│   ├── Dashboard.tsx
│   ├── admin.tsx
│   ├── oportunidades.tsx
│   ├── oportunidades-dashboard.tsx
│   ├── onepager.tsx
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── empresas/
│   │   └── EmpresasPage.tsx
│   ├── indicadores/
│   │   └── IndicadoresPage.tsx
│   ├── quadrante/
│   │   └── QuadrantePage.tsx
│   └── repositorio/
│       └── RepositorioPage.tsx
│
├── types/                      # Tipos TypeScript
│   └── index.ts               # Tipos globais e interfaces
│
└── contexts/                   # Contexts globais
    └── PrivacyContext.tsx     # Context de privacidade
```

---

## Como rodar localmente

### Pré-requisitos
- **Node.js** >= 18.0.0
- **pnpm** (recomendado), npm ou yarn
- **Conta Supabase** (para backend)

### Configuração do Ambiente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Rotondo/aeight-partners-unique-view.git
   cd aeight-partners-unique-view
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   # ou npm install
   # ou yarn install
   ```

3. **Configure o Supabase:**
   - Acesse [supabase.com](https://supabase.com) e crie um projeto
   - Execute as migrations SQL presentes no diretório `supabase/`
   - Configure as variáveis de ambiente no Supabase (se necessário)

4. **Inicie o projeto:**
   ```bash
   pnpm dev
   # ou npm run dev
   # ou yarn dev
   ```

5. **Acesse a aplicação:**
   - Abra [http://localhost:5173](http://localhost:5173) no navegador

### Configuração do Banco de Dados

O projeto utiliza Supabase com as seguintes configurações essenciais:

1. **Row Level Security (RLS)** habilitado em todas as tabelas
2. **Políticas de segurança** baseadas em autenticação
3. **Triggers** para auditoria automática
4. **Funções customizadas** para validações

---

## Scripts disponíveis

```json
{
  "dev": "Inicia o servidor de desenvolvimento",
  "build": "Gera o build de produção",
  "preview": "Visualiza o build de produção localmente",
  "lint": "Executa o linter ESLint"
}
```

---

## Stack e principais dependências

### Core
- **React** 18.3.1 - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário

### UI e Componentes
- **@radix-ui/* (múltiplos)** - Componentes primitivos acessíveis
- **shadcn/ui** - Sistema de design baseado em Radix
- **lucide-react** 0.462.0 - Ícones SVG
- **class-variance-authority** - Variants de componentes

### Roteamento e Estado
- **react-router-dom** 6.26.2 - Roteamento SPA
- **Context API** - Gerenciamento de estado global

### Backend e Dados
- **@supabase/supabase-js** 2.49.5 - Cliente Supabase
- **@tanstack/react-query** 5.56.2 - Cache e sincronização de dados

### Visualizações e Gráficos
- **recharts** 2.12.7 - Biblioteca de gráficos
- **d3** 7.8.5 - Manipulação de dados para visualizações

### Formulários e Validação
- **react-hook-form** 7.53.0 - Gestão de formulários
- **@hookform/resolvers** 3.9.0 - Resolvers para validação
- **zod** 3.23.8 - Schema validation

### Utilitários
- **date-fns** 3.6.0 - Manipulação de datas
- **clsx** + **tailwind-merge** - Utilities para classes CSS
- **sonner** 1.5.0 - Sistema de notificações toast

---

## Padrão de código e boas práticas

### Organização
- **Componentes pequenos e focados**: Máximo 100-150 linhas
- **Separação de responsabilidades**: Lógica, UI e dados separados
- **Reutilização**: Componentes genéricos na pasta `ui/`
- **Tipagem forte**: TypeScript em 100% do código

### Convenções de Nomenclatura
- **Componentes**: PascalCase (`OportunidadesList.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useOportunidades`)
- **Utilitários**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_STATUS`)

### Estrutura de Componentes
```typescript
// Imports organizados: React, libs externas, internos
import React from 'react';
import { Button } from '@/components/ui/button';
import { useOportunidades } from './OportunidadesContext';

// Interface dos props (quando aplicável)
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Componente funcional com tipos
export const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks no topo
  const { data, loading } = useOportunidades();
  
  // Handlers e funções auxiliares
  const handleClick = () => {
    onAction();
  };
  
  // Renderização condicional
  if (loading) return <LoadingSpinner />;
  
  // JSX limpo e legível
  return (
    <div className="space-y-4">
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};
```

### Gestão de Estado
- **Context API** para estado global (autenticação, oportunidades)
- **useState** para estado local de componentes
- **TanStack Query** para cache de dados do servidor
- **Zustand** (quando necessário) para estado complexo

### Estilização
- **Tailwind CSS** como padrão
- **shadcn/ui** para componentes base
- **Variants API** para variações de componentes
- **Responsive design** obrigatório

### Tratamento de Erros
- **Try-catch** apenas quando necessário
- **Error boundaries** para erros de React
- **Toast notifications** para feedback ao usuário
- **Logging** adequado para debugging

---

## Deploy e Produção

### Build de Produção
```bash
# Gerar build otimizado
pnpm build

# Testar build localmente
pnpm preview
```

### Deployment na Vercel
O projeto está configurado para deploy automático na **Vercel**:

1. **Configuração automática**: `vercel.json` já configurado
2. **Variáveis de ambiente**: Configurar no painel da Vercel
3. **Deploy contínuo**: Conectado ao repositório GitHub
4. **Otimizações**: Tree-shaking, code splitting automático

### Variáveis de Ambiente Necessárias
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Monitoramento
- **Logs de aplicação**: Via Vercel Analytics
- **Logs do banco**: Via Supabase Dashboard
- **Performance**: Web Vitals automático
- **Erros**: Sentry (configurar se necessário)

---

## Segurança e Compliance

### Autenticação
- **JWT tokens** via Supabase Auth
- **Session management** automático
- **Password policies** configuráveis
- **Multi-factor authentication** (disponível)

### Autorização
- **Role-based access control** (RBAC)
- **Row Level Security** (RLS) em todas as tabelas
- **Políticas granulares** por funcionalidade
- **Validação de UUIDs** em todas as operações

### Dados
- **Backup automático** via Supabase
- **Criptografia** em trânsito e em repouso
- **Auditoria completa** de alterações
- **LGPD compliance** (configurável)

---

## Roadmap e Próximos Passos

### Funcionalidades Planejadas
- [ ] **Dashboard em tempo real** - WebSockets para atualizações live
- [ ] **Exportação avançada** - PDF, Excel com templates
- [ ] **Notificações push** - Alertas para atividades importantes
- [ ] **Mobile app** - React Native para acesso móvel
- [ ] **IA/ML insights** - Previsões e recomendações automáticas

### Melhorias Técnicas
- [ ] **Testes automatizados** - Jest + Testing Library
- [ ] **Storybook** - Documentação de componentes
- [ ] **Performance optimization** - Lazy loading, memoization
- [ ] **Offline support** - PWA capabilities
- [ ] **Monitoring avançado** - Sentry, DataDog

---

## Suporte e Documentação

### Links Úteis
- **Supabase Dashboard**: [Dashboard do Projeto](https://supabase.com/dashboard/project/amuadbftctnmckncgeua)
- **Vercel Deploy**: [Status do Deploy](https://vercel.com/dashboard)
- **GitHub Issues**: [Reportar Problemas](https://github.com/Rotondo/aeight-partners-unique-view/issues)

### Contato Técnico
Para questões técnicas, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

---

## Licença

Este projeto é **privado** e de uso exclusivo da **Aeight Partners**.  
Todos os direitos reservados. Para uso, distribuição ou contribuições, consulte o responsável pelo repositório.

---

*Documentação atualizada em: Janeiro 2025*
*Versão do sistema: 2.0*
*Versão do banco: Schema v1.5*
