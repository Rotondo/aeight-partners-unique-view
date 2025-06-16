import React, { useState } from "react";
import { usePartners } from "@/hooks/usePartners";

interface Props {
  eventId: string;
  partnerId?: string;
}

export const AgendaEventPartnerSelect: React.FC<Props> = ({ eventId, partnerId }) => {
  const { partners, fetchPartners, loading } = usePartners();
  const [search, setSearch] = useState("");
  const [value, setValue] = useState(partnerId || "");

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs">Parceiro:</label>
      <input
        type="text"
        className="border rounded px-2 py-1 text-xs"
        placeholder="Buscar parceiro..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          fetchPartners(e.target.value);
        }}
      />
      {loading && <span className="text-xs text-gray-400">...</span>}
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border rounded px-1 py-1 text-xs"
      >
        <option value="">Selecione</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  );
};