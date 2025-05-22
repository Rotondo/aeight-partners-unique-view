import React, { useState } from "react";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { OportunidadesList } from "@/components/oportunidades/OportunidadesList";
import { OportunidadesFilter } from "@/components/oportunidades/OportunidadesFilter";
import { OportunidadesForm } from "@/components/oportunidades/OportunidadesForm";
import { OportunidadesStats } from "@/components/oportunidades/OportunidadesStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export const OportunidadesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOportunidadeId, setSelectedOportunidadeId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleEdit = (id: string) => {
    setSelectedOportunidadeId(id);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedOportunidadeId(null);
  };

  return (
    <OportunidadesProvider>
      <div className="container mx-auto p-4 space-y-6 relative">
        {/* Botão Nova Oportunidade sempre fixo no topo direito */}
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
          <h1 className="text-2xl font-bold">Gestão de Oportunidades</h1>
          {!isFormOpen && user && (
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Oportunidade
            </Button>
          )}
        </div>
        {isFormOpen ? (
          <OportunidadesForm 
            oportunidadeId={selectedOportunidadeId} 
            onClose={handleClose} 
          />
        ) : (
          <Tabs defaultValue="lista" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="lista">Lista de Oportunidades</TabsTrigger>
              <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
            </TabsList>
            <TabsContent value="lista">
              <div className="space-y-4">
                <OportunidadesFilter />
                <OportunidadesList onEdit={handleEdit} />
              </div>
            </TabsContent>
            <TabsContent value="estatisticas">
              <OportunidadesStats />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </OportunidadesProvider>
  );
};
