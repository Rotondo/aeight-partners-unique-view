
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  Building2,
  FileText,
  Users,
  TrendingUp,
  Settings,
  FolderOpen,
  Heart,
  LayoutDashboard,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Oportunidades",
    url: "/oportunidades",
    icon: TrendingUp,
  },
  {
    title: "Dashboard Oportunidades",
    url: "/oportunidades-dashboard",
    icon: BarChart3,
  },
  {
    title: "Wishlist & Networking",
    url: "/wishlist",
    icon: Heart,
  },
  {
    title: "Indicadores",
    url: "/indicadores",
    icon: BarChart3,
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
  {
    title: "OnePager",
    url: "/onepager",
    icon: FileText,
  },
  {
    title: "Repositório",
    url: "/repositorio",
    icon: FolderOpen,
  },
  {
    title: "Quadrante",
    url: "/quadrante",
    icon: Users,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url || location.pathname.startsWith(item.url + "/")}
                  >
                    <Link to={item.url}>
                      <item.icon />
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
}
