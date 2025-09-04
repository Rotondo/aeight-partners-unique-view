# Sistema de Análise de Clientes - Fishbone

## Visão Geral
O sistema de análise de clientes utiliza uma visualização em "espinha de peixe" (fishbone) para mapear a cobertura de fornecedores e parceiros por cliente e etapa da jornada.

## Funcionalidades

### 1. Seleção de Clientes
- Lista todos os clientes ativos (empresas do tipo "cliente")
- Interface de seleção múltipla com busca
- Exibição de badges para clientes selecionados

### 2. Visualização Fishbone
- **Cliente central**: Posicionado no centro da visualização
- **Etapas da jornada**: Dispostas como "espinhas" ao redor do cliente
- **Fornecedores**: Representados como pontos conectados às etapas
- **Subníveis**: Níveis hierárquicos dentro de cada etapa

### 3. Controles de Zoom
- **Overview**: Visão geral com cliente + etapas principais
- **Médio**: Cliente + etapas + subníveis
- **Detalhado**: Visão completa com todos os fornecedores

### 4. Filtros de Visualização
- **Apenas Parceiros**: Mostra somente empresas parceiras
- **Apenas Gaps**: Destaca etapas com lacunas de cobertura

### 5. Estatísticas em Tempo Real
- Número total de clientes selecionados
- Quantidade de etapas da jornada
- Percentual de cobertura geral
- Contadores de parceiros vs fornecedores
- Gaps por etapa específica

## Componentes Principais

### `ClienteFishbonePage`
- Página principal que orquestra toda a funcionalidade
- Gerencia estados de filtros e zoom
- Layout responsivo com sidebar e área principal

### `ClienteSelector`
- Componente de seleção múltipla de clientes
- Busca e filtros integrados
- Exibição de badges para seleções ativas

### `FishboneVisualization`
- Renderização SVG da visualização fishbone
- Sistema de expansão de níveis
- Interatividade com cliques em nós

### `FishboneControls`
- Controles de zoom e filtros
- Exibição de estatísticas em tempo real
- Interface de configuração da visualização

### `useClienteFishbone`
- Hook principal para gerenciamento de dados
- Busca de clientes, etapas e mapeamentos
- Cálculo de estatísticas automatizadas

## Estrutura de Dados

### Tabelas Utilizadas
- `empresas`: Lista de todas as empresas (filtradas por tipo "cliente")
- `etapas_jornada`: Etapas da jornada do cliente
- `subniveis_etapa`: Subníveis hierárquicos das etapas
- `cliente_etapa_fornecedores`: Mapeamento de fornecedores por cliente/etapa
- `parceiros_mapa`: Informações sobre empresas parceiras

### Tipos TypeScript
```typescript
interface ClienteOption {
  id: string;
  nome: string;
  empresa_proprietaria: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
}

interface ClienteFishboneView {
  cliente: {
    id: string;
    nome: string;
    descricao?: string;
  };
  etapas: EtapaFishbone[];
}
```

## Fluxo de Dados

1. **Inicialização**: Carrega todas as empresas do tipo "cliente" ativas
2. **Seleção**: Usuário seleciona um ou mais clientes
3. **Mapeamento**: Sistema busca fornecedores mapeados para cada cliente/etapa
4. **Visualização**: Dados são processados e renderizados no fishbone
5. **Interação**: Usuário pode expandir/contrair níveis e aplicar filtros

## Estados de Loading

- `loadingEstrutura`: Carregamento das etapas da jornada
- `loadingClientes`: Carregamento da lista de clientes
- `loadingDadosCliente`: Carregamento de dados específicos do cliente
- Loading global combinado para UX otimizada

## Tratamento de Erros

- Error Boundary dedicado para a visualização fishbone
- Logs detalhados para debugging
- Fallbacks visuais para estados de erro
- Toast notifications para feedback ao usuário

## Performance

- Queries otimizadas com seleção específica de campos
- Memoização de cálculos estatísticos com `useMemo`
- Debounce em filtros para evitar re-renders excessivos
- Lazy loading de dados conforme necessário

## Responsividade

- Layout adaptativo desktop/mobile
- Sidebar colapsável em telas menores
- Controles touch-friendly para dispositivos móveis
- Zoom adaptativo baseado no viewport

## Extensibilidade

O sistema foi projetado para fácil extensão:
- Novos tipos de visualização podem ser adicionados
- Filtros customizados são facilmente integráveis
- Métricas adicionais podem ser calculadas no hook
- Componentes são modulares e reutilizáveis