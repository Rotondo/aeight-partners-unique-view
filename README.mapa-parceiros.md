
# Mapa de Parceiros - Sistema de Gestão

## Visão Geral

O sistema de Mapa de Parceiros é uma funcionalidade completa para gerenciar parceiros em diferentes etapas da jornada do e-commerce. Foi desenvolvido com foco em modularidade, escalabilidade e facilidade de manutenção.

## Arquitetura Refatorada

### Hooks Modulares (`src/hooks/useMapaParceiros/`)

O hook principal foi refatorado em módulos especializados:

- **`useMapaParceirosData.ts`**: Gerencia carregamento de dados do Supabase
- **`useMapaParceirosActions.ts`**: Operações CRUD (criar, atualizar, deletar parceiros)
- **`useMapaParceirosFilters.ts`**: Lógica de filtros e estatísticas
- **`useMapaParceiros.ts`**: Hook principal que combina os módulos

### Componentes Administração (`src/components/admin/MapaParceiroAdmin/`)

Componentes administrativos foram modularizados:

- **`EtapaForm.tsx`**: Formulário para criar/editar etapas
- **`SubnivelForm.tsx`**: Formulário para criar/editar subníveis
- **`MapaParceiroAdmin.tsx`**: Componente principal simplificado

## Estrutura de Dados

### Tabelas Principais

1. **`etapas_jornada`**: Etapas da jornada do e-commerce
2. **`subniveis_etapa`**: Subníveis de cada etapa
3. **`parceiros_mapa`**: Parceiros cadastrados
4. **`asociacoes_parceiro_etapa`**: Relacionamento parceiros-etapas

### Tipos TypeScript

Todos os tipos estão definidos em `src/types/mapa-parceiros.ts`:
- `EtapaJornada`
- `SubnivelEtapa`
- `ParceiroMapa`
- `AssociacaoParceiroEtapa`
- `MapaParceirosFiltros`
- `MapaParceirosStats`

## Funcionalidades

### Visualização
- **Grid View**: Cards visuais dos parceiros
- **List View**: Visualização em lista
- **Journey View**: Mapa visual da jornada

### Filtros
- Busca por nome/descrição
- Filtro por status (ativo/inativo/pendente)
- Filtro por etapa da jornada
- Filtro por subnível
- Visualização apenas de gaps (etapas sem parceiros)

### Administração
- Criar/editar/deletar etapas
- Criar/editar/deletar subníveis
- Reordenar etapas e subníveis
- Ativar/desativar elementos
- Gestão de associações parceiro-etapa

## Como Usar

### Importar o Hook Principal
```typescript
import { useMapaParceiros } from '@/hooks/useMapaParceiros';

const { 
  etapas, 
  parceiros, 
  filtros, 
  stats,
  criarParceiro,
  associarParceiroEtapa 
} = useMapaParceiros();
```

### Usar Componentes de Administração
```typescript
import MapaParceiroAdmin from '@/components/admin/MapaParceiroAdmin';

// No seu componente
<MapaParceiroAdmin />
```

## Benefícios da Refatoração

1. **Modularidade**: Código dividido em responsabilidades específicas
2. **Manutenibilidade**: Arquivos menores e mais focados
3. **Reutilização**: Componentes e hooks especializados
4. **Testabilidade**: Módulos independentes são mais fáceis de testar
5. **Performance**: Carregamento otimizado de dados

## Próximos Passos

1. Implementar testes unitários para os hooks
2. Adicionar validação de formulários com Zod
3. Implementar cache de dados com React Query
4. Adicionar funcionalidade de exportação de dados
