# Aeight Partners Unique View

---

**Repositório:** [Rotondo/aeight-partners-unique-view](https://github.com/Rotondo/aeight-partners-unique-view)

---

## 📚 Documentação Oficial

Esta documentação cobre exaustivamente todos os aspectos do Aeight Partners Unique View.  
Ela está dividida em três macrotemas interligados para facilitar consulta, manutenção e evolução do sistema:

- [README.md (este arquivo)](#) — Visão geral, sumário, onboarding, contexto, índice e navegação.
- [README.sistema.md](./README.sistema.md) — Frontend, Backend, DevOps, Deploy, Segurança, Padrões e Boas Práticas.
- [README.dados.md](./README.dados.md) — Banco de Dados, Estruturas, Storage, Materiais, Policies, Auditoria e Versionamento.

> **Atenção:** Para garantir rastreabilidade, todo fluxo, configuração, padrão e decisão arquitetural do projeto está documentado em pelo menos um dos macrotemas abaixo. Sempre utilize o índice deste README para localizar o conteúdo buscado.

---

## 🗂️ Sumário Executivo

- [1. Sobre o Projeto](#1-sobre-o-projeto)
- [2. Macrotemas & Estrutura da Documentação](#2-macrotemas--estrutura-da-documentação)
- [3. Onboarding & Primeiros Passos](#3-onboarding--primeiros-passos)
- [4. Roadmap de Documentação](#4-roadmap-de-documentação)
- [5. FAQ Rápido & Links Úteis](#5-faq-rápido--links-úteis)
- [6. Wishlist & Networking](#6-wishlist--networking)
- [7. Licença, Atualização e Contato](#7-licença-atualização-e-contato)

---

## 1. Sobre o Projeto

O **Aeight Partners Unique View** é uma plataforma web fullstack para gestão, acompanhamento e análise de oportunidades, indicadores estratégicos, parcerias, materiais e contratos.  
O sistema foi desenhado para ser modular, seguro, auditável, facilmente expansível e aderente às melhores práticas de engenharia de software, devops e compliance.

**Destaques:**
- **Gestão de pipeline comercial**: controle de oportunidades, funil, status, atividades, histórico e auditoria.
- **Gestão de empresas, parceiros e contatos**: categorização, status, indicadores analíticos.
- **Repositório de materiais**: upload, versionamento, preview, download, exclusão e auditoria completa.
- **Indicadores estratégicos**: dashboards, KPIs, métricas configuráveis, análises e visualizações.
- **Segurança**: autenticação, RBAC, RLS granular, políticas de storage e banco, LGPD-ready.
- **DevOps**: deploy automatizado, versionamento, integração contínua, variáveis seguras, monitoramento e logs.
- **Wishlist & Networking**: gestão de interesses, solicitações e apresentações entre empresas, acelerando networking estratégico e geração de oportunidades.

---

## 2. Macrotemas & Estrutura da Documentação

### 🔗 [README.sistema.md](./README.sistema.md)  
**Frontend, Backend, DevOps, Segurança, Padrões, Operação**

- Arquitetura detalhada (SPA React, Supabase, integrações, Edge Functions)
- Organização de arquivos, estrutura de pastas, scripts, variáveis, build e deploy (Vercel)
- Autenticação, RBAC, políticas globais, padrões de código, exemplos reais
- Troubleshooting frontend/backend/devops
- Roadmap técnico, upgrades, integração futura
- Wishlist & Networking: fluxos detalhados, exemplos, integrações (ver seção própria)
- Referências cruzadas para banco, storage e políticas (link para README.dados.md)

### 🔗 [README.dados.md](./README.dados.md)  
**Banco de Dados, Estruturas, Storage, Materiais, Policies, Auditoria**

- Modelagem completa: tabelas, enums, relacionamentos, tipos, diagrama textual
- Policies RLS detalhadas, policies de Storage Supabase, triggers, exemplos SQL
- Gestão completa de materiais (upload, preview, exclusão, versionamento, auditoria)
- Scripts de backup/restore, versionamento de dados, troubleshooting de banco/storage
- Wishlist & Networking: modelagem, fluxo de dados, auditoria e exemplos
- FAQ minucioso, dicas de expansão, integração com frontend/backend

### 🔗 Este README.md  
**Visão geral, onboarding, sumário, navegação, contexto, FAQ índice, atualização**

---

## 3. Onboarding & Primeiros Passos

### 3.1. Para desenvolvedores de frontend/backend/devops

1. Leia [README.sistema.md](./README.sistema.md) para arquitetura, instalação, scripts, integração, padrões de código, troubleshooting.
2. Consulte [README.dados.md](./README.dados.md) sempre que precisar de detalhes sobre banco, políticas, Storage, fluxos de materiais, auditoria, wishlist/networking.

### 3.2. Para DBAs, devs de dados, administradores

1. Leia [README.dados.md](./README.dados.md) para modelagem completa, policies, auditoria, storage, wishlist/networking e scripts.
2. Consulte [README.sistema.md](./README.sistema.md) para integração com frontend/backend/devops.

### 3.3. Onboarding geral

1. Use este README como índice, sumário executivo e para dúvidas rápidas.
2. Sempre navegue pelos macrotemas, pois todo fluxo ou funcionalidade está documentado minuciosamente.

### 3.4. Rodando localmente (resumo)

- Clone o repositório e instale dependências (`pnpm` recomendado, ou `yarn`/`npm`).
- Configure variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Rode `pnpm dev` e acesse [http://localhost:5173](http://localhost:5173).
- Detalhes completos em [README.sistema.md](./README.sistema.md).

---

## 4. Roadmap de Documentação

Esta documentação é **viva**, acompanhando a evolução do sistema.  
Todo novo fluxo, feature, refatoração, policy, script ou decisão arquitetural deve ser documentado imediatamente em pelo menos um dos macrotemas.

**Seções obrigatórias em cada macrotema:**
- Estrutura/tabela/fluxo/arquivo detalhado (com exemplos)
- Policies, scripts, exemplos de código, integrações
- FAQ aprofundado e troubleshooting real
- Referências cruzadas para outros macrotemas
- Wishlist & Networking: sempre atualizado com exemplos de uso e políticas

---

## 5. FAQ Rápido & Links Úteis

### 5.1. FAQ índice

- **Como funciona a autenticação?**  
  [README.sistema.md > Autenticação]

- **Como criar e gerenciar políticas RLS e Storage?**  
  [README.dados.md > Policies e Segurança]

- **Como funciona o fluxo completo de materiais?**  
  [README.dados.md > Fluxos de Materiais e Storage]

- **Onde estão os scripts de deploy, build e CI/CD?**  
  [README.sistema.md > DevOps & Deploy]

- **Como rodar localmente ou em produção?**  
  [README.sistema.md > Setup e Deploy]

- **Como auditar operações (inclusive exclusão de arquivos)?**  
  [README.dados.md > Auditoria, Logs e Versionamento]

- **Como funciona a Wishlist & Networking?**  
  [README.sistema.md > Wishlist & Networking], [README.dados.md > Wishlist & Networking]

- **Como contribuir ou abrir issues?**  
  [README.md > Links úteis]

### 5.2. Links úteis

- [Repositório no GitHub](https://github.com/Rotondo/aeight-partners-unique-view)
- [Supabase Dashboard](https://supabase.com/dashboard/project/amuadbftctnmckncgeua)
- [Vercel Deploy](https://vercel.com/dashboard)
- [Abrir Issue](https://github.com/Rotondo/aeight-partners-unique-view/issues)

---

## 6. Wishlist & Networking

### Resumo

Funcionalidade estratégica que permite empresas solicitarem conexões, facilitarem apresentações, aprovarem/rejeitarem solicitações e converterem apresentações em oportunidades.

**Fluxos:**
- Solicitação de wishlist: empresa interessada → proprietária → desejada
- Aprovação/rejeição pela proprietária
- Facilitação de apresentação (email, reunião, evento, digital, outro)
- Conversão da apresentação em oportunidade
- Histórico completo, filtros, controle de status, auditoria

**Referências detalhadas:**  
- [README.sistema.md > Wishlist & Networking](./README.sistema.md#wishlist--networking)
- [README.dados.md > Wishlist & Networking](./README.dados.md#wishlist--networking)

---

## 7. Licença, Atualização e Contato

- **Licença:**  
  Este projeto é **privado** e de uso exclusivo da **Aeight Partners**.  
  Todos os direitos reservados. Consulte o responsável antes de redistribuir ou contribuir.

- **Atualização:**  
  Documentação atualizada em: Junho 2025  
  Versão do sistema: 2.0  
  Versão do banco: Schema v1.5

- **Contato:**  
  Para dúvidas técnicas ou contribuições, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

---

> **Importante:**  
> Todo novo fluxo, decisão arquitetural, refatoração, feature, integração ou política deve ser documentado imediatamente, garantindo rastreabilidade e onboarding rápido de qualquer novo membro do time.

---
