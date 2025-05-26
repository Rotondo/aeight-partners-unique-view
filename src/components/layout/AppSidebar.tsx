import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  BarChart,
  ChartBar,
  Grid,
  Database,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Oportunidades",
      url: "/oportunidades",
      icon: FileText,
    },
    {
      title: "Dashboards",
      url: "/oportunidades-dashboard",
      icon: ChartBar,
    },
    {
      title: "OnePager",
      url: "/onepager",
      icon: Grid,
    },
    {
      title: "Quadrante",
      url: "/quadrante",
      icon: BarChart,
    },
    {
      title: "Administração",
      url: "/admin",
      icon: Database,
    },
  ];

  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="text-xl font-bold p-2">
          A&eight Partnership Hub
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAuthenticated && user && (
          <div className="mt-8 mb-4 px-3">
            <div className="font-semibold">{user.nome || user.email}</div>
            <div className="text-xs text-muted-foreground mb-1">{user.email}</div>
            <Button
              variant="outline"
              size="sm"
              className="w-full flex gap-2 items-center mt-2"
              onClick={logout}
            >
              <LogOut size={16} />
              Sair
            </Button>
          </div>
        )}
      </SidebarContent>
      <footer className="mt-auto p-4 text-center text-xs text-muted-foreground border-t">
        Desenvolvido por Thiago Rotondo
      </footer>
    </Sidebar>
  );
};

export default AppSidebar;
