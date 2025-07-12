
import React from 'react';
import { ContatosList } from '@/components/admin/ContatosList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContatosPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContatosList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContatosPage;
