
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
  Database
} from "lucide-react";

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
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
