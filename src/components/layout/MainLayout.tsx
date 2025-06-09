
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import Header from "./Header";

const MainLayout: React.FC = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            <Outlet />
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
