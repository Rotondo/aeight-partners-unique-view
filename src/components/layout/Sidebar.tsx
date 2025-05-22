
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart, 
  Users, 
  FileSpreadsheet, 
  Home, 
  Briefcase,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Home,
      exact: true
    },
    {
      name: 'Oportunidades',
      path: '/oportunidades',
      icon: BarChart
    },
    {
      name: 'Indicadores',
      path: '/indicadores',
      icon: FileSpreadsheet
    },
    {
      name: 'Empresas',
      path: '/empresas',
      icon: Briefcase
    },
    {
      name: 'OnePager',
      path: '/onepager',
      icon: FileSpreadsheet,
      subpath: true
    },
    {
      name: 'Quadrantes',
      path: '/quadrante',
      icon: FileSpreadsheet
    },
  ];

  // Admin items only shown to admin users
  const adminItems = user?.papel === 'admin' ? [
    {
      name: 'Admin',
      path: '/admin',
      icon: Shield
    }
  ] : [];

  return (
    <aside className="w-64 h-screen bg-background border-r border-border flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-border">
          <h1 className="font-bold text-lg">A&eight Partners Hub</h1>
        </div>
        
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
            
            {adminItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} A&eight Partnership Hub</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
