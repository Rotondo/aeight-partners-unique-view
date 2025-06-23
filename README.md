
# Sistema de Gestão de Oportunidades e Parcerias

Sistema completo para gestão de oportunidades de negócio, análise de performance e controle de parcerias estratégicas.

## 🏗️ Nova Arquitetura Modular

O sistema foi refatorado para uma arquitetura baseada em **micro-serviços independentes**, melhorando manutenibilidade, performance e escalabilidade.

### 📁 Estrutura de Módulos

```
src/modules/
├── dashboard-core/          # Tipos e componentes base reutilizáveis
├── filters-advanced/        # Sistema de filtros avançados
├── quick-answers/          # Respostas rápidas para perguntas de negócio
├── values-analysis/        # Análise de valores com drill-down
├── grupo-performance/      # Performance por empresa do grupo
├── cycle-time/            # Análise temporal de fechamento
└── [futuros módulos]/     # Análises específicas modulares
```

### 🎯 Benefícios da Nova Arquitetura

- **Modularidade**: Cada análise é independente e reutilizável
- **Performance**: Lazy loading de módulos não utilizados
- **Manutenibilidade**: Mudanças isoladas por domínio
- **Escalabilidade**: Fácil adição de novas análises
- **Testabilidade**: Testes unitários por módulo
- **Colaboração**: Equipes podem trabalhar em módulos específicos

## 🚀 Funcionalidades Principais

### 📊 Dashboard de Oportunidades Reformulado

#### 1. **Respostas Rápidas** ⚡
Seção dedicada que responde automaticamente às perguntas mais frequentes:
- **Quantas oportunidades vieram no período?**
- **Quantas foram para cada empresa?**
- **Qual empresa envia as melhores oportunidades?**
- **Qual o ticket médio de cada empresa?**
- **Quantas oportunidades temos em aberto?**

#### 2. **Filtros Avançados** 🔍
- **Apenas Empresas do Grupo**: Filtra oportunidades destinadas ao grupo
- **Tipo de Relação**: 
  - Intra (intragrupo → intragrupo)
  - Extra (parceiro → intragrupo)
- **Indicador Visual**: Mostra quando filtros estão ativos

#### 3. **Análise de Valores com Drill-Down** 💰
- Cards interativos por status
- Lista detalhada por oportunidade
- Informações: Nome do lead, Empresa origem, Valor, Datas
- **Ticket médio corrigido**: Calculado apenas para oportunidades COM VALOR

#### 4. **Performance por Empresa do Grupo** 🏢
- Ticket médio segmentado (intra vs extragrupo)
- Rankings de performance
- Taxa de conversão por tipo de origem
- Comparação de volumes e eficiência

#### 5. **Análise de Tempo de Ciclo** ⏱️
- **Métricas completas**: Tempo médio, mínimo, máximo e **mediana**
- Análise por empresa do grupo
- Identificação de gargalos
- Oportunidades em aberto destacadas
- Comparação intra vs extragrupo

#### 6. **Sistema de Tooltips** 💡
- Explicações claras para todos os gráficos
- Contextualização dos dados
- Definições de métricas
- Sugestões de ação baseadas nos dados

### 🛠️ Melhorias de UX

#### ✅ Problemas Corrigidos
- **Filtro "Apenas Empresas do Grupo"**: Agora funciona corretamente
- **Cálculo de Ticket Médio**: Considera apenas oportunidades com valor > 0
- **Redundâncias Removidas**: Eliminado gráfico "Distribuição por Status" duplicado
- **Clareza dos Dados**: Tooltips explicativos em todos os componentes
- **Foco no Grupo**: Análises centradas nas empresas receptoras do grupo

#### 🎨 Interface Melhorada
- Layout responsivo e intuitivo
- Indicadores visuais de filtros ativos
- Cards interativos com drill-down
- Rankings visuais e fáceis de interpretar
- Dados privados protegidos com componente `PrivateData`

## 📈 Métricas e KPIs

### 🎯 Métricas Principais
- **Total de Oportunidades** (por período/empresa)
- **Taxa de Conversão** (por fonte/destino)
- **Ticket Médio** (apenas oportunidades com valor)
- **Tempo de Ciclo** (média, mediana, min/max)
- **Oportunidades em Aberto** (contador em tempo real)
- **Ranking de Fontes** (por qualidade e volume)

