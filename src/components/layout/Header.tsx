
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-3 md:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-muted-foreground hidden sm:block">
              Bem-vindo, {user.email}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
