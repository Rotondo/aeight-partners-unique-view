
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import Header from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path.startsWith('/onepager')) return 'OnePager de Parceiros';
    if (path.startsWith('/oportunidades')) return 'Dashboard de Oportunidades';
    if (path.startsWith('/quadrante')) return 'Quadrante de Parceiros';
    if (path.startsWith('/admin')) return 'Administração';
    if (path === '/') return 'Dashboard';
    
    return 'A&eight Partnership Hub';
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={getPageTitle()} toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
