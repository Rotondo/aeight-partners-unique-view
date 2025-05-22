
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, FileSpreadsheet, PieChart } from 'lucide-react';

export const QuickAccess = () => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>Acesso Rápido</CardTitle>
      <CardDescription>Navegue para as principais funcionalidades</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <Link to="/oportunidades" className="w-full">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Gestão de Oportunidades</span>
        </Button>
      </Link>
      
      <Link to="/empresas" className="w-full">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Empresas e Parceiros</span>
        </Button>
      </Link>
      
      <Link to="/indicadores" className="w-full">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          <PieChart className="mr-2 h-4 w-4" />
          <span>Indicadores</span>
        </Button>
      </Link>
      
      <Link to="/onepager" className="w-full">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal"
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>One Pager</span>
        </Button>
      </Link>
    </CardContent>
  </Card>
);
