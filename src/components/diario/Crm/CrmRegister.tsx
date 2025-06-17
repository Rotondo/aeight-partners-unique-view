
import React, { useState } from 'react';
import { CrmHeader } from './CrmHeader';
import { CrmFormContainer } from './CrmFormContainer';
import { CrmFormTabs } from './CrmFormTabs';
import { CrmNextSteps } from './CrmNextSteps';
import { CrmHistorySection } from './CrmHistorySection';

export const CrmRegister: React.FC = () => {
  const [activeTab, setActiveTab] = useState('audio');

  return (
    <div className="space-y-6">
      <CrmHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CrmFormContainer>
            <CrmFormTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </CrmFormContainer>
        </div>

        <div>
          <CrmNextSteps />
        </div>
      </div>

      <CrmHistorySection />
    </div>
  );
};
