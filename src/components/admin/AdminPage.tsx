
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Tag, FileText, Settings, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'Usuários',
      description: 'Gerencie usuários do sistema',
      icon: Users,
      value: 'usuarios'
    },
    {
      title: 'Empresas',
      description: 'Gerencie empresas cadastradas',
      icon: Building2,
      value: 'empresas'
    },
    {
      title: 'Categorias',
      description: 'Gerencie categorias de negócio',
      icon: Tag,
      value: 'categorias'
    },
    {
      title: 'OnePagers',
      description: 'Gerencie OnePagers dos parceiros',
      icon: FileText,
      value: 'onepagers'
    },
    {
      title: 'Mapa de Parceiros',
      description: 'Gerencie etapas e subníveis da jornada',
      icon: Map,
      action: () => navigate('/admin/mapa-parceiros')
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie todos os aspectos do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.value || 'mapa'} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {card.description}
                </p>
                {card.action ? (
                  <Button onClick={card.action} size="sm" className="w-full">
                    Acessar
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure as opções gerais do sistema aqui.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
