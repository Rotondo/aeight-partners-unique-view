
import React from 'react';
import { CategoriasList } from '@/components/admin/CategoriasList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoModeIndicator } from '@/components/privacy/DemoModeIndicator';

const CategoriasPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <DemoModeIndicator />
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Categorias</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoriasList />
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriasPage;
