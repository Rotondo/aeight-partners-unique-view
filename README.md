
# Plataforma A&eight - Sistema de Gestão de Oportunidades e Networking

[![Versão](https://img.shields.io/badge/versão-2.2.0-blue.svg)](https://github.com/seu-usuario/aeight-platform)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/seu-usuario/aeight-platform/actions)

## 📋 Sobre o Projeto

A Plataforma A&eight é um sistema completo de gestão empresarial focado em networking, indicações de negócios e acompanhamento de oportunidades. Desenvolvida especificamente para grupos empresariais que necessitam de uma ferramenta robusta para gerenciar relacionamentos entre empresas internas (intragrupo) e externas (parceiros e clientes).

## 🚀 Funcionalidades Principais

### 📊 Dashboard de Oportunidades
- **Análise de Quantidades**: Visualização completa das oportunidades por status, distribuição e matrizes
- **Análise de Valores**: Funil de valores e análise financeira detalhada
- **Análise Intra vs Extragrupo**: Comparação entre oportunidades internas e externas
- **🎯 Controle de Resultados** (NOVO v2.2.0):
  - Sistema completo de metas (quantidade e valor)
  - Metas mensais e trimestrais
  - Análise por segmentos (Intragrupo, De Fora para Dentro, Total)
  - Acompanhamento de progresso em tempo real
  - Análise detalhada por empresa com KPIs de performance

### 📈 Sistema de Metas e Controle
- **Criação de Metas**: Flexibilidade para definir metas por quantidade ou valor financeiro
- **Periodicidade**: Configuração mensal ou trimestral
- **Segmentação**: Metas específicas por tipo de relacionamento empresarial
- **Acompanhamento**: Progress bars visuais e alertas de performance
- **Relatórios**: Análise comparativa entre realizado vs. planejado

### 🏢 Gestão de Oportunidades
- Cadastro completo de oportunidades com rastreamento de origem
- Sistema de status personalizável (Em Contato, Negociando, Ganho, Perdido)
- Histórico completo de alterações com auditoria
- Filtros avançados por período, empresa, status e responsável
- Integração com sistema de empresas e contatos

### 📅 Módulo Diário (v2.1.0)
- **Agenda Inteligente**: Sincronização com calendários externos (.ics)
- **CRM Integrado**: Registro de atividades por texto, áudio e vídeo
- **IA Assistant**: Sugestões automatizadas e análise de conteúdo
- **Resumos Automatizados**: Relatórios periódicos com exportação

### 🎪 Gestão de Eventos (v2.1.0)
- **Criação de Eventos**: Sistema completo para networking events
- **Coleta de Contatos**: Interface otimizada para captura rápida
- **Analytics de Eventos**: Métricas de engajamento e conversão
- **Exportação de Dados**: Relatórios em múltiplos formatos

### 👥 Gestão de Empresas e Contatos
- Cadastro de empresas com categor

ização (Intragrupo, Parceiro, Cliente)
- Sistema de contatos vinculados às empresas
- Histórico de relacionamentos e interações
- Análise de relevância de parceiros

### 📚 Repositório de Materiais
- Upload e organização de documentos por categoria
- Sistema de tags para facilitar busca
- Controle de vencimento de contratos
- Compartilhamento seguro entre empresas do grupo

### 🎯 Quadrante de Parceiros
- Análise de posicionamento de parceiros
- Métricas de engajamento e potencial
- Visualização gráfica de oportunidades
- Score automático baseado em critérios configuráveis

### 📋 Wishlist de Relacionamentos
- Sistema de solicitação de apresentações
- Tracking de conversão de apresentações em oportunidades
- Gestão de clientes por empresa proprietária
- Relatórios de effectiveness de networking

### 🔐 Sistema de Autenticação e Segurança
- Autenticação via Supabase Auth
- Row Level Security (RLS) para proteção de dados
- Controle de acesso baseado em perfis (Admin, User)
- Auditoria completa de atividades do sistema

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18.3.1** - Biblioteca principal para interface
- **TypeScript** - Tipagem estática para maior robustez
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/UI** - Componentes de interface premium
- **React Router Dom 6.26.2** - Roteamento SPA
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Recharts 2.12.7** - Visualizações e gráficos
- **Lucide React** - Biblioteca de ícones moderna

### Backend e Banco de Dados
- **Supabase** - Backend as a Service completo
- **PostgreSQL** - Banco de dados relacional robusto
- **Row Level Security** - Segurança nativa do PostgreSQL
- **Edge Functions** - Computação serverless
- **Real-time subscriptions** - Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **Vite** - Build tool ultra-rápido
- **ESLint** - Linting de código
- **Date-fns** - Manipulação de datas
- **Zod** - Validação de schemas TypeScript

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/aeight-platform.git
cd aeight-platform

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o arquivo .env.local com suas credenciais do Supabase

# Execute o projeto
npm run dev
```

### Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL em `/database/` para criar as tabelas
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploy

```bash
# Build para produção
npm run build

# Deploy (configurado para Vercel)
npm run deploy
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `usuarios` - Gestão de usuários e perfis
- `empresas` - Cadastro de empresas com tipificação
- `contatos` - Contatos vinculados às empresas
- `oportunidades` - Core do sistema, tracking de negócios
- `metas_oportunidades` - Sistema de metas e controle (v2.2.0)
- `historico_oportunidade` - Auditoria de alterações
- `eventos` - Gestão de eventos de networking
- `contatos_evento` - Contatos coletados em eventos

### Novidades v2.2.0 - Tabela de Metas
```sql
CREATE TABLE metas_oportunidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo_meta varchar(20) CHECK (tipo_meta IN ('quantidade', 'valor')),
  valor_meta numeric NOT NULL,
  periodo varchar(20) CHECK (periodo IN ('mensal', 'trimestral')),
  segmento_grupo varchar(50) CHECK (segmento_grupo IN ('intragrupo', 'de_fora_para_dentro', 'tudo')),
  -- ... outros campos
);
```

## 🎯 Casos de Uso Principais

### Para Grupos Empresariais
- Controle de indicações entre empresas do grupo
- Monitoramento de performance de parcerias
- Gestão centralizada de relacionamentos
- Análise de ROI de networking

### Para Equipes de Vendas
- Pipeline completo de oportunidades  
- Tracking de conversão por origem
- Metas individuais e coletivas
- Histórico detalhado de negociações

### Para Gestão Executiva
- KPIs de relacionamento empresarial
- Relatórios de performance por período
- Análise de efetividade de parcerias
- Dashboard executivo com métricas-chave

## 📈 Principais Métricas e KPIs

### Controle de Resultados (Novo v2.2.0)
- **Taxa de Conversão por Segmento**: Análise específica intragrupo vs. extragrupo
- **Ticket Médio**: Valor médio das oportunidades por categoria
- **Progresso de Metas**: Acompanhamento visual com alertas
- **Performance por Empresa**: Ranking e análise comparativa

### Dashboard Executivo
- Volume total de oportunidades
- Taxa de conversão geral
- Valor total em pipeline
- Distribuição por status e origem
- Ranking de parceiros mais efetivos

## 🔄 Roadmap e Próximas Versões

### v2.3.0 (Planejado)
- [ ] Integração com APIs de CRM externos
- [ ] Automação de follow-ups
- [ ] Relatórios avançados com BI
- [ ] App mobile companion

### v2.4.0 (Futuro)
- [ ] Integração com WhatsApp Business
- [ ] Machine Learning para scoring de leads
- [ ] API pública para integrações
- [ ] Módulo financeiro integrado

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte e Contato

- **Email**: suporte@aeight.com.br
- **LinkedIn**: [A&eight Platform](https://linkedin.com/company/aeight)
- **Website**: [www.aeight.com.br](https://www.aeight.com.br)

## 🏆 Reconhecimentos

- Equipe de desenvolvimento A&eight
- Comunidade open source
- Parceiros e beta testers

---

**Versão 2.2.0** - Incluindo módulo completo de Controle de Resultados com sistema de metas avançado
Desenvolvido com ❤️ pela equipe A&eight
