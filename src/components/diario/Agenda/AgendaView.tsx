import React from "react";
import { AgendaSyncOutlook } from "./AgendaSyncOutlook";
import { AgendaSyncGoogle } from "./AgendaSyncGoogle";
import { AgendaEventList } from "./AgendaEventList";

export const AgendaView: React.FC = () => (
  <div>
    <div className="flex gap-4 mb-4">
      <AgendaSyncOutlook />
      <AgendaSyncGoogle />
    </div>
    <AgendaEventList />
  </div>
);