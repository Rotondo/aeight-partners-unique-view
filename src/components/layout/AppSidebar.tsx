import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, FileText, PieChart, Settings, LayoutGrid, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AppSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo and collapse button */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className={cn("flex items-center", isOpen ? "" : "justify-center w-full")}>
            {isOpen ? (
              <h1 className="text-xl font-bold text-sidebar-primary">A&eight</h1>
            ) : (
              <span className="text-xl font-bold text-sidebar-primary">A&8</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:text-sidebar-primary p-1 rounded-md"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            <NavItem to="/" icon={<LayoutGrid size={20} />} text="Dashboard" isOpen={isOpen} />
            <NavItem to="/onepager" icon={<FileText size={20} />} text="OnePager" isOpen={isOpen} />
            <NavItem to="/oportunidades" icon={<BarChart3 size={20} />} text="Oportunidades" isOpen={isOpen} />
            <NavItem to="/quadrante" icon={<PieChart size={20} />} text="Quadrante" isOpen={isOpen} />
            <NavItem to="/admin" icon={<Settings size={20} />} text="Administração" isOpen={isOpen} />
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className={cn(
              "flex items-center w-full px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition",
              isOpen ? "" : "justify-center"
            )}
          >
            <LogOut size={20} />
            {isOpen && <span className="ml-3">Sair</span>}
          </button>
        </div>
        {/* Rodapé fixo */}
        <footer className="p-4 text-xs text-center text-muted-foreground">
          Desenvolvido por Thiago Rotondo
        </footer>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, text, isOpen }) => {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center px-3 py-2 rounded-md transition",
            isOpen ? "" : "justify-center",
            isActive
              ? "bg-sidebar-accent text-sidebar-primary font-medium"
              : "hover:bg-sidebar-hover"
          )
        }
      >
        {icon}
        {isOpen && <span className="ml-3">{text}</span>}
      </NavLink>
    </li>
  );
};

export default AppSidebar;
