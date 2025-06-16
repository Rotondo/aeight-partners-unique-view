# Módulo Diário — Aeight Partners Unique View

## Visão Geral

O módulo Diário centraliza registros de eventos de agenda, ações multimídia (CRM), resumos periódicos e sugestões de IA para facilitar acompanhamento, integração e produtividade.

---

## Estrutura de Pastas

```
src/
  pages/diario/index.tsx
  components/diario/
    DiarioTabs.tsx
    Agenda/
      AgendaView.tsx
      AgendaSyncOutlook.tsx
      AgendaSyncGoogle.tsx
      AgendaEventList.tsx
      AgendaEventPartnerSelect.tsx
      useAgendaEvents.ts
    Crm/
      CrmRegister.tsx
      CrmFormAudio.tsx
      CrmFormVideo.tsx
      CrmFormText.tsx
      CrmActionList.tsx
      CrmNextSteps.tsx
      useCrmActions.ts
    Resumo/
      ResumoView.tsx
      useResumo.ts
    IA/
      IaAgentInbox.tsx
      IaApproveField.tsx
      useIaInbox.ts
  contexts/DiarioContext.tsx
  types/diario.ts
  hooks/usePartners.ts
  integrations/
    outlook/outlookApi.ts
    google/googleCalendarApi.ts
  lib/ia/iaApi.ts
docs/DIARIO.README.md
database/diario.sql
```

---

## Permissões

- Apenas usuários com papel `admin` podem visualizar, criar, editar, deletar e aprovar itens no Diário.

---

## Fluxos Principais

- **Agenda**: Integração e exibição de eventos (Outlook, Google, manual), vínculo com parceiros.
- **CRM**: Registro multimídia de ações (áudio, vídeo, texto), consulta de ações e próximos passos.
- **Resumo**: Geração/download de relatórios periódicos (PDF, CSV).
- **IA**: Sugestões automáticas aprovadas/revisadas apenas por admin.

---

## Integrações

- **Outlook/Google**: OAuth2, escopos mínimos, atualização periódica.
- **IA**: API REST/GraphQL, ciclo sugerido → revisão admin → aprovação.

---

## Expansão Futura

- Multi-agendas, anexos, integrações adicionais, histórico IA mais elaborado, offline, exportação avançada.

---

## Testes

- Não há exigência mínima de cobertura ou ferramenta para QA neste MVP.

---

## Exemplo de Uso

Ver componentes em `/src/pages/diario/index.tsx` e subcomponentes em `/components/diario/`.

---

## SQL

Consulte `database/diario.sql` para tabelas, enums e policies do Supabase.

---
