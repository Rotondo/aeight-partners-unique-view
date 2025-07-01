import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/contexts/WishlistContext";
import { Plus, Search, Building2, TrendingUp, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ParceiroRelevanceCard from "@/components/wishlist/ParceiroRelevanceCard";
import { useParceiroRelevance } from "@/hooks/useParceiroRelevance";
import ClientesVinculadosTable from "@/components/wishlist/ClientesVinculadosTable";
import ClientesNaoVinculadosTable from "@/components/wishlist/ClientesNaoVinculadosTable";
import ClienteFormModal from "@/components/wishlist/ClienteFormModal";
import ApresentacaoModal from "@/components/wishlist/ApresentacaoModal";
import ClientesStats from "@/components/wishlist/ClientesStats";
import { useNavigate } from "react-router-dom";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { usePrivacy } from "@/contexts/PrivacyContext";
// import { shouldCreateAutomaticClientRelationship } from "@/utils/companyClassification"; // May not be needed directly in new handleSubmit
import { EmpresaTipoString } from "@/types/common";
import { ClienteParaAdicionar } from "@/components/wishlist/ClienteFormModal"; // Import the new type
import { useToast } from "@/hooks/use-toast";


// Keep EmpresaOption for fetching, but modal will use ParceiroOption
type EmpresaOption = {
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
};

interface ParceiroOption { // For the Combobox in the modal
  value: string;
  label: string;
}

const CONSOLE_PREFIX = "[EmpresasClientesPage]";

const EmpresasClientesPage: React.FC = () => {
  const {
    empresasClientes,
    loading: loadingEmpresasClientes,
    fetchEmpresasClientes,
    addEmpresaCliente,
    // updateEmpresaCliente, // Assuming edit is out of scope for now for this modal
    solicitarApresentacao,
    createEmpresa, // Added from context
  } = useWishlist();
  const { toast } = useToast();

  const { parceiros, loading: loadingRelevance, refresh: refreshRelevance } = useParceiroRelevance();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("clientes");

  // Modal states for the new "Add Clients to Partner" modal
  const [isAddClientsModalOpen, setIsAddClientsModalOpen] = useState(false);
  const [isSubmittingClients, setIsSubmittingClients] = useState(false);

  // Solicitar apresentação (remains the same)
  const [modalApresentacaoOpen, setModalApresentacaoOpen] = useState(false);
  const [apresentacaoCliente, setApresentacaoCliente] = useState<any | null>(null);
  const [apresentacaoLoading, setApresentacaoLoading] = useState(false);
  const [apresentacaoObs, setApresentacaoObs] = useState("");

  // Data for forms/modals
  // empresasClientesOptions is for the old modal's client dropdown, might be removable if edit is separate
  const [empresasClientesOptions, setEmpresasClientesOptions] = useState<EmpresaOption[]>([]);
  const [empresasParceirosOptions, setEmpresasParceirosOptions] = useState<ParceiroOption[]>([]); // For the new modal's Parceiro Combobox

  // Estado para todas as empresas do tipo cliente (for ClientesNaoVinculadosTable)
  const [empresasClientesAll, setEmpresasClientesAll] = useState<EmpresaOption[]>([]);

  // Demo mode context
  const { isDemoMode } = usePrivacy();

  // Navegação
  const navigate = useNavigate();

  // Buscar empresas para o formulário
  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id,nome,tipo")
        .order("nome");

      if (!error && data) {
        setEmpresasClientesOptions( // This might still be needed if an "Edit" modal is separate
          data.filter((e: any) => e.tipo === "cliente").map((e: any) => ({
            id: e.id,
            nome: e.nome,
            tipo: e.tipo as EmpresaTipoString
          }))
        );
        setEmpresasParceirosOptions( // Changed state variable name and mapping
          data.filter((e: any) => e.tipo === "parceiro" || e.tipo === "intragrupo").map((e: any) => ({
            value: e.id, // For Combobox
            label: e.nome, // For Combobox
            // tipo: e.tipo as EmpresaTipoString // Keep original type if needed elsewhere
          }))
        );
        setEmpresasClientesAll(
          data.filter((e: any) => e.tipo === "cliente").map((e: any) => ({
            id: e.id,
            nome: e.nome,
            tipo: e.tipo as EmpresaTipoString
          }))
        );
      } else {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar empresas do supabase`, error);
      }
    };
    fetchEmpresas();
  }, []);

  const handleSubmitBatchClients = async (
    parceiroId: string,
    clientes: ClienteParaAdicionar[],
    observacoes: string
  ) => {
    setIsSubmittingClients(true);
    try {
      const promises = clientes.map(async (cliente) => {
        let clienteIdToUse = cliente.id;
        if (cliente.isNew && !cliente.id) {
          // Create new empresa if it's new
          const novaEmpresa = await createEmpresa({ nome: cliente.nome, tipo: 'cliente' });
          if (novaEmpresa && novaEmpresa.id) {
            clienteIdToUse = novaEmpresa.id;
            // Optionally update local list of all client companies if needed immediately
            // setEmpresasClientesAll(prev => [...prev, {id: novaEmpresa.id, nome: novaEmpresa.nome, tipo: 'cliente'}]);
          } else {
            throw new Error(`Falha ao criar nova empresa cliente: ${cliente.nome}`);
          }
        }

        if (!clienteIdToUse) {
           throw new Error(`ID do cliente inválido para ${cliente.nome}`);
        }

        // TODO: Check if this client is already linked to this partner to prevent duplicates?
        // This check might be better done in the modal before adding to `clientesParaAdicionar`
        // or as a database constraint. For now, proceeding with add.

        return addEmpresaCliente({
          empresa_proprietaria_id: parceiroId,
          empresa_cliente_id: clienteIdToUse,
          status: true,
          data_relacionamento: new Date().toISOString(),
          observacoes,
        });
      });

      await Promise.all(promises);

      toast({ title: "Sucesso", description: `${clientes.length} cliente(s) adicionado(s) ao parceiro.`});
      setIsAddClientsModalOpen(false); // Close modal on success
      fetchEmpresasClientes(); // Refresh main list
      refreshRelevance(); // Refresh relevance scores
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao submeter clientes em lote:`, error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({ title: "Erro na Submissão", description: `Falha: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmittingClients(false);
    }
  };

  // handleEditar can be re-implemented later if needed for a different modal or flow
  // For now, it's removed to simplify focus on the new "add batch" modal

  const handleSolicitarApresentacao = (relacionamento: any) => {
    setApresentacaoCliente(relacionamento);
    setModalApresentacaoOpen(true);
  };

  const handleSubmitApresentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setApresentacaoLoading(true);
    try {
      if (apresentacaoCliente && solicitarApresentacao) {
        await solicitarApresentacao({
          empresa_cliente_id: apresentacaoCliente.empresa_cliente_id,
          empresa_proprietaria_id: apresentacaoCliente.empresa_proprietaria_id,
          relacionamento_id: apresentacaoCliente.id,
          observacoes: apresentacaoObs,
        });
        setModalApresentacaoOpen(false);
        setApresentacaoCliente(null);
        setApresentacaoObs("");
        refreshRelevance();
      }
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao solicitar apresentação:`, error);
    } finally {
      setApresentacaoLoading(false);
    }
  };

  const handleVincularCliente = (cliente: EmpresaOption) => {
    if (
      cliente.id &&
      cliente.nome &&
      !empresasClientesOptions.some((e) => e.id === cliente.id)
    ) {
      setEmpresasClientesOptions((prev) => [
        ...prev,
        {
          id: cliente.id,
          nome: cliente.nome,
          tipo: "cliente" as EmpresaTipoString,
        },
      ]);
    }
    setEmpresaCliente(cliente.id);
    setModalOpen(true);
    setModalType("novo");
  };

  // Filtros robustos: nunca acessar .nome em objeto nulo, logando inconsistências
  const filteredClientesVinculados = empresasClientes.filter((cliente) => {
    try {
      const clienteNome = cliente.empresa_cliente?.nome || "";
      const proprietarioNome = cliente.empresa_proprietaria?.nome || "";
      if (!cliente.empresa_cliente || !cliente.empresa_cliente.nome) {
        console.warn(`${CONSOLE_PREFIX} Cliente sem nome ou objeto nulo:`, cliente);
      }
      if (!cliente.empresa_proprietaria || !cliente.empresa_proprietaria.nome) {
        console.warn(`${CONSOLE_PREFIX} Proprietário sem nome ou objeto nulo:`, cliente);
      }
      return (
        clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proprietarioNome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao filtrar clientes vinculados:`, error, cliente);
      return false;
    }
  });

  const clientesVinculadosIds = new Set(
    empresasClientes.map((c) => c.empresa_cliente_id)
  );

  const filteredClientesNaoVinculados = empresasClientesAll.filter((cliente) => {
    try {
      if (!cliente.nome) {
        console.warn(`${CONSOLE_PREFIX} Cliente não vinculado sem nome:`, cliente);
      }
      return (
        !clientesVinculadosIds.has(cliente.id) &&
        (cliente.nome || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao filtrar clientes não vinculados:`, error, cliente);
      return false;
    }
  });

  const filteredParceiros = parceiros.filter((parceiro) => {
    try {
      if (!parceiro.nome) {
        console.warn(`${CONSOLE_PREFIX} Parceiro sem nome:`, parceiro);
      }
      return (parceiro.nome || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao filtrar parceiros:`, error, parceiro);
      return false;
    }
  });

  useEffect(() => {
    // Log de diagnóstico para facilitar troubleshooting
    console.log(`${CONSOLE_PREFIX} Estado inicial`, {
      empresasClientes,
      empresasClientesAll,
      parceiros,
      filteredClientesVinculados,
      filteredClientesNaoVinculados,
      filteredParceiros,
    });
  }, [empresasClientes, empresasClientesAll, parceiros, filteredClientesVinculados, filteredClientesNaoVinculados, filteredParceiros]);

  if (loadingEmpresasClientes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      <DemoModeIndicator />

      {/* Botão de retorno para o dashboard da wishlist */}
      <div>
        <Button
          variant="outline"
          onClick={() => navigate("/wishlist")}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
            Base de Clientes & Relevância de Parceiros
          </h1>
          <p className="text-muted-foreground text-sm">
            Gerencie a base de clientes e veja a relevância de cada parceiro
          </p>
        </div>
        <div className="flex gap-2">
          <DemoModeToggle />
          <Button
            onClick={() => {
              setIsAddClientsModalOpen(true); // Open the new modal
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cliente(s)
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Base de Clientes
          </TabsTrigger>
          <TabsTrigger value="relevancia" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Relevância dos Parceiros
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="flex items-center space-x-2 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                activeTab === "clientes"
                  ? "Buscar por empresa ou proprietário..."
                  : "Buscar parceiros..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <TabsContent value="clientes" className="space-y-6">
          {/* Estatísticas */}
          <ClientesStats
            empresasClientes={empresasClientes}
          />

          <ClientesVinculadosTable
            clientesVinculados={filteredClientesVinculados}
            onEditar={(rel) => {
              console.log("Editar clicado (funcionalidade pendente/separada):", rel);
              // Implementar lógica de edição aqui, possivelmente abrindo um modal diferente
              // ou re-habilitando o 'setModalType("editar")' e passando dados para o ClienteFormModal
              // se ele for adaptado para também suportar edição no futuro.
               toast({ title: "Info", description: "Funcionalidade de editar relacionamento pendente."});
            }}
            onSolicitarApresentacao={handleSolicitarApresentacao}
          />

          <ClientesNaoVinculadosTable
            clientesNaoVinculados={filteredClientesNaoVinculados}
            onVincular={(cliente) => {
                // This was for the old modal. For the new one, user directly picks partner.
                // We could open the new modal with this client pre-filled if desired,
                // but it's simpler to just open the modal for general add.
                setIsAddClientsModalOpen(true);
                 toast({ title: "Info", description: `Selecione o parceiro e adicione '${cliente.nome}' à lista de clientes no modal.`});
            }}
          />
        </TabsContent>

        <TabsContent value="relevancia" className="space-y-6">
          {loadingRelevance ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Calculando relevância...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredParceiros.map((parceiro) => (
                <ParceiroRelevanceCard
                  key={parceiro.id}
                  parceiro={parceiro}
                />
              ))}

              {filteredParceiros.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-lg font-semibold mb-1">
                    Nenhum parceiro encontrado
                  </div>
                  <div>
                    {searchTerm
                      ? "Tente ajustar os filtros de busca"
                      : "Aguarde o cálculo da relevância dos parceiros"}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Modal Invocation */}
      <ClienteFormModal
        isOpen={isAddClientsModalOpen}
        onClose={() => setIsAddClientsModalOpen(false)}
        onSubmit={handleSubmitBatchClients}
        modalLoading={isSubmittingClients}
        empresasParceiros={empresasParceirosOptions}
      />

      {/* ApresentacaoModal remains the same */}
      <ApresentacaoModal
        isOpen={modalApresentacaoOpen}
        onClose={() => setModalApresentacaoOpen(false)}
        apresentacaoCliente={apresentacaoCliente}
        apresentacaoObs={apresentacaoObs}
        setApresentacaoObs={setApresentacaoObs}
        onSubmit={handleSubmitApresentacao}
        loading={apresentacaoLoading}
      />
    </div>
  );
};

export default EmpresasClientesPage;
