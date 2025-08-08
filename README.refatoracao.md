
# Refatoração do Sistema - Relatório Técnico

## Arquivos Refatorados

### 1. useMapaParceiros.ts (349 → 4 arquivos modulares)

**Problema**: Hook muito longo com múltiplas responsabilidades
**Solução**: Dividido em módulos especializados:

- `useMapaParceirosData.ts`: Gerenciamento de dados
- `useMapaParceirosActions.ts`: Operações CRUD  
- `useMapaParceirosFilters.ts`: Filtros e estatísticas
- `useMapaParceiros.ts`: Hook principal combinado

### 2. MapaParceiroAdmin.tsx (790 → 3 arquivos)

**Problema**: Componente extremamente longo com lógica complexa
**Solução**: Separado em:

- `EtapaForm.tsx`: Formulário de etapas
- `SubnivelForm.tsx`: Formulário de subníveis  
- `MapaParceiroAdmin.tsx`: Componente principal simplificado

## Benefícios Alcançados

### Manutenibilidade
- Arquivos menores e mais focados
- Responsabilidades bem definidas
- Código mais legível e organizando

### Reutilização
- Componentes de formulário reutilizáveis
- Hooks modulares para diferentes contextos
- Separação clara entre lógica de negócio e apresentação

### Performance
- Carregamento otimizado de módulos
- Hooks especializados evitam re-renders desnecessários
- Componentes menores reduzem tempo de compilação

### Testabilidade
- Módulos independentes são mais fáceis de testar
- Mocks mais simples para testes unitários
- Isolamento de funcionalidades facilita debugging

## Métricas de Melhoria

| Arquivo Original | Linhas | Arquivos Resultantes | Linhas Totais | Redução |
|------------------|--------|---------------------|---------------|---------|
| useMapaParceiros.ts | 349 | 4 arquivos | ~300 | Melhor organização |
| MapaParceiroAdmin.tsx | 790 | 3 arquivos | ~400 | ~50% redução |

## Padrões Aplicados

### Separation of Concerns
- Dados, ações e filtros separados
- UI separada da lógica de negócio
- Formulários como componentes independentes

### Single Responsibility Principle
- Cada hook/componente tem uma responsabilidade
- Funções pequenas e focadas
- Interfaces bem definidas

### DRY (Don't Repeat Yourself)
- Componentes de formulário reutilizáveis
- Lógica comum centralizada
- Tipos TypeScript compartilhados

## Próximas Refatorações

### MapaParceirosGrid.tsx (251 linhas)
**Sugestão**: Dividir em:
- `ParceiroCard.tsx`: Card individual do parceiro
- `GridControls.tsx`: Controles de ordenação/filtro
- `MapaParceirosGrid.tsx`: Container principal

### MapaParceirosSidebar.tsx (261 linhas)  
**Sugestão**: Dividir em:
- `SidebarFilters.tsx`: Controles de filtro
- `EtapasList.tsx`: Lista de etapas navegável
- `MapaParceirosSidebar.tsx`: Container principal

## Convenções Estabelecidas

### Estrutura de Pastas
```
src/
  hooks/
    useMapaParceiros/
      useMapaParceirosData.ts
      useMapaParceirosActions.ts
      useMapaParceirosFilters.ts
    useMapaParceiros.ts
  components/
    admin/
      MapaParceiroAdmin/
        EtapaForm.tsx
        SubnivelForm.tsx
      MapaParceiroAdmin.tsx
```

### Nomenclatura
- Hooks: `use[Feature][Responsibility]`
- Componentes: `[Feature][ComponentType]`
- Tipos: Interface com nome descritivo

### Imports/Exports
- Imports específicos para melhor tree-shaking
- Exports nomeados para clareza
- Index files para facilitar imports

## Impacto no Desenvolvimento

### Novos Desenvolvedores
- Código mais fácil de entender
- Responsabilidades claramente definidas
- Documentação mais focada

### Debugging
- Erros mais localizados
- Stack traces mais limpos
- Logs mais específicos

### Manutenção
- Mudanças isoladas em módulos específicos
- Menor risco de regressões
- Testes mais direcionados

---

## Wishlist ↔ Oportunidades – Fluxo unificado (a partir da implementação)

Objetivo: iniciar sempre na Wishlist e automatizar a criação de Oportunidade e o sincronismo de status, respeitando um recorte temporal de ativação.

### Como funciona

1) Ao aprovar um item na Wishlist, criamos automaticamente uma apresentação com `fase_pipeline: "aprovado"`.
2) Quando a apresentação evolui para `apresentado`, criamos automaticamente uma Oportunidade (se habilitado por feature flag) e vinculamos em `wishlist_apresentacoes.oportunidade_id`.
3) O status inicial da Oportunidade é derivado da `fase_pipeline` via utilitário `mapPipelineToOpportunityStatus`.
4) O `wishlist_items.status` é atualizado para `convertido` quando a oportunidade é criada/vinculada.
5) (Opcional) Sincronismo reverso: quando a Oportunidade muda de status, a `fase_pipeline` correspondente é atualizada via `mapOpportunityToPipeline`.

### Origem e destino da Oportunidade

- `solicitacao`: `empresa_interessada_id` → `empresa_desejada_id`
- `oferta`: `empresa_proprietaria_id` → `empresa_desejada_id`

Implementado em `src/utils/opportunitySync.ts` (`deriveOrigemEDestino`).

### Mapeamentos de status

Implementados em `src/utils/opportunitySync.ts`:

- Wishlist → Oportunidade (criação): `mapPipelineToOpportunityStatus`
- Oportunidade → Wishlist (sincronismo): `mapOpportunityToPipeline`

### Recorte temporal e feature flags

Controlado em `src/config/featureFlags.ts`:

```ts
export const features = {
  wishlistOpportunitySync: {
    enabled: false,
    startAt: null, // ISO string, ex.: "2025-07-20T00:00:00Z"
    createOnPresented: true,
    backSyncStatusEnabled: false,
  },
}
```

Observações:
- Se `enabled=false`, nenhuma criação automática ocorre.
- `startAt` define o corte: apresentações com `created_at` anterior não disparam criação.
- O sincronismo reverso só roda com `backSyncStatusEnabled=true`.

### Pontos de integração

- Criação automática: `src/hooks/useWishlistMutations/apresentacao.ts` (no `updateApresentacao`)
- Conversão manual: `convertToOportunidade` agora também vincula `wishlist_apresentacoes.oportunidade_id` e marca `converteu_oportunidade`.
- Sincronismo reverso: `src/components/oportunidades/OportunidadesContext.tsx` (no `updateOportunidade`)

### Alterações de tipos

- `WishlistApresentacao` passa a ter `tipo_solicitacao?: "solicitacao" | "oferta"`.

### Ativação em produção

1) Defina `features.wishlistOpportunitySync.enabled = true` e ajuste `startAt`.
2) (Opcional) Habilite `backSyncStatusEnabled` após validação.
3) Verifique permissões RLS e teste com um fluxo:
   - Aprovar item → apresentação (aprovado) → apresentação (apresentado) → oportunidade criada e vinculada.
   - Alterar status da oportunidade para ganho/perdido → refletir no pipeline.
