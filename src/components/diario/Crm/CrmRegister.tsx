import React from "react";
import { CrmFormAudio } from "./CrmFormAudio";
import { CrmFormVideo } from "./CrmFormVideo";
import { CrmFormText } from "./CrmFormText";
import { CrmActionList } from "./CrmActionList";
import { CrmNextSteps } from "./CrmNextSteps";

export const CrmRegister: React.FC = () => (
  <div className="flex flex-col gap-6">
    <div>
      <h2 className="font-bold mb-2">Registrar ação</h2>
      <div className="flex gap-4">
        <CrmFormAudio />
        <CrmFormVideo />
        <CrmFormText />
      </div>
    </div>
    <CrmActionList />
    <CrmNextSteps />
  </div>
);