import React from "react";
import {
  LayoutDashboard,
  ListChecks,
  BarChart2,
  Settings,
  Activity,
  Building2,
  PanelLeft,
  KanbanSquare
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const menuItems = [
    {
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: <ListChecks size={18} />,
      label: "Oportunidades",
      href: "/oportunidades",
    },
    {
      icon: <BarChart2 size={18} />,
      label: "Dashboard de Oportunidades",
      href: "/oportunidades-dashboard",
    },
    {
      icon: <Activity size={18} />,
      label: "Indicadores",
      href: "/indicadores",
    },
    {
      icon: <Building2 size={18} />,
      label: "Empresas",
      href: "/empresas",
    },
    {
      icon: <PanelLeft size={18} />,
      label: "One Pager",
      href: "/onepager",
    },
    {
      icon: <KanbanSquare size={18} />,
      label: "Quadrante",
      href: "/quadrante",
    },
    {
      icon: <Settings size={18} />,
      label: "Admin",
      href: "/admin",
    },
  ];

  return (
    <div
      className={`flex flex-col h-full ${
        isCollapsed ? "w-16" : "w-64"
      } bg-gray-50 border-r border-gray-200`}
    >
      <div className="p-4">
        <h1 className={`text-2xl font-bold ${isCollapsed ? "hidden" : ""}`}>
          A&eight
        </h1>
      </div>
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded-md hover:bg-gray-100 ${
                    isActive ? "bg-gray-100 font-semibold" : ""
                  }`
                }
              >
                <span className="mr-2">{item.icon}</span>
                <span className={`${isCollapsed ? "hidden" : ""}`}>
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
