import React from "react";

export const AgendaSyncGoogle: React.FC = () => {
  const handleSync = () => {
    // TODO: Integração real com Google Calendar
    alert("Sincronização com Google Calendar não implementada.");
  };

  return (
    <button
      className="px-4 py-2 bg-green-600 text-white rounded"
      onClick={handleSync}
    >
      Sincronizar Google Calendar
    </button>
  );
};