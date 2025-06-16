import React from "react";

export const AgendaSyncOutlook: React.FC = () => {
  const handleSync = () => {
    // TODO: Integração real com Outlook
    alert("Sincronização com Outlook não implementada.");
  };

  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded"
      onClick={handleSync}
    >
      Sincronizar Outlook
    </button>
  );
};