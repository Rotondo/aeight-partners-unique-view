import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
