
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, PlayCircle, AlertTriangle } from "lucide-react";

const Index = () => {
  console.log('[Index] ETAPA 1 - Página inicial ESTÁTICA sem queries automáticas');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DemoModeIndicator />
      
      {/* Indicador de Modo de Teste */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Modo de Teste - ETAPA 1
          </CardTitle>
          <CardDescription className="text-amber-600">
            Página inicial funcionando sem queries automáticas para teste de login.
            Stats são carregadas manualmente quando necessário.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <QuickAccess />
        
        {/* Stats Cards Estáticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Oportunidades</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Clique em "Carregar Stats" para ver dados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Stats em modo manual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Stats em modo manual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Stats em modo manual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão para carregar stats manualmente */}
        <Card>
          <CardHeader>
            <CardTitle>Carregar Estatísticas (TESTE)</CardTitle>
            <CardDescription>
              Em modo de teste - stats não são carregadas automaticamente.
              Use este botão quando quiser testar o carregamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                console.log('[Index] TESTE - Botão de carregar stats clicado');
                alert('TESTE - Em modo estático. Stats não implementadas nesta etapa.');
              }}
              variant="outline"
              className="w-full"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Testar Carregamento de Stats
            </Button>
          </CardContent>
        </Card>

        {/* Botão para dashboard completo */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Completo</CardTitle>
            <CardDescription>
              Acesse análises detalhadas e gráficos avançados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                console.log('[Index] Redirecionando para dashboard completo');
                window.location.href = '/dashboard';
              }}
              className="w-full"
            >
              Ver Dashboard Completo
            </Button>
          </CardContent>
        </Card>

        {/* Informações de Debug */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700">Debug - ETAPA 1</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-600 space-y-2">
            <p>✅ Login funcionando sem queries automáticas</p>
            <p>✅ Página inicial carregada apenas com componentes estáticos</p>
            <p>✅ Nenhuma consulta ao banco de dados na inicialização</p>
            <p>⏳ Stats disponíveis apenas sob demanda</p>
            <p className="font-medium">
              Se esta página carregar rapidamente após login, o problema está nas queries automáticas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
