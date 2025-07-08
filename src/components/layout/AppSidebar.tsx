import React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"
import { 
  Home, 
  Users, 
  ContactIcon, 
  BookOpen, 
  BarChart2, 
  Activity, 
  Building2, 
  Settings,
  PanelLeft,
  Archive,
  FolderOpen
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  
  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      description: "Visão geral do sistema",
      adminOnly: false
    },
    {
      title: "Oportunidades",
      url: "/oportunidades",
      icon: Users,
      description: "Gestão de oportunidades",
      adminOnly: false
    },
    {
      title: "Dashboard de Oportunidades",
      url: "/oportunidades-dashboard",
      icon: BarChart2,
      description: "Dashboards e métricas",
      adminOnly: false
    },
    {
      title: "Indicadores",
      url: "/indicadores",
      icon: Activity,
      description: "Indicadores de performance",
      adminOnly: false
    },
    {
      title: "Empresas",
      url: "/empresas",
      icon: Building2,
      description: "Gestão de empresas",
      adminOnly: false
    },
    {
      title: "One Pager",
      url: "/onepager",
      icon: PanelLeft,
      description: "Documentos one pager",
      adminOnly: false
    },
    {
      title: "Quadrante",
      url: "/quadrante",
      icon: Archive,
      description: "Análise por quadrantes",
      adminOnly: false
    },
    {
      title: "Repositório",
      url: "/repositorio",
      icon: FolderOpen,
      description: "Repositório de materiais",
      adminOnly: false
    },
    {
      title: "Mapa de Parceiros",
      url: "/mapa-parceiros",
      icon: Users,
      description: "Mapa sequencial de parceiros",
      adminOnly: false
    },
    {
      title: "Diário",
      url: "/diario",
      icon: BookOpen,
      description: "Gestão de atividades diárias",
      adminOnly: true
    },
    {
      title: "Wishlist",
      url: "/wishlist",
      icon: Users,
      description: "Lista de desejos e clientes",
      adminOnly: false
    },
    {
      title: "Eventos",
      url: "/eventos",
      icon: ContactIcon,
      description: "Gestão de eventos e contatos",
      adminOnly: true
    },
    {
      title: "Admin",
      url: "/admin",
      icon: Settings,
      description: "Administração do sistema",
      adminOnly: true
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">A<span className="text-blue-500">&</span>eight</span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                if (item.adminOnly && user?.papel !== 'admin') {
                  return null;
                }

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <p className="text-xs text-gray-500">
            Desenvolvido por Thiago Rotondo
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
