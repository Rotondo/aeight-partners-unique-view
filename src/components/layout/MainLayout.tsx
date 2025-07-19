
import * as React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { loading } = useAuth();

  console.log('[MainLayout] Estado de loading:', loading);

  // Show loading while authentication is being verified
  if (loading) {
    return <LoadingScreen timeout={10000} message="Carregando dashboard..." />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            <div className="mb-4">
              <SidebarTrigger />
            </div>
            {children || <Outlet />}
          </main>
          <footer className="w-full py-2 text-center text-xs text-muted-foreground border-t">
            Desenvolvido por Thiago Rotondo
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
