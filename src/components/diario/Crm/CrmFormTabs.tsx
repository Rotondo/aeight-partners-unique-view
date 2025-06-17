
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Video, FileText } from 'lucide-react';
import { CrmFormAudio } from './CrmFormAudio';
import { CrmFormVideo } from './CrmFormVideo';
import { CrmFormText } from './CrmFormText';

interface CrmFormTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CrmFormTabs: React.FC<CrmFormTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="audio" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Áudio
        </TabsTrigger>
        <TabsTrigger value="video" className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Vídeo
        </TabsTrigger>
        <TabsTrigger value="text" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Texto
        </TabsTrigger>
      </TabsList>

      <TabsContent value="audio" className="mt-6">
        <CrmFormAudio />
      </TabsContent>

      <TabsContent value="video" className="mt-6">
        <CrmFormVideo />
      </TabsContent>

      <TabsContent value="text" className="mt-6">
        <CrmFormText />
      </TabsContent>
    </Tabs>
  );
};
