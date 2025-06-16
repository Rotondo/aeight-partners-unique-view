# Wishlist & Networking — Aeight Partners Unique View

---

**Esta documentação cobre detalhadamente o módulo de Wishlist & Networking da plataforma Aeight Partners Unique View.**  
Inclui modelagem, fluxos, integrações, políticas, exemplos práticos, tipos globais, cálculos, auditoria, UI/UX e troubleshooting para garantir onboarding rápido, evolução e rastreabilidade.

---

## 📑 Sumário

1. [Visão Geral](#visão-geral)
2. [Modelagem de Dados](#modelagem-de-dados)
    - [Tabelas principais](#tabelas-principais)
    - [Enums e constraints](#enums-e-constraints)
    - [Relacionamentos](#relacionamentos)
3. [Fluxos de Negócio](#fluxos-de-negócio)
    - [Relacionamento empresa-proprietária ↔ cliente](#relacionamento-empresa-proprietária--cliente)
    - [Solicitação de Wishlist](#solicitação-de-wishlist)
    - [Gestão de Apresentações](#gestão-de-apresentações)
    - [Aprovação, rejeição e conversão](#aprovação-rejeição-e-conversão)
4. [Frontend: Estrutura, Componentes e Contexto](#frontend-estrutura-componentes-e-contexto)
    - [Arquitetura](#arquitetura)
    - [Principais componentes](#principais-componentes)
    - [Contexto global e hooks](#contexto-global-e-hooks)
    - [Cálculo de evolução dinâmica](#cálculo-de-evolução-dinâmica)
5. [Políticas, Segurança e Auditoria](#políticas-segurança-e-auditoria)
    - [Policies RLS](#policies-rls)
    - [Triggers e logs de auditoria](#triggers-e-logs-de-auditoria)
6. [Exemplos Práticos de Queries](#exemplos-práticos-de-queries)
7. [Troubleshooting & FAQ](#troubleshooting--faq)
8. [Referências Cruzadas](#referências-cruzadas)

---

## 1. Visão Geral

O módulo **Wishlist & Networking** permite que empresas solicitem conexões estratégicas, aprovem ou rejeitem pedidos, facilitem apresentações e convertam interações em oportunidades reais.  
O fluxo é auditado, seguro, expansível e 100% integrado ao restante do sistema.

---

## 2. Modelagem de Dados

### Tabelas principais

- **empresa_cliente**: vincula empresas proprietárias a clientes, controla status e histórico do relacionamento.
- **wishlist_items**: solicitações de interesse entre empresas, com prioridade, status, datas e observações.
- **wishlist_apresentacoes**: registro de apresentações/facilitações, tipo, status, feedback, histórico e conversão.

### Enums e constraints

- **WishlistStatus**: `pendente`, `em_andamento`, `aprovado`, `rejeitado`, `convertido`
- **TipoApresentacao**: `email`, `reuniao`, `evento`, `digital`, `outro`
- **StatusApresentacao**: `agendada`, `realizada`, `cancelada`

Todos os enums são validados por constraints no banco (ver [README.dados.md](./README.dados.md#enums-globais)).

### Relacionamentos

- Cada wishlist_item vincula três empresas: interessada, desejada, proprietária.
- Um wishlist_item pode gerar múltiplas apresentações.
- Apresentações podem ser convertidas em oportunidades (FK para oportunidades).
- Integridade referencial garantida via FKs e policies.

---

## 3. Fluxos de Negócio

### Relacionamento empresa-proprietária ↔ cliente

- Cadastro via UI dedicada.
- CRUD completo para vínculos, status e histórico.

### Solicitação de Wishlist

- Empresa interessada solicita conexão com uma empresa desejada, mediada pela proprietária.
- Campos: prioridade, motivo, status, datas, observações.
- Criação guiada, busca/filtro e criação dinâmica de cliente.

### Gestão de Apresentações

- Facilitação por email, reunião, evento, digital ou outro.
- Registro de feedback, status, datas, tipo e vínculo ao wishlist_item.
- Conversão direta da apresentação em oportunidade.

### Aprovação, rejeição e conversão

- Apenas a empresa proprietária pode aprovar/rejeitar solicitações.
- Toda ação relevante é auditada (usuário, timestamp, dados anteriores e novos).
- Apresentações aprovadas podem ser convertidas em oportunidades, atualizando os dados em cascata.

---

## 4. Frontend: Estrutura, Componentes e Contexto

### Arquitetura

- **SPA React 18** using TypeScript, Context API e React Router DOM.
- **UI modular** baseada em shadcn/ui e Tailwind CSS.
- **Integração direta com Supabase** para dados e autenticação.

### Principais componentes

- `WishlistDashboard.tsx`: dashboard central, cards de status, atividades recentes, ações rápidas.
- `WishlistItemsPage.tsx`: lista, filtro e CRUD de solicitações.
- `EmpresasClientesPage.tsx`: gestão de base de clientes.
- `ApresentacoesPage.tsx`: controle de apresentações/facilitações.
- `EmptyState.tsx`, `WishlistStatsCards.tsx`: componentes auxiliares para UI/UX.

### Contexto global e hooks

- `WishlistContext.tsx`: centraliza estado, métodos CRUD, fetch, cálculo de estatísticas e evolução.
- Hooks customizados (`useWishlist`, `useToast`).
- Todos os componentes consomem o contexto para máxima coesão.

### Cálculo de evolução dinâmica

- Estatísticas de evolução **sem hardcode**:
    - O contexto calcula a variação percentual dos principais indicadores (solicitações, apresentações, conversões) mês a mês.
    - Os cards exibem sempre a evolução real, considerando histórico, inclusive casos sem dados prévios.

---

## 5. Políticas, Segurança e Auditoria

### Policies RLS

- Apenas empresas envolvidas podem visualizar, criar ou editar seus registros.
- Atualização de status restrita à empresa proprietária.
- Exclusão apenas por usuário criador ou admin.
- Policies completas documentadas em [README.dados.md > Policies](./README.dados.md#policies-rls-por-tabela).

### Triggers e logs de auditoria

- Todas as alterações relevantes são auditadas via triggers no banco.
- Logs contemplam: ação realizada, usuário, timestamps, dados antes/depois.
- Auditoria de fluxo de wishlist/apresentações documentada em [README.dados.md > Auditoria](./README.dados.md#auditoria-e-versionamento-da-wishlist).

---

## 6. Exemplos Práticos de Queries

```sql
-- Buscar todos os wishlist items de uma empresa
SELECT * FROM wishlist_items WHERE empresa_interessada_id = :empresaId OR empresa_proprietaria_id = :empresaId;

-- Buscar apresentações vinculadas a um item
SELECT * FROM wishlist_apresentacoes WHERE wishlist_item_id = :itemId;

-- Contar solicitações por status
SELECT status, COUNT(*) FROM wishlist_items GROUP BY status;

-- Evolução de solicitações mês a mês
SELECT DATE_TRUNC('month', created_at) AS mes, COUNT(*) AS total
FROM wishlist_items
GROUP BY mes
ORDER BY mes DESC;
```

---

## 7. Troubleshooting & FAQ

- **Wishlist não carrega?**  
  Revise policies RLS e vinculação do usuário à empresa.

- **Cálculo de evolução não aparece?**  
  Verifique se há dados históricos no mês anterior; se não houver, o valor pode ser omitido.

- **Erro ao aprovar/rejeitar?**  
  Cheque se o usuário é da empresa proprietária e se as policies estão corretas.

- **Apresentação não converte?**  
  Certifique-se de que a apresentação foi realizada e que o vínculo com oportunidade está ativo.

- **Como auditar ações?**  
  Use a tabela de logs/trigger ou consulte logs via Supabase Dashboard.

---

## 8. Referências Cruzadas

- [README.dados.md > Wishlist & Networking](./README.dados.md#wishlist--networking) — Modelagem, enums e políticas.
- [README.sistema.md > Wishlist & Networking](./README.sistema.md#wishlist--networking) — Fluxos, UI, integrações.
- [README.md > Sumário e navegação](./README.md#6-wishlist--networking)

---

> **Importante:**  
> Toda alteração, expansão de fluxo, nova policy ou integração deste módulo deve ser imediatamente documentada nesta seção e replicada nos macrotemas relacionados.