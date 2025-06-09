# Aeight Partners Unique View

**Repositório:** [Rotondo/aeight-partners-unique-view](https://github.com/Rotondo/aeight-partners-unique-view)

## Sumário

- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como rodar localmente](#como-rodar-localmente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Stack e principais dependências](#stack-e-principais-dependências)
- [Padrão de código e boas práticas](#padrão-de-código-e-boas-práticas)
- [Deploy e Produção](#deploy-e-produção)
- [Licença](#licença)

---

## Descrição

Sistema web para gestão, acompanhamento e visualização de oportunidades, indicadores, empresas e outros recursos estratégicos da Aeight Partners.  
O projeto é totalmente desenvolvido em **TypeScript** com **React**, utilizando roteamento via `react-router-dom`, gerenciamento de contexto para autenticação e controle de acesso, além de UI moderna baseada em [shadcn/ui](https://ui.shadcn.com/).

---

## Funcionalidades

- **Dashboard**: Visão geral de KPIs, métricas e status de oportunidades.
- **Gestão de Oportunidades**: Cadastro, edição, exclusão e acompanhamento de oportunidades de negócio.
- **Indicadores**: Monitoramento de indicadores estratégicos.
- **Empresas**: Cadastro e visualização de empresas, origens e destinos.
- **OnePager e Quadrante**: Visualizações analíticas para tomada de decisão.
- **Administração**: Área reservada para gestão avançada.
- **Autenticação**: Login e controle de sessão usando contexto.
- **Notificações**: Sistema global de toasts para feedback ao usuário.
- **Carregamento assíncrono**: Suporte a lazy loading com fallback de loading.

---

## Estrutura do Projeto

> ⚠️ **Atenção:** Esta lista pode não conter todos os arquivos/diretórios devido à limitação de resultados da API.  
> Veja a [estrutura completa no GitHub](https://github.com/Rotondo/aeight-partners-unique-view/tree/main/src).

```
src/
│
├── App.tsx                  # Componente raiz e configuração das rotas
├── main.tsx                 # Bootstrap da aplicação
├── App.css / index.css      # Estilos globais
├── vite-env.d.ts            # Tipos do Vite
│
├── components/              # Componentes reutilizáveis e layouts
│   ├── layout/              # MainLayout e wrappers visuais
│   └── oportunidades/       # Componentes de oportunidades, dashboard, etc.
│   └── ui/                  # Componentes de UI: Toaster, Skeleton, Button, etc.
│
├── hooks/                   # Hooks personalizados (ex: AuthProvider)
├── integrations/            # Integrações externas e serviços
├── lib/                     # Funções utilitárias e helpers
├── pages/                   # Páginas (Dashboard, Indicadores, Empresas, etc.)
├── types/                   # Tipos globais e interfaces TypeScript
```

---

## Como rodar localmente

1. **Pré-requisitos:**
   - Node.js >= 18
   - pnpm (recomendado), npm ou yarn

2. **Instale as dependências:**
   ```bash
   pnpm install
   # ou npm install
   # ou yarn install
   ```

3. **Inicie o projeto em modo desenvolvimento:**
   ```bash
   pnpm dev
   # ou npm run dev
   # ou yarn dev
   ```

4. **Abra no navegador:**  
   Acesse [http://localhost:5173](http://localhost:5173) (ou a porta informada no terminal).

---

## Scripts disponíveis

- `dev` – Inicia o servidor de desenvolvimento
- `build` – Gera o build de produção
- `preview` – Visualiza o build de produção localmente
- `lint` – (Se configurado) Roda o linter

---

## Stack e principais dependências

- **React** + **TypeScript**
- **Vite** (empacotador e dev server)
- **react-router-dom** (roteamento SPA)
- **shadcn/ui** (componentes de UI)
- **date-fns** (manipulação de datas)
- **Context API** (gerenciamento de autenticação e estados globais)
- **Outros**: [Veja o package.json](https://github.com/Rotondo/aeight-partners-unique-view/blob/main/package.json)

---

## Padrão de código e boas práticas

- Siga a estrutura de pastas proposta para organização de componentes, hooks e tipos.
- Utilize sempre tipagem forte com TypeScript.
- Prefira componentes funcionais e hooks.
- O projeto utiliza Context API para autenticação e estados globais.
- Mantenha estilização consistente usando os arquivos `App.css` e `index.css`.

---

## Deploy e Produção

- Deploy automatizado na **Vercel** (vercel.json/configuração padrão).
- Builds otimizados para produção usando Vite.
- Variáveis de ambiente podem ser configuradas conforme necessário via painel da Vercel.

---

## Licença

Este projeto é privado e de uso exclusivo da Aeight Partners.  
Para uso, distribuição ou contribuições, consulte o responsável pelo repositório.

---

## Contato

Dúvidas, sugestões ou problemas?  
Abra uma issue ou entre em contato com o mantenedor do projeto.
