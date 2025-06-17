
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CrmFormContainerProps {
  children: React.ReactNode;
}

export const CrmFormContainer: React.FC<CrmFormContainerProps> = ({ children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Registro</CardTitle>
        <CardDescription>
          Registre uma nova interação com parceiros
        </CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};
