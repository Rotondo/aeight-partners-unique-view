# Módulo Diário

## Visão Geral

O módulo Diário centraliza eventos, ações de CRM, resumos e sugestões de IA para parceiros no projeto **@Rotondo/aeight-partners-unique-view**.

- **Fluxos principais:** Agenda, CRM, Resumo, IA
- **Permissões:** Segue escopo do usuário logado e autenticação das integrações
- **Expansão futura:** Estrutura pronta para novos domínios e integrações

## Estrutura de Pastas

```
src/
  components/diario/      # Componentes UI do Diário (Agenda, CRM, Resumo, IA)
  contexts/DiarioContext.tsx
  hooks/                  # Hooks customizados (useDiario, usePartners, etc)
  integrations/           # Integrações externas (Outlook, Google, IA)
  lib/ia/                 # Biblioteca de funções de IA
  pages/diario/           # Páginas SPA do Diário
  types/diario.ts         # Tipos globais do módulo
```

## Exemplos de Uso Prático

### Consumo do Contexto Diário

```tsx
import { useDiario } from '@/contexts/DiarioContext';

function MeuComponente() {
  const { eventos, criarEvento, loading, error } = useDiario();

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar eventos</div>;

  return (
    <div>
      <button onClick={() => criarEvento({ /* dados do evento */ })}>
        Novo Evento
      </button>
      <ul>
        {eventos.map(ev => <li key={ev.id}>{ev.titulo}</li>)}
      </ul>
    </div>
  );
}
```

### Exemplo de Hook Customizado

```tsx
import { usePartners } from '@/hooks/usePartners';

function SelectPartner() {
  const { partners, loading, error, refetch } = usePartners();

  return (
    <select>
      {partners?.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
    </select>
  );
}
```

## Fluxos Visuais

![Fluxo do Módulo Diário](docs/fluxo-diario.png)

- **Agenda:** Criação e visualização de eventos vinculados a parceiros.
- **CRM:** Registro e acompanhamento de interações.
- **Resumo:** Geração automática de resumos e sugestões via IA.
- **Integrações:** Sincronização com Outlook, Google Calendar e agentes de IA.

## Exemplos de Queries SQL

```sql
-- Buscar eventos de um parceiro em determinado período
SELECT * FROM eventos
WHERE partner_id = :partnerId
  AND data_inicio >= :inicio
  AND data_fim <= :fim;

-- Exportar ações CRM para CSV
SELECT crm.*, p.nome AS parceiro
FROM crm_acoes crm
JOIN parceiros p ON crm.partner_id = p.id
WHERE crm.data >= :dataInicio
```

## Permissões & Escopo

- **Acesso restrito** ao usuário logado
- **Checagem de permissão** para funções administrativas
- **Tokens e OAuth** para integrações externas

## Expansão e Limitações do MVP

- Estrutura preparada para adicionar novos domínios
- Limitações do MVP descritas em comentários no código e nos tipos

## Referência de Modelagem

Veja `src/database/diario.sql` para modelagem detalhada.

---

> Para dúvidas, consulte os comentários JSDoc nos arquivos de tipos e exemplos nos componentes.
