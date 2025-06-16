import React from "react";
import { useDiario } from "@/contexts/DiarioContext";
import { AgendaEventPartnerSelect } from "./AgendaEventPartnerSelect";

export const AgendaEventList: React.FC = () => {
  const { events } = useDiario();

  if (!events.length)
    return <div className="text-gray-500">Nenhum evento encontrado.</div>;

  return (
    <ul className="divide-y">
      {events.map((event) => (
        <li key={event.id} className="py-2 flex flex-col gap-1">
          <span className="font-semibold">{event.title}</span>
          <span className="text-sm text-gray-500">{event.start} — {event.end}</span>
          <span className="text-xs text-gray-400">Fonte: {event.source}</span>
          <AgendaEventPartnerSelect eventId={event.id} partnerId={event.partnerId} />
        </li>
      ))}
    </ul>
  );
};