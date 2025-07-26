
import React, { useState } from "react";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { OportunidadesList } from "@/components/oportunidades/OportunidadesList";
import { OportunidadesFilter } from "@/components/oportunidades/OportunidadesFilter";
import { OportunidadesForm } from "@/components/oportunidades/OportunidadesForm";
import { OportunidadesStats } from "@/components/oportunidades/OportunidadesStats";
import { VtexFeedbackTab } from "@/components/oportunidades/VtexFeedbackTab";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Oportunidade } from "@/types";

/**
 * Página principal de gestão de oportunidades.
 * Mantém todos os fluxos: listagem, filtro, estatísticas, cadastro/edição de oportunidades e feedback VTEX.
 * NÃO MODIFIQUE este fluxo sem aprovação, pois está validado e funcional.
 */
export const OportunidadesPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOportunidadeId, setSelectedOportunidadeId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleEdit = (oportunidade: Oportunidade) => {
    setSelectedOportunidadeId(oportunidade.id);
    setIsFormOpen(true);
  };

  const handleView = (oportunidade: Oportunidade) => {
    // For now, view and edit use the same form
    handleEdit(oportunidade);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedOportunidadeId(null);
  };

  const abrirNovaOportunidade = () => {
    setSelectedOportunidadeId(null);
    setIsFormOpen(true);
  };

  return (
    <OportunidadesProvider autoLoad={true}>
      <div className="space-y-4 md:space-y-6">
        <DemoModeIndicator />
        
        {/* Header responsivo */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 md:px-0">
          <h1 className="text-xl md:text-2xl font-bold">Gestão de Oportunidades</h1>
          {user && (
            <Button
              onClick={abrirNovaOportunidade}
              className="flex items-center gap-2 w-full sm:w-auto"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              Nova Oportunidade
            </Button>
          )}
        </div>

        {isFormOpen ? (
          <div className="w-full">
            <OportunidadesForm 
              oportunidadeId={selectedOportunidadeId} 
              onClose={handleClose} 
            />
          </div>
        ) : (
          <Tabs defaultValue="lista" className="w-full">
            <TabsList className="mb-4 w-full sm:w-auto">
              <TabsTrigger value="lista" className="flex-1 sm:flex-none">Lista</TabsTrigger>
              <TabsTrigger value="estatisticas" className="flex-1 sm:flex-none">Estatísticas</TabsTrigger>
              <TabsTrigger value="vtex-feedback" className="flex-1 sm:flex-none">Feedback VTEX</TabsTrigger>
            </TabsList>
            <TabsContent value="lista">
              <div className="space-y-4">
                <OportunidadesFilter />
                <div className="w-full overflow-hidden">
                  <OportunidadesList onEdit={handleEdit} onView={handleView} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="estatisticas">
              <div className="w-full overflow-hidden">
                <OportunidadesStats />
              </div>
            </TabsContent>
            <TabsContent value="vtex-feedback">
              <div className="w-full overflow-hidden">
                <VtexFeedbackTab />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </OportunidadesProvider>
  );
};
