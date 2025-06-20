
# Sistema de Controle de Resultados - A&eight

Versão: 2.2.1

## Visão Geral

Sistema abrangente de gestão de oportunidades de negócios com funcionalidades avançadas de controle de resultados, análise de metas e comprobatórios detalhados.

## Funcionalidades Principais

### 1. Controle de Metas
- **Criação de Metas**: Defina metas por quantidade ou valor monetário
- **Períodos Flexíveis**: Configuração mensal ou trimestral
- **Segmentação Avançada**: 
  - Intragrupo: Oportunidades entre empresas do mesmo grupo
  - De Fora para Dentro: Oportunidades de empresas externas para o grupo
  - Tudo: Todas as oportunidades independente do segmento
- **Status de Oportunidade**: Escolha entre considerar todas as oportunidades ou apenas as fechadas com sucesso
- **Comprobatórios**: Visualização detalhada das oportunidades que compõem cada meta

### 2. Filtros de Período Independentes
- **Filtros Específicos**: Controle de período baseado na data de indicação das oportunidades
- **Atalhos Rápidos**: Botões para período atual (mês/ano)
- **Flexibilidade**: Independente dos filtros globais do sistema

### 3. Análise de Resultados
- **Por Grupos**: Análise segmentada com métricas de conversão
- **Por Empresas**: Ranking de performance por empresa
- **Métricas Avançadas**: Taxa de conversão, ticket médio, valores totais

### 4. Tooltips Explicativos
- **Cálculos Transparentes**: Explicação detalhada de como cada métrica é calculada
- **Segmentação Clara**: Definições precisas de cada tipo de segmento
- **Status de Metas**: Critérios de classificação (acima/dentro/abaixo da meta)

## Métricas e Cálculos

### Metas
- **Progresso**: (Realizado ÷ Meta) × 100
- **Status**: 
  - ≥100% = Acima da meta
  - ≥80% = Dentro da meta
  - <80% = Abaixo da meta
- **Realizado**: Soma das oportunidades que atendem aos critérios da meta no período

### Análise de Grupos
- **Taxa de Conversão**: Oportunidades ganhas ÷ Total de oportunidades × 100
- **Ticket Médio**: Valor total ÷ Quantidade total de oportunidades
- **Valor Total**: Soma de todos os valores das oportunidades no período

### Análise por Empresa
- **Quantidade Total**: Número de oportunidades onde a empresa aparece como origem ou destino
- **Taxa de Conversão**: Percentual de oportunidades fechadas com sucesso para cada empresa
- **Ticket Médio**: Valor médio por oportunidade para cada empresa

## Segmentação de Dados

### Tipos de Segmento
1. **Intragrupo**: Oportunidades entre empresas pertencentes ao mesmo grupo
2. **De Fora para Dentro**: Oportunidades originadas de empresas externas (parceiros/clientes) direcionadas para empresas do grupo
3. **Tudo**: Todas as oportunidades, independente da origem ou destino

### Status de Oportunidade na Meta
- **Todas**: Considera todas as oportunidades criadas no período (independente do status)
- **Apenas Ganhas**: Considera apenas oportunidades fechadas com sucesso (status = 'ganho')

## Funcionalidades Técnicas

### Comprobatórios das Metas
- Lista detalhada das oportunidades que compõem cada meta
- Filtros aplicados conforme critérios da meta
- Exportação de dados para análise externa
- Drill-down completo por oportunidade

### Filtros de Período
- Baseados na `data_indicacao` (data de criação da oportunidade)
- Independentes dos filtros globais do contexto
- Aplicação em tempo real nas análises
- Persistência durante navegação entre abas

### Interface Responsiva
- Adaptação automática para diferentes tamanhos de tela
- Tooltips informativos com explicações detalhadas
- Navegação intuitiva por abas
- Cards expansíveis com informações completas

## Estrutura de Dados

