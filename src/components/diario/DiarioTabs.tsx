
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MessageSquare, FileText, Sparkles } from 'lucide-react';
import { useDiario } from '@/contexts/DiarioContext';
import { AgendaView } from './Agenda/AgendaView';
import { CrmRegister } from './Crm/CrmRegister';
import { ResumoView } from './Resumo/ResumoView';
import { IaAgentInbox } from './IA/IaAgentInbox';

export const DiarioTabs: React.FC = () => {
  const { currentView, setCurrentView } = useDiario();

  return (
    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as any)} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="agenda" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Agenda
        </TabsTrigger>
        <TabsTrigger value="crm" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          CRM
        </TabsTrigger>
        <TabsTrigger value="resumo" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Resumo
        </TabsTrigger>
        <TabsTrigger value="ia" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          IA
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agenda" className="mt-6">
        <AgendaView />
      </TabsContent>

      <TabsContent value="crm" className="mt-6">
        <CrmRegister />
      </TabsContent>

      <TabsContent value="resumo" className="mt-6">
        <ResumoView />
      </TabsContent>

      <TabsContent value="ia" className="mt-6">
        <IaAgentInbox />
      </TabsContent>
    </Tabs>
  );
};
