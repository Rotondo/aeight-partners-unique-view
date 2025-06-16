/**
 * Integração com Microsoft Outlook Calendar para o módulo Diário.
 * Todas as funções retornam mocks/fetches para facilitar desenvolvimento offline.
 * Para produção, configure OAuth2 e tokens conforme docs oficiais da Microsoft Graph.
 */

import { AgendaEvent } from "@/types/diario";

// Exemplo de response mockada para desenvolvimento offline
const MOCK_EVENTS: AgendaEvent[] = [
  {
    id: "outlook-1",
    partnerId: "partner-1",
    userId: "user-1",
    type: "MEETING",
    titulo: "Reunião Outlook",
    descricao: "Reunião marcada via Outlook.",
    dataInicio: new Date().toISOString(),
    dataFim: new Date(Date.now() + 3600000).toISOString(),
    status: "SCHEDULED",
    local: "Teams",
    integrationSource: "OUTLOOK",
    externalId: "evt-123",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Busca eventos do Outlook Calendar.
 * No modo dev, retorna mocks.
 * Em produção, busque usando Microsoft Graph API.
 */
export async function fetchOutlookEvents(token?: string): Promise<AgendaEvent[]> {
  if (!token) {
    // DEV: retorna mock
    return Promise.resolve(MOCK_EVENTS);
  }
  // PROD: substitua por chamada real
  // const response = await fetch("https://graph.microsoft.com/v1.0/me/events", { headers: { Authorization: `Bearer ${token}` } });
  // const data = await response.json();
  // return data.value.map(mapGraphEventToAgendaEvent);
  return Promise.resolve([]);
}

/**
 * Documentação: https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0
 * Para autenticação, use OAuth2 e solicite escopos: 'Calendars.Read', 'Calendars.ReadWrite'
 */