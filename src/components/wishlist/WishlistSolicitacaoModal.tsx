import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/contexts/WishlistContext";
// Removed useClientesPorEmpresa import - using ClienteOption from types
import { useCrm } from "@/contexts/CrmContext";
import { useAuth } from "@/hooks/useAuth";
import ClienteMultiSelect, { ClienteSelecionado } from "./ClienteMultiSelect";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface WishlistSolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "empresas" | "clientes" | "detalhes" | "clientes_reciprocidade" | "preview";

const WishlistSolicitacaoModal: React.FC<WishlistSolicitacaoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWishlistItem, fetchWishlistItems } = useWishlist();
  // Estados para clientes
  const [clientes, setClientes] = useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const { createAcaoCrm } = useCrm();
  const { user } = useAuth();

  // Estados do formulário
  const [currentStep, setCurrentStep] = useState<Step>("empresas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados das empresas
  const [empresasParceiros, setEmpresasParceiros] = useState<EmpresaOption[]>([]);
  const [empresaSolicitante, setEmpresaSolicitante] = useState<string>("");
  const [empresaDemandada, setEmpresaDemandada] = useState<string>("");

  // Seleção de clientes
  const [clientesSelecionados, setClientesSelecionados] = useState<ClienteSelecionado[]>([]);
  
  // Estados específicos para reciprocidade
  const [clientesReciprocidade, setClientesReciprocidade] = useState<any[]>([]);
  const [clientesReciprocidadeSelecionados, setClientesReciprocidadeSelecionados] = useState<ClienteSelecionado[]>([]);
  const [loadingClientesReciprocidade, setLoadingClientesReciprocidade] = useState(false);

  // Detalhes da solicitação
  const [motivo, setMotivo] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [solicitarReciprocidade, setSolicitarReciprocidade] = useState<boolean>(false);

  // Carregar empresas quando modal abre
  useEffect(() => {
    if (!isOpen) return;

    const fetchEmpresas = async () => {
      try {
        const { data, error } = await supabase
          .from("empresas")
          .select("id, nome, tipo")
          .in("tipo", ["parceiro", "intragrupo"])
          .eq("status", true)
          .order("nome");

        if (error) throw error;

        setEmpresasParceiros(data || []);
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas",
          variant: "destructive",
        });
      }
    };

    fetchEmpresas();
  }, [isOpen]);

  // Carregar clientes quando empresa demandada é selecionada
  useEffect(() => {
    if (empresaDemandada && currentStep === "clientes") {
      const fetchClientesEmpresa = async () => {
        setLoadingClientes(true);
        try {
          const { data, error } = await supabase
            .from('empresas')
            .select('id, nome, tipo, descricao, status')
            .eq('tipo', 'cliente')
            .eq('status', true)
            .order('nome');

          if (error) throw error;

          const clientesFormatados = (data || []).map(empresa => ({
            id: empresa.id,
            nome: empresa.nome,
            tipo: empresa.tipo,
            descricao: empresa.descricao,
            status: empresa.status,
            empresa_proprietaria: null
          }));

          setClientes(clientesFormatados);
        } catch (err) {
          console.error('Erro ao carregar clientes:', err);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os clientes',
            variant: 'destructive',
          });
        } finally {
          setLoadingClientes(false);
        }
      };

      fetchClientesEmpresa();
    }
  }, [empresaDemandada, currentStep]);

  // Carregar clientes para reciprocidade quando entrar no step
  useEffect(() => {
    if (currentStep === "clientes_reciprocidade" && empresaSolicitante) {
      const fetchClientesReciprocidade = async () => {
        setLoadingClientesReciprocidade(true);
        try {
          const { data, error } = await supabase
            .from("empresa_clientes")
            .select(`
              empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome)
            `)
            .eq("empresa_proprietaria_id", empresaSolicitante)
            .eq("status", true);

          if (error) throw error;

          setClientesReciprocidade(data || []);
        } catch (err) {
          console.error("Erro ao carregar clientes para reciprocidade:", err);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os clientes para reciprocidade",
            variant: "destructive",
          });
        } finally {
          setLoadingClientesReciprocidade(false);
        }
      };

      fetchClientesReciprocidade();
    }
  }, [currentStep, empresaSolicitante]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setCurrentStep("empresas");
    setEmpresaSolicitante("");
    setEmpresaDemandada("");
    setClientesSelecionados([]);
    setMotivo("");
    setObservacoes("");
    setSolicitarReciprocidade(false);
    setError(null);
  };

  // Função para resetar o modal
  const resetModal = () => {
    setCurrentStep("empresas");
    setError(null);
    setEmpresaSolicitante("");
    setEmpresaDemandada("");
    setClientesSelecionados([]);
    setClientesReciprocidadeSelecionados([]);
    setClientesReciprocidade([]);
    setMotivo("");
    setObservacoes("");
    setSolicitarReciprocidade(false);
  };

  // Resetar modal quando fechado
  useEffect(() => {
    if (!isOpen) {
      resetModal();
    }
  }, [isOpen]);

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "empresas":
        return empresaSolicitante && empresaDemandada && empresaSolicitante !== empresaDemandada;
      case "clientes":
        return clientesSelecionados.length > 0;
      case "detalhes":
        return motivo.trim().length > 0;
      case "clientes_reciprocidade":
        return clientesReciprocidadeSelecionados.length > 0;
      case "preview":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError(getStepErrorMessage(currentStep));
      return;
    }

    setError(null);
    
    // Lógica condicional para o fluxo de reciprocidade
    if (currentStep === "detalhes") {
      // Se reciprocidade foi selecionada, ir para seleção de clientes de reciprocidade
      if (solicitarReciprocidade) {
        setCurrentStep("clientes_reciprocidade");
      } else {
        setCurrentStep("preview");
      }
    } else {
      // Fluxo normal
      const steps: Step[] = ["empresas", "clientes", "detalhes", "clientes_reciprocidade", "preview"];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  };

  const prevStep = () => {
    // Lógica condicional para o fluxo de reciprocidade
    if (currentStep === "preview") {
      // Se reciprocidade foi selecionada, voltar para seleção de clientes de reciprocidade
      if (solicitarReciprocidade) {
        setCurrentStep("clientes_reciprocidade");
      } else {
        setCurrentStep("detalhes");
      }
    } else if (currentStep === "clientes_reciprocidade") {
      setCurrentStep("detalhes");
    } else {
      // Fluxo normal
      const steps: Step[] = ["empresas", "clientes", "detalhes", "clientes_reciprocidade", "preview"];
      const currentIndex = steps.indexOf(currentStep);
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1]);
      }
    }
  };

  const getStepErrorMessage = (step: Step): string => {
    switch (step) {
      case "empresas":
        if (!empresaSolicitante) return "Selecione a empresa solicitante";
        if (!empresaDemandada) return "Selecione a empresa demandada";
        if (empresaSolicitante === empresaDemandada) return "As empresas devem ser diferentes";
        return "";
      case "clientes":
        return "Selecione pelo menos um cliente";
      case "detalhes":
        return "Preencha o motivo da solicitação";
      case "clientes_reciprocidade":
        return "Selecione pelo menos um cliente para reciprocidade";
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    if (!addWishlistItem || !user) {
      toast({
        title: "Erro",
        description: "Função de criação não disponível ou usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar solicitações para cada cliente selecionado (direção principal)
      const solicitacoes = clientesSelecionados.map((cliente) => ({
        empresa_interessada_id: empresaSolicitante,
        empresa_desejada_id: cliente.id,
        empresa_proprietaria_id: empresaDemandada,
        prioridade: cliente.prioridade,
        motivo,
        observacoes,
        status: "pendente" as const,
        data_solicitacao: new Date().toISOString(),
      }));

      // Executar todas as inserções da direção principal
      await Promise.all(
        solicitacoes.map((solicitacao) => addWishlistItem(solicitacao))
      );

      let solicitacoesReciprocas: any[] = [];

      // Se reciprocidade foi selecionada, criar solicitações inversas
      if (solicitarReciprocidade && clientesReciprocidadeSelecionados.length > 0) {
        solicitacoesReciprocas = clientesReciprocidadeSelecionados.map((cliente) => ({
          empresa_interessada_id: empresaDemandada,
          empresa_desejada_id: cliente.id,
          empresa_proprietaria_id: empresaSolicitante,
          prioridade: cliente.prioridade,
          motivo: `Reciprocidade - ${motivo}`,
          observacoes: `Solicitação recíproca. ${observacoes}`,
          status: "pendente" as const,
          data_solicitacao: new Date().toISOString(),
        }));

        await Promise.all(
          solicitacoesReciprocas.map((solicitacao) => addWishlistItem(solicitacao))
        );
      }

      // Integração com CRM
      const empresaSolicitanteNome = getEmpresaNome(empresaSolicitante);
      const empresaDemandadaNome = getEmpresaNome(empresaDemandada);
      
      // Determinar qual empresa é parceira (não intragrupo) para partner_id
      const empresaSolicitanteData = empresasParceiros.find(e => e.id === empresaSolicitante);
      const empresaDemandadaData = empresasParceiros.find(e => e.id === empresaDemandada);
      
      const partnerId = empresaSolicitanteData?.tipo === "parceiro" ? empresaSolicitante : 
                       empresaDemandadaData?.tipo === "parceiro" ? empresaDemandada : 
                       undefined;

      // Criar conteúdo detalhado para o CRM
      let contentDetails = `Solicitação de Wishlist concluída:\n\n`;
      contentDetails += `DIREÇÃO PRINCIPAL:\n`;
      contentDetails += `${empresaSolicitanteNome} → ${empresaDemandadaNome}\n`;
      contentDetails += `Clientes solicitados (${clientesSelecionados.length}):\n`;
      clientesSelecionados.forEach(cliente => {
        contentDetails += `• ${cliente.nome} (Prioridade: ${cliente.prioridade})\n`;
      });
      
      if (solicitarReciprocidade && clientesReciprocidadeSelecionados.length > 0) {
        contentDetails += `\nDIREÇÃO RECÍPROCA:\n`;
        contentDetails += `${empresaDemandadaNome} → ${empresaSolicitanteNome}\n`;
        contentDetails += `Clientes solicitados (${clientesReciprocidadeSelecionados.length}):\n`;
        clientesReciprocidadeSelecionados.forEach(cliente => {
          contentDetails += `• ${cliente.nome} (Prioridade: ${cliente.prioridade})\n`;
        });
      }
      
      contentDetails += `\nMotivo: ${motivo}\n`;
      if (observacoes) {
        contentDetails += `Observações: ${observacoes}\n`;
      }

      // Criar ação no CRM
      const crmAction = {
        description: `Solicitação de Wishlist concluída entre ${empresaSolicitanteNome} e ${empresaDemandadaNome}`,
        content: contentDetails,
        communication_method: "email" as const,
        status: "concluida" as const,
        partner_id: partnerId,
        metadata: {
          wishlist_request: true,
          empresa_solicitante_id: empresaSolicitante,
          empresa_demandada_id: empresaDemandada,
          reciprocidade: solicitarReciprocidade,
          clientes_solicitados: clientesSelecionados.map(c => ({ id: c.id, nome: c.nome, prioridade: c.prioridade })),
          clientes_reciprocidade: solicitarReciprocidade ? clientesReciprocidadeSelecionados.map(c => ({ id: c.id, nome: c.nome, prioridade: c.prioridade })) : [],
          total_solicitacoes: solicitacoes.length + solicitacoesReciprocas.length
        }
      };

      await createAcaoCrm(crmAction);

      // Atualizar lista
      await fetchWishlistItems?.();

      // Mensagem de sucesso
      const totalSolicitacoes = solicitacoes.length + solicitacoesReciprocas.length;
      toast({
        title: "Sucesso!",
        description: `${totalSolicitacoes} solicitação(ões) criada(s) com sucesso e registrada no CRM`,
      });

      onClose();
    } catch (err: any) {
      console.error("Erro ao criar solicitações:", err);
      setError("Erro ao criar solicitações. Tente novamente.");
      toast({
        title: "Erro",
        description: err?.message || "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaNome = (empresaId: string) => {
    const empresa = empresasParceiros.find((e) => e.id === empresaId);
    return empresa?.nome || "";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "empresas":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Quem está solicitando? *
              </label>
              <Select value={empresaSolicitante} onValueChange={setEmpresaSolicitante}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa solicitante" />
                </SelectTrigger>
                <SelectContent>
                  {empresasParceiros.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                De quem está solicitando? *
              </label>
              <Select value={empresaDemandada} onValueChange={setEmpresaDemandada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa demandada" />
                </SelectTrigger>
                <SelectContent>
                  {empresasParceiros
                    .filter((e) => e.id !== empresaSolicitante)
                    .map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Os clientes disponíveis serão filtrados automaticamente após a seleção das empresas
                </span>
              </div>
            </div>
          </div>
        );

      case "clientes":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                Clientes de {getEmpresaNome(empresaDemandada)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecione os clientes desejados e defina a prioridade de cada um
              </p>
            </div>

            <ClienteMultiSelect
              clientes={clientes}
              clientesSelecionados={clientesSelecionados}
              onClientesSelecionadosChange={setClientesSelecionados}
              loading={loadingClientes}
            />
          </div>
        );

      case "detalhes":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Motivo da solicitação *
              </label>
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Expansão para novos mercados, parcerias estratégicas..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Observações (opcional)
              </label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais sobre a solicitação..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reciprocidade"
                checked={solicitarReciprocidade}
                onCheckedChange={(checked) => setSolicitarReciprocidade(checked === true)}
              />
              <label htmlFor="reciprocidade" className="text-sm">
                Solicitar reciprocidade (trocar clientes mutuamente)
              </label>
            </div>
          </div>
        );

      case "clientes_reciprocidade":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">
                Seleção Recíproca - Clientes de {getEmpresaNome(empresaSolicitante)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Agora selecione os clientes que {getEmpresaNome(empresaDemandada)} poderá receber em troca
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Este é o segundo passo da reciprocidade. Selecione os clientes que serão oferecidos em troca.
                </span>
              </div>
            </div>

            <ClienteMultiSelect
              clientes={clientesReciprocidade.map((item: any) => ({
                id: item.empresa_cliente.id,
                nome: item.empresa_cliente.nome,
                empresa_proprietaria: {
                  id: empresaSolicitante,
                  nome: getEmpresaNome(empresaSolicitante),
                  tipo: 'intragrupo'
                }
              }))}
              clientesSelecionados={clientesReciprocidadeSelecionados}
              onClientesSelecionadosChange={setClientesReciprocidadeSelecionados}
              loading={loadingClientesReciprocidade}
            />
          </div>
        );

      case "preview":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Resumo da Solicitação</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getEmpresaNome(empresaSolicitante)}</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{getEmpresaNome(empresaDemandada)}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium">Clientes solicitados ({clientesSelecionados.length}):</p>
                <div className="mt-2 space-y-1">
                  {clientesSelecionados.map((cliente) => (
                    <div key={cliente.id} className="flex items-center justify-between text-sm">
                      <span>{cliente.nome}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: cliente.prioridade }, (_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {solicitarReciprocidade && clientesReciprocidadeSelecionados.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Clientes recíprocos ({clientesReciprocidadeSelecionados.length}):</p>
                  <div className="mt-2 space-y-1">
                    {clientesReciprocidadeSelecionados.map((cliente) => (
                      <div key={cliente.id} className="flex items-center justify-between text-sm">
                        <span>{cliente.nome}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: cliente.prioridade }, (_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Motivo:</p>
                <p className="text-sm text-muted-foreground">{motivo}</p>
              </div>

              {observacoes && (
                <div>
                  <p className="text-sm font-medium">Observações:</p>
                  <p className="text-sm text-muted-foreground">{observacoes}</p>
                </div>
              )}

              {solicitarReciprocidade && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✓ Solicitação recíproca será criada com {clientesReciprocidadeSelecionados.length} cliente(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "empresas":
        return "Selecionar Empresas";
      case "clientes":
        return "Selecionar Clientes";
      case "detalhes":
        return "Detalhes da Solicitação";
      case "clientes_reciprocidade":
        return "Seleção Recíproca";
      case "preview":
        return "Confirmar Solicitação";
      default:
        return "";
    }
  };

  const getCurrentStepNumber = () => {
    const steps = ["empresas", "clientes", "detalhes"];
    if (solicitarReciprocidade) {
      steps.push("clientes_reciprocidade");
    }
    steps.push("preview");
    
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => {
    return solicitarReciprocidade ? 5 : 4;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Wishlist</DialogTitle>
          <DialogDescription>
            {getStepTitle()} - Etapa {getCurrentStepNumber()} de {getTotalSteps()}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === "empresas" || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>

              {currentStep === "preview" ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Criar Solicitação
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={!validateStep(currentStep)}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistSolicitacaoModal;