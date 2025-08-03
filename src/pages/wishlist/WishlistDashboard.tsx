
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { 
  Users, 
  ListChecks, 
  Presentation, 
  TrendingUp,
  UserPlus,
  Building2,
  Target,
  ArrowRight,
  BarChart3,
  FileText,
  GitBranch,
  RefreshCw,
  Database
} from "lucide-react";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useToast } from "@/hooks/use-toast";

const WishlistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    wishlistItems, 
    empresasClientes, 
    apresentacoes, 
    stats, 
    loading, 
    error, 
    initializeData 
  } = useWishlist();

  // Verificar se dados foram carregados
  const hasData = empresasClientes.length > 0 || wishlistItems.length > 0 || apresentacoes.length > 0;

  const handleLoadData = async () => {
    try {
      await initializeData();
      toast({
        title: "Dados carregados com sucesso!",
        description: "Os dados da wishlist foram atualizados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da wishlist.",
        variant: "destructive",
      });
    }
  };

  const quickStats = {
    totalEmpresas: empresasClientes.length,
    totalWishlistItems: wishlistItems.length,
    totalApresentacoes: apresentacoes.length,
    itemsPendentes: wishlistItems.filter(item => item.status === "pendente").length,
    itensAprovados: wishlistItems.filter(item => item.status === "aprovado").length,
    apresentacoesConvertidas: apresentacoes.filter(ap => ap.converteu_oportunidade).length,
  };

  const menuItems = [
    {
      title: "Base de Clientes",
      description: "Gerencie a base de clientes das empresas parceiras",
      icon: Building2,
      path: "/wishlist/clientes",
      count: quickStats.totalEmpresas,
      color: "bg-blue-500"
    },
    {
      title: "Wishlist Itens",
      description: "Solicitações de apresentações e interesses",
      icon: ListChecks,
      path: "/wishlist/itens",
      count: quickStats.totalWishlistItems,
      color: "bg-green-500"
    },
    {
      title: "Pipeline",
      description: "Gerencie o fluxo de apresentações por parceiro",
      icon: GitBranch,
      path: "/wishlist/pipeline",
      count: quickStats.totalApresentacoes,
      color: "bg-purple-500"
    },
    {
      title: "Apresentações",
      description: "Histórico completo de apresentações realizadas",
      icon: Presentation,
      path: "/wishlist/apresentacoes",
      count: quickStats.totalApresentacoes,
      color: "bg-orange-500"
    }
  ];

  const processItems = [
    {
      title: "Clientes Sobrepostos",
      description: "Identifique oportunidades de cross-sell",
      icon: Target,
      path: "/wishlist/sobrepostos",
      color: "bg-cyan-500"
    },
    {
      title: "Modo Apresentação",
      description: "Interface otimizada para apresentações",
      icon: BarChart3,
      path: "/wishlist/modo-apresentacao",
      color: "bg-indigo-500"
    },
    {
      title: "Troca Mútua",
      description: "Facilite trocas de clientes entre parceiros",
      icon: TrendingUp,
      path: "/wishlist/troca-mutua",
      color: "bg-pink-500"
    },
    {
      title: "Qualificação",
      description: "Qualifique leads e oportunidades",
      icon: FileText,
      path: "/wishlist/qualificacao",
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="space-y-6">
      <DemoModeIndicator />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wishlist Dashboard</h1>
          <p className="text-muted-foreground">
            Central de gerenciamento de relacionamentos e apresentações
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleLoadData}
            disabled={loading}
            variant={hasData ? "outline" : "default"}
            size="sm"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : hasData ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar Dados
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Carregar Dados
              </>
            )}
          </Button>
          <DemoModeToggle />
        </div>
      </div>

      {/* Quick Stats */}
      {!hasData && !loading && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado carregado</h3>
              <p className="text-muted-foreground mb-4">
                Clique no botão "Carregar Dados" para buscar as informações da wishlist.
              </p>
              <Button onClick={handleLoadData} disabled={loading}>
                <Database className="mr-2 h-4 w-4" />
                Carregar Dados Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(hasData || loading) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Empresas</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : quickStats.totalEmpresas}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Itens Pendentes</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : quickStats.itemsPendentes}
                  </p>
                </div>
                <ListChecks className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Itens Aprovados</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : quickStats.itensAprovados}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Convertidas</p>
                  <p className="text-2xl font-bold">
                    {loading ? "..." : quickStats.apresentacoesConvertidas}
                  </p>
                </div>
                <Presentation className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Menu */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Menu Principal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <Card key={item.path} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{item.count}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(item.path)}
                >
                  Acessar {item.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ferramentas de Processo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {processItems.map((item) => (
            <Card key={item.path} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className={`mx-auto p-3 rounded-lg ${item.color} w-fit`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(item.path)}
                  >
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistDashboard;
