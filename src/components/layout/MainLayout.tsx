
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Header from './Header';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart, 
  ChartBar, 
  Grid, 
  Database 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.startsWith('/onepager')) return 'OnePager de Parceiros';
    if (path.startsWith('/oportunidades')) return 'Dashboard de Oportunidades';
    if (path.startsWith('/quadrante')) return 'Quadrante de Parceiros';
    if (path.startsWith('/admin')) return 'Administração';
    if (path === '/') return 'Dashboard';
    
    return 'A&eight Partnership Hub';
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border">
            <div className="text-xl font-bold p-2">
              A&eight Partnership Hub
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/")} asChild tooltip="Dashboard">
                  <Link to="/">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/oportunidades")} asChild tooltip="Oportunidades">
                  <Link to="/oportunidades">
                    <FileText size={20} />
                    <span>Oportunidades</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/oportunidades-dashboard")} asChild tooltip="Dashboards">
                  <Link to="/oportunidades-dashboard">
                    <ChartBar size={20} />
                    <span>Dashboards</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/onepager")} asChild tooltip="OnePager">
                  <Link to="/onepager">
                    <Grid size={20} />
                    <span>OnePager</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive("/quadrante")} asChild tooltip="Quadrante">
                  <Link to="/quadrante">
                    <BarChart size={20} />
                    <span>Quadrante</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {user?.papel === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive("/admin")} asChild tooltip="Administração">
                    <Link to="/admin">
                      <Database size={20} />
                      <span>Administração</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t border-border p-2">
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} A&eight Global
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header title={getPageTitle()} />
          
          <main className="flex-1 overflow-auto p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
