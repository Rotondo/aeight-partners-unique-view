import React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Link } from "react-router-dom"
import { Home, Settings, Users, ContactIcon } from 'lucide-react';

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
      title: "Usuários",
      url: "/usuarios",
      icon: Users,
      description: "Gerenciamento de usuários",
      adminOnly: true
    },
    {
      title: "Eventos",
      url: "/eventos",
      icon: ContactIcon,
      description: "Gestão de eventos e contatos",
      adminOnly: true
    },
    {
      title: "Configurações",
      url: "/configuracoes",
      icon: Settings,
      description: "Ajustes gerais do sistema",
      adminOnly: true
    },
  ];

  return (
    <Sidebar {...props}>
      <Sidebar.Header>
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">A<span className="text-blue-500">&</span>eight</span>
        </Link>
      </Sidebar.Header>
      <Sidebar.Content>
        <NavigationMenu>
          <NavigationMenuList>
            {navigationItems.map((item) => {
              if (item.adminOnly && user?.papel !== 'admin') {
                return null;
              }

              return (
                <NavigationMenuItem key={item.url}>
                  <Link to={item.url} className="outline-none">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </Sidebar.Content>
      <Sidebar.Footer>
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} A&eight Partners
        </p>
      </Sidebar.Footer>
    </Sidebar>
  )
}
