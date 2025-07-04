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
import { useClientesPorEmpresa } from "@/hooks/useClientesPorEmpresa";
import ClienteMultiSelect, { ClienteSelecionado } from "./ClienteMultiSelect";
import { CrmService } from "@/services/CrmService";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface WishlistSolicitacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "empresas" | "clientes" | "detalhes" | "preview";

const WishlistSolicitacaoModal: React.FC<WishlistSolicitacaoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWishlistItem, fetchWishlistItems } = useWishlist();
  const { clientes, loading: loadingClientes, fetchClientesPorEmpresa } = useClientesPorEmpresa();

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
      fetchClientesPorEmpresa(empresaDemandada);
    }
  }, [empresaDemandada, currentStep, fetchClientesPorEmpresa]);

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

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "empresas":
        return empresaSolicitante && empresaDemandada && empresaSolicitante !== empresaDemandada;
      case "clientes":
        return clientesSelecionados.length > 0;
      case "detalhes":
        return motivo.trim().length > 0;
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
    const steps: Step[] = ["empresas", "clientes", "detalhes", "preview"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["empresas", "clientes", "detalhes", "preview"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
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
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    if (!addWishlistItem) {
      toast({
        title: "Erro",
        description: "Função de criação não disponível",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar solicitações para cada cliente selecionado
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

      // Executar todas as inserções
      await Promise.all(
        solicitacoes.map((solicitacao) => addWishlistItem(solicitacao))
      );

      // Se reciprocidade foi selecionada, criar solicitações inversas
      if (solicitarReciprocidade) {
        // Buscar clientes da empresa solicitante para reciprocidade
        const { data: clientesReciprocidade, error } = await supabase
          .from("empresa_clientes")
          .select(`
            empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome)
          `)
          .eq("empresa_proprietaria_id", empresaSolicitante)
          .eq("status", true)
          .limit(3); // Limitar para evitar muitas solicitações

        if (!error && clientesReciprocidade && clientesReciprocidade.length > 0) {
          const solicitacoesReciprocas = clientesReciprocidade.map((item: any) => ({
            empresa_interessada_id: empresaDemandada,
            empresa_desejada_id: item.empresa_cliente.id,
            empresa_proprietaria_id: empresaSolicitante,
            prioridade: 3, // Prioridade padrão para reciprocidade
            motivo: `Reciprocidade - ${motivo}`,
            observacoes: `Solicitação recíproca automática. ${observacoes}`,
            status: "pendente" as const,
            data_solicitacao: new Date().toISOString(),
          }));

          await Promise.all(
            solicitacoesReciprocas.map((solicitacao) => addWishlistItem(solicitacao))
          );
        }
      }

      // Atualizar lista
      await fetchWishlistItems?.();

      // Integração CRM: Criar ações de follow-up para solicitações
      try {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          // Criar ação CRM para acompanhar a solicitação
          const crmAction = {
            description: `Acompanhar solicitação wishlist: ${getEmpresaNome(empresaSolicitante)} → ${getEmpresaNome(empresaDemandada)}`,
            communication_method: 'email' as const,
            status: 'pending' as const,
            partner_id: empresaDemandada,
            content: `Solicitação de ${clientesSelecionados.length} cliente(s). Motivo: ${motivo}${solicitarReciprocidade ? ' (com reciprocidade)' : ''}`,
            next_step_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
            next_steps: 'Verificar status da solicitação e processar apresentações'
          };

          await CrmService.createAcao(crmAction, userId);
        }
      } catch (crmError) {
        console.warn('Erro ao criar ação CRM (não crítico):', crmError);
      }

      // Mensagem de sucesso
      const totalSolicitacoes = clientesSelecionados.length + (solicitarReciprocidade ? 1 : 0);
      toast({
        title: "Sucesso!",
        description: `${totalSolicitacoes} solicitação(ões) criada(s) com sucesso`,
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

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reciprocidade"
                  checked={solicitarReciprocidade}
                  onCheckedChange={(checked) => setSolicitarReciprocidade(checked === true)}
                />
                <label htmlFor="reciprocidade" className="text-sm font-medium">
                  Solicitar reciprocidade (trocar clientes mutuamente)
                </label>
              </div>
              
              {solicitarReciprocidade && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 mb-1">
                        Fluxo de Reciprocidade Ativado
                      </p>
                      <p className="text-blue-700">
                        Uma solicitação recíproca automática será criada: <strong>{getEmpresaNome(empresaDemandada)}</strong> solicitará 
                        clientes de <strong>{getEmpresaNome(empresaSolicitante)}</strong> com os mesmos critérios.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">
                        Solicitação Recíproca Automática
                      </p>
                      <p className="text-sm text-green-700 mb-2">
                        <strong>{getEmpresaNome(empresaDemandada)}</strong> também solicitará 
                        clientes de <strong>{getEmpresaNome(empresaSolicitante)}</strong>
                      </p>
                      <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        📋 Motivo: "Reciprocidade - {motivo}"
                      </div>
                    </div>
                  </div>
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
      case "preview":
        return "Confirmar Solicitação";
      default:
        return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Wishlist</DialogTitle>
          <DialogDescription>
            {getStepTitle()} - Etapa {["empresas", "clientes", "detalhes", "preview"].indexOf(currentStep) + 1} de 4
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