
import React from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
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
      title: "Diário",
      url: "/diario",
      icon: Users,
      description: "Gestão de atividades diárias",
      adminOnly: false
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
  ];

  return (
    <Sidebar {...props}>
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">A<span className="text-blue-500">&</span>eight</span>
        </Link>
      </div>
      
      <div className="px-4 pb-4">
        <NavigationMenu orientation="vertical">
          <NavigationMenuList className="flex-col space-x-0 space-y-1">
            {navigationItems.map((item) => {
              if (item.adminOnly && user?.papel !== 'admin') {
                return null;
              }

              return (
                <NavigationMenuItem key={item.url} className="w-full">
                  <Link to={item.url} className="outline-none w-full">
                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} w-full justify-start`}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="mt-auto p-4">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} A&eight Partners
        </p>
      </div>
    </Sidebar>
  )
}
