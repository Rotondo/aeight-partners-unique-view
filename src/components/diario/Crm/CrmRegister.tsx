
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, History, Plus } from 'lucide-react';
import { CrmActionForm } from './CrmActionForm';
import { CrmActionList } from './CrmActionList';

export const CrmRegister: React.FC = () => {
  const [activeTab, setActiveTab] = useState('nova-acao');

  const handleActionSuccess = () => {
    // Switch to history tab after successful creation
    setActiveTab('historico');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <MessageSquare className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">CRM - Registro de Ações</h2>
          <p className="text-muted-foreground">
            Registre suas interações com parceiros e gerencie próximos passos
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nova-acao" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Ação
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Ações Recentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova-acao" className="mt-6">
          <CrmActionForm onSuccess={handleActionSuccess} />
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <CrmActionList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
