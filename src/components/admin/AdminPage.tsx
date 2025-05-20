
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriasList } from "@/components/admin/CategoriasList";
import { EmpresasList } from "@/components/admin/EmpresasList";
import { ContatosList } from "@/components/admin/ContatosList";
import { UsuariosList } from "@/components/admin/UsuariosList";
import { IndicadoresList } from "@/components/admin/IndicadoresList";
import { OnePagerList } from "@/components/admin/OnePagerList";
import { useAuth } from "@/hooks/useAuth";

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  
  // Verificar se o usuário tem permissão de admin
  if (user?.papel !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/20 p-4 rounded-md">
          <h2 className="font-semibold text-lg">Acesso Negado</h2>
          <p>Você não possui permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administração</h1>
        <p className="text-muted-foreground">
          Gerencie entidades, configurações e usuários do sistema
        </p>
      </div>

      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="w-full overflow-x-auto flex-wrap justify-start">
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="onepagers">OnePagers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categorias">
          <CategoriasList />
        </TabsContent>
        
        <TabsContent value="empresas">
          <EmpresasList />
        </TabsContent>
        
        <TabsContent value="contatos">
          <ContatosList />
        </TabsContent>
        
        <TabsContent value="usuarios">
          <UsuariosList />
        </TabsContent>
        
        <TabsContent value="indicadores">
          <IndicadoresList />
        </TabsContent>
        
        <TabsContent value="onepagers">
          <OnePagerList />
        </TabsContent>
      </Tabs>
    </div>
  );
};
