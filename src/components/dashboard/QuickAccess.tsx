
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, PieChart, Building2 } from 'lucide-react';
import { QuickAccessButton } from './QuickAccessButton';

export const QuickAccess: React.FC = () => (
  <Card className="md:col-span-3">
    <CardHeader>
      <CardTitle>Acesso Rápido</CardTitle>
      <CardDescription>
        Principais funcionalidades da plataforma
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <QuickAccessButton
          href="/onepager"
          icon={<FileText className="h-5 w-5" />}
          label="OnePager"
          description="Documentos dos parceiros"
        />
        <QuickAccessButton
          href="/oportunidades"
          icon={<Zap className="h-5 w-5" />}
          label="Oportunidades"
          description="Gestão de indicações"
        />
        <QuickAccessButton
          href="/quadrante"
          icon={<PieChart className="h-5 w-5" />}
          label="Quadrante"
          description="Análise estratégica"
        />
        <QuickAccessButton
          href="/admin"
          icon={<Building2 className="h-5 w-5" />}
          label="Administração"
          description="Configurações da plataforma"
        />
      </div>
    </CardContent>
  </Card>
);
