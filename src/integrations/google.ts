/**
 * Integração com Google Calendar para o módulo Diário.
 * Todas as funções retornam mocks/fetches para facilitar desenvolvimento offline.
 * Para produção, configure OAuth2 e tokens conforme docs do Google.
 */

import { AgendaEvent } from "@/types/diario";

const MOCK_EVENTS: AgendaEvent[] = [
  {
    id: "google-1",
    partnerId: "partner-2",
    userId: "user-1",
    type: "MEETING",
    titulo: "Call Google",
    descricao: "Evento mockado do Google Calendar.",
    dataInicio: new Date().toISOString(),
    dataFim: new Date(Date.now() + 3600000).toISOString(),
    status: "SCHEDULED",
    local: "Meet",
    integrationSource: "GOOGLE",
    externalId: "gcal-456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Busca eventos do Google Calendar.
 * No modo dev, retorna mocks.
 * Em produção, busque usando Google Calendar API.
 */
export async function fetchGoogleEvents(token?: string): Promise<AgendaEvent[]> {
  if (!token) {
    // DEV: retorna mock
    return Promise.resolve(MOCK_EVENTS);
  }
  // PROD: substitua por chamada real
  // const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', { headers: { Authorization: `Bearer ${token}` } });
  // const data = await response.json();
  // return data.items.map(mapGoogleEventToAgendaEvent);
  return Promise.resolve([]);
}

/**
 * Documentação: https://developers.google.com/calendar/api/v3/reference/events/list
 * Escopos recomendados: 'https://www.googleapis.com/auth/calendar.readonly'
 */