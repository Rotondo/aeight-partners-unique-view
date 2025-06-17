
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';
import { CrmActionList } from './CrmActionList';

export const CrmHistorySection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <List className="h-5 w-5" />
          <CardTitle>Ações Recentes</CardTitle>
        </div>
        <CardDescription>
          Histórico de interações e próximos passos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CrmActionList />
      </CardContent>
    </Card>
  );
};