### Tabela: metas_oportunidades
```sql
- id: UUID (Primary Key)
- nome: VARCHAR(255) - Nome da meta
- descricao: TEXT - Descrição opcional
- tipo_meta: ENUM('quantidade', 'valor') - Tipo de meta
- valor_meta: NUMERIC - Valor objetivo da meta
- periodo: ENUM('mensal', 'trimestral') - Período de avaliação
- ano: INTEGER - Ano da meta
- mes: INTEGER - Mês (para metas mensais)
- trimestre: INTEGER - Trimestre (para metas trimestrais)
- segmento_grupo: ENUM('intragrupo', 'de_fora_para_dentro', 'tudo')
- status_oportunidade: ENUM('todas', 'ganhas') - Status considerado
- empresa_id: UUID - Empresa específica (opcional)
- ativo: BOOLEAN - Status da meta
- usuario_criador_id: UUID - Usuário que criou a meta
```

## Componentes Principais

### 1. ResultadosControl
- Componente principal de controle
- Gerenciamento de estado dos filtros
- Coordenação entre diferentes análises

### 2. MetasProgress
- Visualização do progresso das metas
- Cards expansíveis com métricas detalhadas
- Botões de ação (editar, excluir, comprobatórios)

### 3. MetaComprobatorios
- Modal com lista detalhada das oportunidades
- Tabela com informações completas
- Filtros aplicados conforme critérios da meta

### 4. ResultadosFilters
- Componente de filtros independentes
- Seletores de data com atalhos
- Aplicação em tempo real

### 5. TooltipHelper
- Componente reutilizável para tooltips
- Textos explicativos centralizados
- Ícones informativos consistentes

## Hooks Personalizados

### useMetas
- Gerenciamento de metas (CRUD)
- Integração com Supabase
- Tratamento de erros e loading

### useMetasProgress
- Cálculo do progresso das metas
- Aplicação de filtros específicos
- Retorno de oportunidades detalhadas

### useResultadosStats
- Cálculos estatísticos por grupo e empresa
- Aplicação de filtros de período
- Métricas de performance

## Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Supabase configurado
- Banco de dados PostgreSQL

### Dependências Principais
- React 18
- TypeScript
- Tailwind CSS
- Radix UI
- React Hook Form
- Zod

### Configuração do Banco
Execute a migração SQL para adicionar o campo `status_oportunidade`:

```sql
ALTER TABLE metas_oportunidades 
ADD COLUMN status_oportunidade VARCHAR(20) 
CHECK (status_oportunidade IN ('todas', 'ganhas')) 
DEFAULT 'todas';
```

## Uso e Navegação

### Acesso ao Módulo
1. Navegue para "Dashboards de Oportunidades"
2. Selecione a aba "Controle de Resultados"
3. Configure filtros de período conforme necessário

### Criação de Metas
1. Clique em "Nova Meta"
2. Preencha os campos obrigatórios
3. Defina segmento e status de oportunidade
4. Salve e acompanhe o progresso

### Análise de Resultados
1. Use os filtros de período para definir o escopo
2. Navegue entre as abas para diferentes visões
3. Utilize tooltips para entender os cálculos
4. Acesse comprobatórios para detalhamento

## Troubleshooting

### Metas não aparecendo
- Verifique se as metas estão ativas
- Confirme se o período está correto
- Verifique permissões de usuário

### Cálculos incorretos
- Confirme filtros de período aplicados
- Verifique segmentação das oportunidades
- Confirme status das oportunidades consideradas

### Performance lenta
- Otimize filtros de período
- Considere indexação de dados
- Verifique conexão com banco de dados

## Changelog

### v2.2.1 (Atual)
- ✅ Adicionado campo `status_oportunidade` nas metas
- ✅ Implementado sistema de comprobatórios detalhados
- ✅ Criado filtros de período independentes
- ✅ Adicionado tooltips explicativos em todas as métricas
- ✅ Refatorado hooks para melhor performance
- ✅ Melhorada interface responsiva
- ✅ Documentação completa atualizada

### v2.1.0
- Implementação inicial do controle de resultados
- Criação de metas básicas
- Análise por grupos e empresas

## Contribuição

Para contribuir com o projeto:
1. Faça fork do repositório
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões estabelecidos
4. Adicione testes e documentação
5. Submeta um pull request

## Suporte

Para suporte técnico ou dúvidas sobre funcionalidades, consulte:
- Documentação técnica interna
- Equipe de desenvolvimento
- Issues no repositório do projeto

---

**Desenvolvido por**: Equipe A&eight  
**Última atualização**: 2025-01-20  
**Versão**: 2.2.1
