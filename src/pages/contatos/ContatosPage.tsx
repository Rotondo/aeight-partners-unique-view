
import React from 'react';
import { ContatosList } from '@/components/eventos/ContatosList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContatosPage: React.FC = () => {
  // Por enquanto, usando uma lista vazia - idealmente seria conectado a dados reais
  const contatos: any[] = [];

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContatosList contatos={contatos} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContatosPage;
