
import React from 'react';
import { MessageSquare } from 'lucide-react';

export const CrmHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-4">
      <MessageSquare className="h-6 w-6 text-primary" />
      <div>
        <h2 className="text-2xl font-bold">CRM</h2>
        <p className="text-muted-foreground">
          Registre interações, defina próximos passos e acompanhe ações
        </p>
      </div>
    </div>
  );
};
