
import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"

// Ensure React is properly initialized
if (!React || typeof React.useState !== 'function') {
  console.error('[AppSidebar] React is not properly initialized');
  throw new Error('React is not properly initialized - hooks are not available');
}
import {
  Home,
  Users,
  Building2,
  Tags,
  Contact,
  TrendingUp,
  FileText,
  Archive,
  Heart,
  Calendar,
  Target,
  BarChart3,
  Compass,
  BookOpen,
  Settings
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Logo } from "./Logo"
import { useAuth } from "@/hooks/useAuth"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Mapa Parceiros", url: "/mapa-parceiros", icon: Compass },
  { title: "Empresas", url: "/empresas", icon: Building2 },
  { title: "Categorias", url: "/categorias", icon: Tags },
  { title: "Contatos", url: "/contatos", icon: Contact },
  { title: "Indicadores", url: "/indicadores", icon: TrendingUp },
  { title: "One Pager", url: "/onepager", icon: FileText },
  { title: "Repositório", url: "/repositorio", icon: Archive },
  { title: "Wishlist", url: "/wishlist", icon: Heart },
  { title: "Eventos", url: "/eventos", icon: Calendar },
  { title: "Oportunidades", url: "/oportunidades", icon: Target },
]

const dashboardItems = [
  { title: "Dashboard Oportunidades", url: "/oportunidades-dashboard", icon: BarChart3 },
  { title: "Quadrante", url: "/quadrante", icon: Target },
]

const adminItems = [
  { title: "Diário", url: "/diario", icon: BookOpen },
  { title: "Admin", url: "/admin", icon: Settings },
]

export function AppSidebar() {
  const { user } = useAuth()
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) => {
    const active = isActive(path)
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
  }

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          <Logo />
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.papel === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls(item.url)}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
