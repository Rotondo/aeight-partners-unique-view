import { useDiario } from "@/contexts/DiarioContext";
import { useEffect } from "react";

// Simula fetch/sync de eventos (substitua por integração real)
export function useAgendaEvents() {
  const { setEvents } = useDiario();

  useEffect(() => {
    // Simule fetch inicial
    setEvents([
      {
        id: "1",
        title: "Call com Parceiro",
        start: "2025-06-20T09:00:00",
        end: "2025-06-20T10:00:00",
        partnerId: undefined,
        source: "manual",
        status: "scheduled",
        createdAt: "2025-06-10T12:00:00",
        updatedAt: "2025-06-10T12:00:00",
      },
    ]);
  }, [setEvents]);
}