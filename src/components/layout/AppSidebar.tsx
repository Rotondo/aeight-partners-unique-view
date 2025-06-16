import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  LogIn,
  LogOut,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
    title: "Diário",
    url: "/diario",
    icon: NotebookPen,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: Settings,
  },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading } = useAuth();

  // Handler para logout
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
                    isActive={
                      location.pathname === item.url ||
                      location.pathname.startsWith(item.url + "/")
                    }
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Login/Logout */}
              <SidebarMenuItem>
                {isAuthenticated ? (
                  <SidebarMenuButton onClick={handleLogout} isActive={false}>
                    <LogOut />
                    <span>Logout</span>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/login"}
                  >
                    <Link to="/login">
                      <LogIn />
                      <span>Login</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
