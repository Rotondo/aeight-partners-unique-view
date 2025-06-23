
# Sistema de Gestão de Oportunidades - A&eight

## Visão Geral

Sistema completo de gestão de oportunidades de negócio, desenvolvido em React/TypeScript com arquitetura modular para análises avançadas de performance de empresas do grupo e fontes indicadoras.

## Arquitetura Modular - Dashboard de Oportunidades

O sistema foi refatorado para uma arquitetura modular com micro-serviços independentes, facilitando manutenção, escalabilidade e desenvolvimento colaborativo.

### Estrutura de Módulos

```
src/modules/
├── dashboard-core/          # Componentes base e tipos compartilhados
├── filters-advanced/        # Sistema de filtros avançados
├── values-analysis/         # Análise de valores com drill-down
├── grupo-performance/       # Performance por empresa do grupo
├── source-indicators/       # Análise de fontes indicadoras
├── cycle-time/             # Análise temporal de fechamento
└── efficiency-internal/     # Dashboard de eficiência interna
```

### Funcionalidades Principais

#### 1. Filtros Avançados
- **Apenas Empresas do Grupo**: Filtra oportunidades destinadas exclusivamente a empresas intragrupo
- **Tipo de Relação**: 
  - Intra: Intragrupo → Intragrupo
  - Extra: Parceiro → Intragrupo
- **Filtros Visuais**: Indicadores ativos dos filtros aplicados

#### 2. Análise de Valores por Status
- **Distribuição Visual**: Gráficos de barras por status
- **Drill-down Interativo**: Clique em qualquer status para ver detalhes das oportunidades
- **Identificação Completa**: Para cada oportunidade:
  - Nome do lead
  - Empresa de origem
  - Valor individual
  - Datas de criação/fechamento
  - Tipo de relação (Intra/Extra)

#### 3. Performance por Empresa do Grupo
- **Ticket Médio Segmentado**: Por tipo de origem (intra vs extra)
- **Rankings de Performance**:
  - Por ticket médio geral
  - Por taxa de conversão
- **Análise Comparativa**: Volume de oportunidades por empresa
- **Métricas de Eficiência**: Comparação de performance interna

#### 4. Análise de Fontes Indicadoras
- **Matriz Origem x Destino**: Valores médios por fonte
- **Ranking de Indicadores**: Quais empresas geram melhores oportunidades
- **ROI por Fonte**: Análise de retorno por tipo de indicação
- **Taxa de Conversão**: Por empresa indicadora

#### 5. Análise Temporal de Fechamento
- **Tempo de Ciclo**: Médio, mínimo, máximo e mediana
- **Comparação Segmentada**: Intra vs extragrupo
- **Gargalos por Empresa**: Identificação de pontos de melhoria
- **Tendências Temporais**: Evolução dos tempos de fechamento

#### 6. Dashboard de Eficiência Interna
- **ROI Segmentado**: Por tipo de indicação
- **Empresas Top Performance**: Melhores receptoras de oportunidades
- **Recomendações Automáticas**: Onde focar esforços
- **Qualidade das Indicações**: Tendências e alertas

### Benefícios da Arquitetura Modular

1. **Modularidade**: Cada análise é independente e reutilizável
2. **Performance**: Lazy loading de módulos não utilizados
3. **Manutenibilidade**: Mudanças isoladas por domínio
4. **Escalabilidade**: Fácil adição de novas análises
5. **Testabilidade**: Testes unitários por módulo
6. **Colaboração**: Equipes podem trabalhar em módulos específicos

### Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Gráficos**: Recharts
- **Gerenciamento de Estado**: Context API + Hooks customizados
- **Backend**: Supabase (PostgreSQL + RLS)
- **Autenticação**: Supabase Auth

### Padrões de Desenvolvimento

#### Estrutura de Módulo
```
modules/[module-name]/
├── components/          # Componentes React específicos
├── hooks/              # Hooks customizados
├── services/           # Lógica de negócio e APIs
├── types/              # Definições TypeScript
└── index.ts            # Exports públicos
```

#### Convenções
- **Componentes**: PascalCase, sufixo com domínio (ex: `GrupoPerformanceAnalysis`)
- **Hooks**: camelCase, prefixo `use` (ex: `useGrupoPerformance`)
- **Types**: PascalCase com sufixo descritivo (ex: `EmpresaPerformance`)
- **Privacidade**: Uso obrigatório do componente `PrivateData` para dados sensíveis

### Métricas de Performance

#### Indicadores Estratégicos
- **Ticket Médio por Segmento**: Intra vs Extra
- **Taxa de Conversão por Empresa**: % de fechamento
- **Tempo de Ciclo**: Dias entre abertura e fechamento
- **ROI por Fonte**: Retorno por tipo de indicação
- **Qualidade das Indicações**: Score baseado em conversão e valor

#### Análises Disponíveis
1. **Quantidades**: Volume de oportunidades por categoria
2. **Valores**: Distribuição financeira com drill-down
3. **Performance Grupo**: Análise focada em empresas internas
4. **Intra vs Extra**: Comparação de eficiência
5. **Recebimento**: Oportunidades "de fora para dentro"
6. **Metas**: Probabilidade de atingimento
7. **Resultados**: Controle de performance geral

### Instalação e Uso

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Configuração do Supabase

O sistema utiliza Row Level Security (RLS) para garantir que usuários só acessem dados de suas respectivas empresas. As políticas são aplicadas automaticamente baseadas no usuário autenticado.

### Contribuição

Para contribuir com o projeto:

1. **Clone o repositório**
2. **Escolha um módulo específico** para trabalhar
3. **Siga os padrões estabelecidos** de nomenclatura e estrutura
4. **Teste isoladamente** o módulo modificado
5. **Documente mudanças** no README específico do módulo

### Próximas Funcionalidades

- [ ] Análise de Fontes Indicadoras (em desenvolvimento)
- [ ] Análise Temporal de Fechamento (planejado)
- [ ] Dashboard de Eficiência Interna (planejado)
- [ ] Alertas automáticos de performance
- [ ] Export de relatórios por módulo
- [ ] Integração com APIs externas de CRM

### Licença

Propriedade da A&eight. Todos os direitos reservados.

---

**Última atualização**: Dezembro 2024  
**Versão**: 2.0.0 - Arquitetura Modular