### 📊 Análises Especializadas
- **Performance Intragrupo**: Foco nas empresas do grupo como receptoras
- **Qualidade das Fontes**: Ranking de empresas indicadoras
- **Eficiência Temporal**: Gargalos e oportunidades de melhoria
- **ROI por Segmento**: Comparação intra vs extragrupo

## 🔧 Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + Shadcn/UI + Lucide Icons
- **Backend**: Supabase (Database + Auth + RLS)
- **Charts**: Recharts
- **Estado**: Context API + Custom Hooks
- **Dados**: React Query (@tanstack/react-query)

## 🚀 Como Usar

### 1. **Acesso ao Dashboard**
- Navegue para `/oportunidades-dashboard`
- Use os filtros básicos (data, empresa, status)
- Ative filtros avançados conforme necessário

### 2. **Respostas Rápidas**
- Primeira aba do dashboard
- Visualize automaticamente as métricas principais
- Use os rankings para identificar melhores fontes

### 3. **Análises Detalhadas**
- **Valores**: Clique nos cards de status para drill-down
- **Performance Grupo**: Compare ticket médio e conversão
- **Tempo de Ciclo**: Identifique gargalos por empresa
- **Quantidades**: Analise matrizes e distribuições

### 4. **Filtros Inteligentes**
- **"Apenas Empresas do Grupo"**: Foque no que importa
- **"Tipo de Relação"**: Segmente por origem das oportunidades
- **Indicador Visual**: Saiba quando filtros estão ativos

## 🎯 Casos de Uso

### Para Gestores
- **Identificar** melhores fontes de oportunidades
- **Monitorar** performance por empresa do grupo
- **Otimizar** tempos de ciclo de fechamento
- **Priorizar** oportunidades em aberto

### Para Comercial
- **Foco** em empresas com maior ticket médio
- **Acompanhamento** de oportunidades por status
- **Identificação** de gargalos no processo
- **Relatórios** automáticos de performance

### Para Parcerias
- **Ranking** de parceiros por qualidade
- **ROI** por tipo de parceria
- **Tendências** de indicações recebidas/enviadas
- **Oportunidades** de melhoria em relacionamentos

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] **Análise de Fontes Indicadoras**: Matriz origem x destino detalhada
- [ ] **Dashboard de Eficiência Interna**: Métricas estratégicas e recomendações
- [ ] **Alertas Inteligentes**: Notificações baseadas em performance
- [ ] **Relatórios Automatizados**: Exports e envios programados
- [ ] **Integração com CRM**: Sincronização de dados externos
- [ ] **Machine Learning**: Previsões de conversão e recomendações

### Melhorias Técnicas
- [ ] **Testes Automatizados**: Cobertura completa dos módulos
- [ ] **Performance**: Otimizações de queries e rendering
- [ ] **PWA**: Funcionalidades offline
- [ ] **API**: Endpoints para integrações externas

## 🤝 Contribuição

### Padrões de Desenvolvimento
1. **Um módulo = Uma responsabilidade**
2. **Hooks personalizados** para lógica de negócio
3. **Componentes pequenos** e focados
4. **TypeScript strict mode**
5. **Dados privados** sempre protegidos

### Estrutura de Módulo
```
modules/[nome-modulo]/
├── components/     # Componentes React
├── hooks/         # Hooks personalizados
├── types/         # Tipos TypeScript
├── utils/         # Utilitários específicos
└── index.ts       # Exports públicos
```

### Como Adicionar um Novo Módulo
1. Crie a estrutura de pastas
2. Implemente hooks de dados
3. Crie componentes de apresentação
4. Adicione ao dashboard principal
5. Documente o caso de uso

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- 📧 **Email**: [contato@exemplo.com]
- 💬 **Chat**: Sistema interno de mensagens
- 📚 **Docs**: Documentação técnica atualizada
- 🐛 **Issues**: Reporte bugs e solicite features

---

**Sistema em constante evolução** 🚀  
*Última atualização: Janeiro 2025*
