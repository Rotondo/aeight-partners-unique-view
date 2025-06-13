# Aeight Partners Unique View — Sistema, Operações e Padrões

---

Este documento cobre **exaustivamente** tudo relacionado a arquitetura, operação, padrões, integração e devops do Aeight Partners Unique View — incluindo frontend, backend, devops, segurança, deploy, troubleshooting, exemplos e fluxos, com referências cruzadas para [README.dados.md](./README.dados.md) sempre que necessário.

---

## 📑 Sumário

1. [Visão Arquitetural](#visão-arquitetural)
2. [Frontend](#frontend)
   - [Stack, padrões e organização](#stack-padrões-e-organização)
   - [Fluxos principais e exemplos](#fluxos-principais-e-exemplos)
   - [Componentização e guidelines](#componentização-e-guidelines)
   - [Scripts, setup e troubleshooting](#scripts-setup-e-troubleshooting)
3. [Backend](#backend)
   - [Supabase: Auth, Database, Edge Functions](#supabase-auth-database-edge-functions)
   - [Integração Frontend ↔ Backend](#integração-frontend-↔-backend)
   - [API RESTful, realtime e exemplos](#api-restful-realtime-e-exemplos)
   - [Validação, policies e segurança](#validação-policies-e-segurança)
4. [DevOps, Deploy & Monitoramento](#devops-deploy--monitoramento)
   - [Deploy Vercel, scripts e variáveis](#deploy-vercel-scripts-e-variáveis)
   - [CI/CD, boas práticas](#cicd-boas-práticas)
   - [Monitoramento, logs e alertas](#monitoramento-logs-e-alertas)
5. [Segurança & Compliance](#segurança--compliance)
   - [Autenticação e autorização](#autenticação-e-autorização)
   - [Policies globais e práticas seguras](#policies-globais-e-práticas-seguras)
   - [Proteção contra falhas e LGPD](#proteção-contra-falhas-e-lgpd)
6. [Padrões de Código & Convenções](#padrões-de-código--convenções)
   - [Estrutura, nomenclatura, exemplos](#estrutura-nomenclatura-exemplos)
   - [Testes, documentação e Storybook](#testes-documentação-e-storybook)
   - [Fluxo de desenvolvimento e boas práticas](#fluxo-de-desenvolvimento-e-boas-práticas)
7. [Troubleshooting & FAQ Avançado](#troubleshooting--faq-avançado)
8. [Roadmap Técnico & Integrações Futuras](#roadmap-técnico--integrações-futuras)
9. [Wishlist & Networking](#wishlist--networking)
10. [Referências Cruzadas](#referências-cruzadas)

---

## 1. Visão Arquitetural

O Aeight Partners Unique View adota arquitetura moderna, desacoplada, escalável, baseada em SPA React, backend serverless (Supabase), integração transparente e práticas devops de ponta.

- **SPA React 18** — com roteamento, contexto global, componentes inteligentes e UI modular.
- **Supabase** — database PostgreSQL, autenticação, storage, edge functions, realtime.
- **DevOps** — deploy contínuo via Vercel, versionamento GitHub, scripts automatizados.
- **Segurança** — JWT, RBAC, RLS, políticas customizadas de Storage, criptografia ponta a ponta.
- **Observabilidade** — logs, alertas, analytics, auditoria de ações críticas.

**Visão de alto nível do fluxo:**
Usuário acessa SPA → autentica (Supabase Auth) → consome APIs fortemente tipadas (Supabase Client) → dados e arquivos tratados via policies e triggers → feedback visual imediato e logs/auditoria garantem rastreabilidade.

---

## 2. Frontend

### Stack, padrões e organização

- **React 18.x**
- **TypeScript** (100% do código)
- **Vite** (desenvolvimento, build e HMR)
- **Tailwind CSS** (estilos utilitários, responsividade)
- **shadcn/ui** (componentes acessíveis e customizáveis)
- **Recharts** (gráficos, dashboards)
- **React Router DOM** (SPA navigation)
- **Context API** (auth, oportunidades, temas)
- **React Query** (cache, sync de dados, optimistic updates)
- **date-fns** (datas), **clsx**, **zod** (schemas), **react-hook-form**

#### Organização de arquivos

```
src/
  components/
    admin/
    auth/
    dashboard/
    layout/
    oportunidades/
    onepager/
    privacy/
    quadrante/
    ui/
  hooks/
  integrations/
    supabase/
  lib/
  pages/
  types/
  contexts/
  wishlist/
```
**Detalhe dos domínios e exemplos em cada pasta**:
- `components/admin/`: gestão de empresas, usuários, categorias.
- `components/auth/`: login, rotas privadas.
- `components/dashboard/`: KPIs, gráficos, filtros.
- `components/oportunidades/`: CRUD, contexto, detalhes, histórico, atividades.
- `components/onepager/`: upload, preview, formulário.
- `components/ui/`: botões, tabelas, dialogs, gráficos, inputs base.
- `components/wishlist/`: dashboards, cards, fluxos de networking.

#### Estrutura de types

- Todos os tipos globais e interfaces compartilhadas em `types/index.ts`.
- Tipos do banco gerados automaticamente em `integrations/supabase/types.ts` (ver [README.dados.md]).

#### Scripts principais

```json
{
  "dev": "pnpm dev",
  "build": "pnpm build",
  "preview": "pnpm preview",
  "lint": "pnpm lint",
  "test": "pnpm test",
  "storybook": "pnpm storybook"
}
```

### Fluxos principais e exemplos

**Exemplo — CRUD de Oportunidades:**

1. Usuário acessa `/oportunidades`
2. Lista renderizada via `OportunidadesList.tsx` (dados via React Query)
3. Nova oportunidade via `OportunidadesForm.tsx` (validação zod, react-hook-form)
4. Atualizações sincronizadas em tempo real (Supabase subscription)
5. Histórico e auditoria exibidos em `OportunidadesDetails.tsx`

**Exemplo — Upload de material:**

1. Usuário (autenticado) acessa `RepositorioPage.tsx`
2. Seleciona arquivo, categoria, empresa
3. Upload via Supabase Storage, registro criado em `repositorio_materiais`
4. Preview/renderização via modal/componentes dedicados
5. Exclusão com duplo check (frontend + backend/policy, logs)

**Exemplo — Wishlist & Networking:**

1. Usuário acessa `/wishlist` e visualiza dashboard, cards de status.
2. Cria solicitações de wishlist (empresa interessada → proprietária → desejada).
3. Proprietária aprova/rejeita, pode facilitar apresentação.
4. Fluxo auditado, histórico de apresentações, conversão em oportunidade.

### Componentização e guidelines

- Componentes **pequenos (<150 linhas)**, focados e reutilizáveis
- **Props fortemente tipados**
- Hooks customizados para lógica de negócio e integração (`useAuth`, `useDashboardStats`, `useToast`, `useWishlist`)
- **Composição**: layouts via `MainLayout.tsx`, navegação via `Sidebar.tsx`
- **Testes unitários** para componentes críticos

### Scripts, setup e troubleshooting

- **Setup local:**
  - Clone, `pnpm install`, configure `.env`, rode `pnpm dev`
  - Políticas e variáveis detalhadas em [README.dados.md] e seção DevOps abaixo

- **Problemas comuns:**
  - Falha de login? Verifique `.env`, políticas Supabase e cross-origin.
  - Erro de policy? Veja logs Supabase e seção [Policies] no outro macrotema.
  - Falha em wishlist/networking? Cheque permissão do usuário na empresa, policies de wishlist.

---

## 3. Backend

### Supabase: Auth, Database, Edge Functions

- **Auth**: JWT, OAuth, SSO, controle por papel (`user_role`)
- **Database**: PostgreSQL, migrations versionadas, RLS obrigatório, triggers de auditoria
- **Edge Functions**: lógica customizada (validações, webhooks, eventos)
- **Realtime**: subscriptions para dashboards e notificações

**Exemplo — Política RLS para oportunidades:**

```sql
CREATE POLICY "Read own opportunities"
ON public.oportunidades
FOR SELECT
USING (usuario_envio_id = auth.uid() OR usuario_recebe_id = auth.uid());
```

**Exemplo — Política RLS para wishlist:**

```sql
CREATE POLICY "Read own wishlist items"
ON public.wishlist_items
FOR SELECT
USING (
  empresa_interessada_id = auth.uid_empresa()
  OR empresa_proprietaria_id = auth.uid_empresa()
);
```

**Edge Function — Auditoria de exclusão de material:**
```sql
CREATE OR REPLACE FUNCTION log_exclusao_material()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO log_materiais_excluidos(material_id, usuario_id, data_exclusao)
  VALUES (OLD.id, auth.uid(), now());
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```
Mais exemplos em [README.dados.md].

### Integração Frontend ↔ Backend

- Supabase Client inicializado em `integrations/supabase/client.ts`
- Hooks customizados para fetch, mutação e subscrição (React Query)
- Autenticação persistida via Context/API do Supabase
- Todas as requisições respeitam policies de banco/storage/wishlist

**Fluxo seguro:**
1. Frontend solicita operação
2. Supabase verifica autenticação/autorização
3. Policies de RLS e Storage validam acesso
4. Operação registrada/auditada

### API RESTful, realtime e exemplos

- **CRUD** via Supabase Client e hooks React Query
- **Realtime** para dashboards e atividades
- **Exemplo de chamada:**
```typescript
const { data, error } = await supabase
  .from('oportunidades')
  .select('*')
  .eq('usuario_envio_id', user.id);
```
- **Wishlist:** Hooks para fetch, criação, atualização, deleção, aprovação, conversão e histórico de apresentações.

---

## 4. DevOps, Deploy & Monitoramento

### Deploy Vercel, scripts e variáveis

- **Deploy automático** via integração com GitHub
- **vercel.json** configurado para build, preview, produção
- **Variáveis de ambiente**: seguras, nunca versionadas
- **Scripts automatizados**: build, preview, lint, test, storybook

**Variáveis principais:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Adicionais para integrações externas se necessário

### CI/CD, boas práticas

- **PRs obrigatórios** para alterações em produção
- **Preview automático** para cada branch
- **Linters e testes** rodam em pré-commit/hook e CI
- **Monitoramento**: Analytics Vercel, logs, alertas (Sentry/DataDog sugerido)

**Exemplo — vercel.json:**
```json
{
  "builds": [{ "src": "src/main.tsx", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/main.tsx" }]
}
```

### Monitoramento, logs e alertas

- **Logs Vercel** para frontend (build, runtime)
- **Supabase Dashboard** para erros de banco, policies, storage
- **Sentry/DataDog**: recomendados para rastreamento de exceções
- **Notificações de falhas**: Slack/email via Vercel/Supabase

---

## 5. Segurança & Compliance

### Autenticação e autorização

- **Supabase Auth**: padrão JWT, integrado ao frontend
- **Controle de sessão**: expiração, refresh automático
- **RBAC**: papéis de usuário (admin, user, manager), policies de banco e storage
- **Multi-factor authentication**: disponível via Supabase

### Policies globais e práticas seguras

- **RLS obrigatório** em todas as tabelas
- **Policies de Storage** detalhadas no [README.dados.md]
- **Validação de UUIDs e referências**
- **Criptografia**: dados em trânsito (SSL) e em repouso (Supabase)
- **Backups automáticos** (via Supabase)

### Proteção contra falhas e LGPD

- **Logs de auditoria** para toda alteração crítica
- **Respeito à LGPD**: exclusão de dados, logs de consentimento, minimização de dados sensíveis
- **Recuperação de desastres**: backup, restore, versionamento (detalhado em [README.dados.md])

---

## 6. Padrões de Código & Convenções

### Estrutura, nomenclatura, exemplos

- **Componentes**: PascalCase (`EmpresasList.tsx`)
- **Hooks**: camelCase com `use` (`useEmpresas`)
- **Utils**: camelCase (`formatCurrency`)
- **Constantes**: UPPER_SNAKE_CASE (`DEFAULT_STATUS`)

**Exemplo de componente padrão:**
```typescript
import React from 'react';
import { Button } from '@/components/ui/button';

interface ExampleProps {
  title: string;
  onAction: () => void;
}

export const Example: React.FC<ExampleProps> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onAction}>Executar</Button>
    </div>
  );
};
```

### Testes, documentação e Storybook

- **Testes unitários**: Jest + React Testing Library
- **Storybook**: para UI, documentação viva dos componentes
- **Cobertura mínima**: 80% para domínios críticos
- **Documentação inline**: sempre que a lógica for não trivial

### Fluxo de desenvolvimento e boas práticas

- **Branches**: main (prod), develop (homolog), features/hotfixes
- **Commits semânticos**
- **Pull Requests revisados**
- **Padronização de imports, formatação com Prettier**

---

## 7. Troubleshooting & FAQ Avançado

- **Erro 401/403?** Verifique policies RLS, Storage e sessão Supabase.
- **Falha no upload/exclusão de material?** Veja policies detalhadas no [README.dados.md], revise logs Supabase.
- **Problemas de deploy?** Cheque logs Vercel, variáveis de ambiente, build.
- **Problemas de autenticação?** Revise configuração de Auth no Supabase e integração frontend.
- **Como auditar operações críticas?** Veja triggers/auditoria em [README.dados.md].
- **Wishlist não carrega ou não salva?** Cheque se o usuário pertence à empresa proprietária/interessada, policies RLS, ou permissões específicas.

---

## 8. Roadmap Técnico & Integrações Futuras

- [ ] Dashboard realtime (subscriptions avançadas)
- [ ] Exportação avançada (PDF, Excel)
- [ ] Notificações push
- [ ] Mobile app (React Native/PWA)
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Integração SSO corporativo
- [ ] Monitoramento fullstack (Sentry/DataDog)
- [ ] Expansão dos fluxos de wishlist/networking
- [ ] Logs de auditoria detalhados na wishlist/apresentações

---

## 9. Wishlist & Networking

### Visão Geral

Funcionalidade para **gestão estratégica de interesses, solicitações e apresentações entre empresas** do ecossistema, acelerando o networking e a geração de oportunidades.

### Fluxos Principais

1. **Relacionamento empresa proprietária ↔ empresa cliente**
   - Tabela `empresa_cliente` armazena vínculos, status e histórico.
   - CRUD via UI dedicada para empresas/clientes.

2. **Solicitação de Wishlist (WishlistItem)**
   - Empresa interessada solicita conexão com outra empresa (desejada), mediada por empresa proprietária.
   - Campos: prioridade, motivo, status, datas, observações.
   - Criação guiada com busca/filtro e criação rápida de cliente.
   - Status controlado: `pendente`, `em_andamento`, `aprovado`, `rejeitado`, `convertido`.

3. **Gestão de Apresentações (WishlistApresentacao)**
   - Facilitação de apresentações (email, reunião, evento, digital, outro).
   - Registro de feedback, status, vinculação de oportunidade.

4. **Aprovação/Rejeição**
   - Apenas empresa_proprietaria pode aprovar/rejeitar solicitações.
   - Auditoria de todas ações críticas.

5. **Conversão em Oportunidade**
   - Apresentação pode ser convertida em oportunidade diretamente.

### UI/UX

- Navegação dedicada (`/wishlist`), dashboard com cards e estatísticas.
- Filtros dinâmicos, badges de status, modais de criação/edição.
- Feedback visual para cada operação (sucesso, erro, loading).
- Integração total com contexto global e hooks customizados.

### Integração Técnica

- Contexto global `WishlistContext` para centralizar estado e lógica.
- Hooks para fetch, criação, atualização, deleção e estatísticas.
- Permissões controladas por policies Supabase e checagem frontend.
- Auditoria automática via triggers e logs.

### Exemplo de Fluxo

1. Usuário acessa `/wishlist`, visualiza dashboard com cards de status.
2. Cria novo item de wishlist via modal, selecionando empresas e prioridade.
3. Empresa proprietária recebe notificação e aprova/rejeita.
4. Se aprovado, apresentação é registrada e pode ser convertida em oportunidade.

### Referência cruzada:  
- [Modelagem de dados e políticas detalhadas da Wishlist](./README.dados.md#wishlist--networking)

---

## 10. Referências Cruzadas

- [README.md](./README.md) — Visão geral, onboarding, FAQ e sumário executivo.
- [README.dados.md](./README.dados.md) — Modelagem de dados, enums, RLS, auditoria.

---
