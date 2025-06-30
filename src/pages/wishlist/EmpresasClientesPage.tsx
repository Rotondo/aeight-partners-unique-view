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
import { PrivateData } from "@/components/privacy/PrivateData";
import { shouldCreateAutomaticClientRelationship } from "@/utils/companyClassification";
import { EmpresaTipoString } from "@/types/common";

type EmpresaOption = {
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
};

const CONSOLE_PREFIX = "[EmpresasClientesPage]";

const EmpresasClientesPage: React.FC = () => {
  const {
    empresasClientes,
    loading: loadingEmpresasClientes,
    fetchEmpresasClientes,
    addEmpresaCliente,
    updateEmpresaCliente,
    solicitarApresentacao,
  } = useWishlist();

  const { parceiros, loading: loadingRelevance, refresh: refreshRelevance } = useParceiroRelevance();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("clientes");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalType, setModalType] = useState<"novo" | "editar">("novo");
  const [editRelacionamentoId, setEditRelacionamentoId] = useState<string | null>(null);

  // Solicitar apresentação
  const [modalApresentacaoOpen, setModalApresentacaoOpen] = useState(false);
  const [apresentacaoCliente, setApresentacaoCliente] = useState<any | null>(null);
  const [apresentacaoLoading, setApresentacaoLoading] = useState(false);
  const [apresentacaoObs, setApresentacaoObs] = useState("");

  // Form state
  const [empresasClientesOptions, setEmpresasClientesOptions] = useState<EmpresaOption[]>([]);
  const [empresasParceiros, setEmpresasParceiros] = useState<EmpresaOption[]>([]);
  const [parceirosSelecionados, setParceirosSelecionados] = useState<string[]>([]);
  const [empresaCliente, setEmpresaCliente] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  // Estado para todas as empresas do tipo cliente
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
        setEmpresasClientesOptions(
          data.filter((e: any) => e.tipo === "cliente").map((e: any) => ({
            id: e.id,
            nome: e.nome,
            tipo: e.tipo as EmpresaTipoString
          }))
        );
        setEmpresasParceiros(
          data.filter((e: any) => e.tipo === "parceiro" || e.tipo === "intragrupo").map((e: any) => ({
            id: e.id,
            nome: e.nome,
            tipo: e.tipo as EmpresaTipoString
          }))
        );
        setEmpresasClientesAll(
          data.filter((e: any) => e.tipo === "cliente").map((e: any) => ({
            id: e.id,
            nome: e.nome,
            tipo: e.tipo as EmpresaTipoString
          }))
        );
      }
    };
    fetchEmpresas();
  }, []);

  const resetModal = () => {
    setParceirosSelecionados([]);
    setEmpresaCliente("");
    setObservacoes("");
    setEditRelacionamentoId(null);
    setModalType("novo");
  };

  const parceirosJaVinculadosAoCliente = (clienteId: string) =>
    empresasClientes
      .filter((v) => v.empresa_cliente_id === clienteId)
      .map((v) => v.empresa_proprietaria_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);

    if (modalType === "editar" && editRelacionamentoId) {
      await updateEmpresaCliente(editRelacionamentoId, {
        empresa_proprietaria_id: parceirosSelecionados[0],
        empresa_cliente_id: empresaCliente,
        observacoes,
      });
    } else {
      const jaVinculados = parceirosJaVinculadosAoCliente(empresaCliente);
      const novosParceiros = parceirosSelecionados.filter(
        (id) => !jaVinculados.includes(id)
      );

      // Filter out partners that shouldn't have automatic relationships created
      const validPartners = [];
      for (const parceiroId of novosParceiros) {
        const partner = empresasParceiros.find(p => p.id === parceiroId);
        if (partner && shouldCreateAutomaticClientRelationship(partner.tipo, parceiroId)) {
          validPartners.push(parceiroId);
        } else if (partner) {
          console.warn(`${CONSOLE_PREFIX} Skipping automatic relationship creation with ${partner.tipo} company: ${partner.nome}`);
        }
      }

      if (validPartners.length > 0) {
        await Promise.all(
          validPartners.map((parceiroId) =>
            addEmpresaCliente({
              empresa_proprietaria_id: parceiroId,
              empresa_cliente_id: empresaCliente,
              status: true,
              data_relacionamento: new Date().toISOString(),
              observacoes,
            })
          )
        );
      }

      // Show warning if some relationships were skipped
      if (validPartners.length < novosParceiros.length) {
        console.warn(`${CONSOLE_PREFIX} Some relationships were not created due to business rules (preventing automatic Aeight linking)`);
      }
    }
    setModalLoading(false);
    setModalOpen(false);
    resetModal();
    fetchEmpresasClientes();
    refreshRelevance();
  };

  const handleEditar = (relacionamento: any) => {
    const clienteId = relacionamento.empresa_cliente_id;
    const nome = relacionamento.empresa_cliente?.nome;

    if (
      clienteId &&
      nome &&
      !empresasClientesOptions.some((e) => e.id === clienteId)
    ) {
      setEmpresasClientesOptions((prev) => [
        ...prev,
        { id: clienteId, nome, tipo: "cliente" as EmpresaTipoString },
      ]);
    }

    setModalType("editar");
    setEditRelacionamentoId(relacionamento.id);
    setParceirosSelecionados([relacionamento.empresa_proprietaria_id]);
    setEmpresaCliente(clienteId);
    setObservacoes(relacionamento.observacoes || "");
    setModalOpen(true);
  };

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

  // Filtros robustos: nunca acessar .nome em objeto nulo
  const filteredClientesVinculados = empresasClientes.filter((cliente) => {
    try {
      const clienteNome = cliente.empresa_cliente?.nome || "";
      const proprietarioNome = cliente.empresa_proprietaria?.nome || "";
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
              setModalOpen(true);
              setModalType("novo");
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Cliente
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
            onEditar={handleEditar}
            onSolicitarApresentacao={handleSolicitarApresentacao}
          />

          <ClientesNaoVinculadosTable
            clientesNaoVinculados={filteredClientesNaoVinculados}
            onVincular={handleVincularCliente}
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

      {/* Modals */}
      <ClienteFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetModal();
        }}
        modalType={modalType}
        editRelacionamentoId={editRelacionamentoId}
        parceirosSelecionados={parceirosSelecionados}
        setParceirosSelecionados={setParceirosSelecionados}
        empresaCliente={empresaCliente}
        setEmpresaCliente={setEmpresaCliente}
        observacoes={observacoes}
        setObservacoes={setObservacoes}
        onSubmit={handleSubmit}
        modalLoading={modalLoading}
        empresasClientesOptions={empresasClientesOptions}
        setEmpresasClientesOptions={(empresas: EmpresaOption[]) => setEmpresasClientesOptions(empresas)}
        empresasParceiros={empresasParceiros}
        parceirosJaVinculadosAoCliente={parceirosJaVinculadosAoCliente}
      />

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
