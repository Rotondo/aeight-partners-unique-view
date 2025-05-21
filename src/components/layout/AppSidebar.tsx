
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  BarChart,
  ChartBar,
  GridIcon,
  DatabaseIcon,
  Settings
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, label, icon, active }) => (
  <Link to={to} className="w-full">
    <Button
      variant={active ? "default" : "ghost"}
      className={cn(
        "w-full justify-start",
        active ? "bg-primary" : "hover:bg-muted"
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  </Link>
);

interface AppSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <aside className="w-64 h-screen bg-background border-r p-4 hidden md:block">
      <div className="flex flex-col h-full space-y-2">
        <div className="text-xl font-bold p-2 mb-6">
          A&eight Partnership Hub
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarLink
            to="/"
            label="Dashboard"
            icon={<LayoutDashboard size={20} />}
            active={isActive("/")}
          />
          <SidebarLink
            to="/oportunidades"
            label="Oportunidades"
            icon={<FileText size={20} />}
            active={isActive("/oportunidades")}
          />
          <SidebarLink
            to="/oportunidades-dashboard"
            label="Dashboards"
            icon={<ChartBar size={20} />}
            active={isActive("/oportunidades-dashboard")}
          />
          <SidebarLink
            to="/onepager"
            label="OnePager"
            icon={<GridIcon size={20} />}
            active={isActive("/onepager")}
          />
          <SidebarLink
            to="/quadrante"
            label="Quadrante"
            icon={<BarChart size={20} />}
            active={isActive("/quadrante")}
          />
          <SidebarLink
            to="/admin"
            label="Administração"
            icon={<DatabaseIcon size={20} />}
            active={isActive("/admin")}
          />
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
