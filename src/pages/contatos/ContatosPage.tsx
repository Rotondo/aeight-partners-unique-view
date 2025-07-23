
import React from 'react';
import { ContatosList } from '@/components/admin/ContatosList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';

const ContatosPage: React.FC = () => {
  console.log('ContatosPage: Renderizando página de contatos - versão limpa');
  
  return (
    <div className="container mx-auto p-6">
      <DemoModeIndicator />
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContatosList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContatosPage;
