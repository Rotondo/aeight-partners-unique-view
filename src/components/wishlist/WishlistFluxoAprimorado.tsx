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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  Calendar as CalendarIcon,
  Users,
  Building2,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useWishlist } from "@/contexts/WishlistContext";
import { useClientesPorEmpresa } from "@/hooks/useClientesPorEmpresa";
import { useCrm } from "@/contexts/CrmContext";
import { useAuth } from "@/hooks/useAuth";
import ClienteMultiSelect, { ClienteSelecionado } from "./ClienteMultiSelect";

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface WishlistFluxoAprimoradoProps {
  isOpen: boolean;
  onClose: () => void;
}

type FluxoStep = 
  | "selecao_marca" 
  | "selecao_parceiro" 
  | "clientes_parceiro" 
  | "reciprocidade_pergunta"
  | "clientes_marca" 
  | "detalhes_reuniao"
  | "preview_final";

const WishlistFluxoAprimorado: React.FC<WishlistFluxoAprimoradoProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWishlistItem, fetchWishlistItems } = useWishlist();
  const { clientes, loading: loadingClientes, fetchClientesPorEmpresa } = useClientesPorEmpresa();
  const { createAcaoCrm } = useCrm();
  const { user } = useAuth();

  // Estados do fluxo
  const [currentStep, setCurrentStep] = useState<FluxoStep>("selecao_marca");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dados das empresas
  const [marcasIntragrupo, setMarcasIntragrupo] = useState<EmpresaOption[]>([]);
  const [parceiros, setParceiros] = useState<EmpresaOption[]>([]);
  const [marcaSelecionada, setMarcaSelecionada] = useState<string>("");
  const [parceiroSelecionado, setParceiroSelecionado] = useState<string>("");

  // Seleção de clientes
  const [clientesParceiro, setClientesParceiro] = useState<ClienteSelecionado[]>([]);
  const [clientesMarca, setClientesMarca] = useState<ClienteSelecionado[]>([]);
  const [desejaReciprocidade, setDesejaReciprocidade] = useState<boolean>(false);

  // Detalhes da reunião
  const [dataReuniao, setDataReuniao] = useState<Date>(new Date());
  const [observacoesReuniao, setObservacoesReuniao] = useState<string>("");

  // Estados para clientes da marca (reciprocidade)
  const [clientesMarcaDisponiveis, setClientesMarcaDisponiveis] = useState<any[]>([]);
  const [loadingClientesMarca, setLoadingClientesMarca] = useState(false);

  // Carregar empresas quando modal abre
  useEffect(() => {
    if (!isOpen) return;

    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("empresas")
          .select("id, nome, tipo")
          .eq("status", true)
          .order("nome");

        if (error) throw error;

        const marcas = data?.filter(e => e.tipo === "intragrupo") || [];
        const parceirosData = data?.filter(e => e.tipo === "parceiro") || [];

        setMarcasIntragrupo(marcas);
        setParceiros(parceirosData);
      } catch (err) {
        console.error("Erro ao carregar empresas:", err);
        setError("Não foi possível carregar as empresas");
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [isOpen]);

  // Carregar clientes do parceiro quando selecionado
  useEffect(() => {
    if (parceiroSelecionado && currentStep === "clientes_parceiro") {
      fetchClientesPorEmpresa(parceiroSelecionado);
    }
  }, [parceiroSelecionado, currentStep, fetchClientesPorEmpresa]);

  // Carregar clientes da marca para reciprocidade
  useEffect(() => {
    if (currentStep === "clientes_marca" && marcaSelecionada) {
      const fetchClientesMarca = async () => {
        setLoadingClientesMarca(true);
        try {
          const { data, error } = await supabase
            .from("empresa_clientes")
            .select(`
              empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome)
            `)
            .eq("empresa_proprietaria_id", marcaSelecionada)
            .eq("status", true);

          if (error) throw error;

          setClientesMarcaDisponiveis(data || []);
        } catch (err) {
          console.error("Erro ao carregar clientes da marca:", err);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os clientes da marca",
            variant: "destructive",
          });
        } finally {
          setLoadingClientesMarca(false);
        }
      };

      fetchClientesMarca();
    }
  }, [currentStep, marcaSelecionada]);

  // Reset do formulário
  const resetForm = () => {
    setCurrentStep("selecao_marca");
    setMarcaSelecionada("");
    setParceiroSelecionado("");
    setClientesParceiro([]);
    setClientesMarca([]);
    setDesejaReciprocidade(false);
    setDataReuniao(new Date());
    setObservacoesReuniao("");
    setError(null);
  };

  // Navegação entre steps
  const nextStep = () => {
    const stepOrder: FluxoStep[] = [
      "selecao_marca",
      "selecao_parceiro", 
      "clientes_parceiro",
      "reciprocidade_pergunta",
      ...(desejaReciprocidade ? ["clientes_marca" as FluxoStep] : []),
      "detalhes_reuniao",
      "preview_final"
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const stepOrder: FluxoStep[] = [
      "selecao_marca",
      "selecao_parceiro", 
      "clientes_parceiro",
      "reciprocidade_pergunta",
      ...(desejaReciprocidade ? ["clientes_marca" as FluxoStep] : []),
      "detalhes_reuniao",
      "preview_final"
    ];
    
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Validações por step
  const canProceed = () => {
    switch (currentStep) {
      case "selecao_marca":
        return marcaSelecionada !== "";
      case "selecao_parceiro":
        return parceiroSelecionado !== "";
      case "clientes_parceiro":
        return clientesParceiro.length > 0;
      case "reciprocidade_pergunta":
        return true;
      case "clientes_marca":
        return clientesMarca.length > 0;
      case "detalhes_reuniao":
        return dataReuniao !== null;
      case "preview_final":
        return true;
      default:
        return false;
    }
  };

  // Finalizar processo
  const finalizarProcesso = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Criar wishlist items
      const solicitacoes = clientesParceiro.map(cliente => ({
        empresa_interessada_id: marcaSelecionada,
        empresa_desejada_id: cliente.id,
        empresa_proprietaria_id: parceiroSelecionado,
        prioridade: cliente.prioridade,
        motivo: `Solicitação via fluxo aprimorado - Reunião ${format(dataReuniao, 'dd/MM/yyyy', { locale: pt })}`,
        observacoes: observacoesReuniao,
        status: "pendente" as const,
        data_solicitacao: new Date().toISOString(),
      }));

      const solicitacoesReciprocas = desejaReciprocidade 
        ? clientesMarca.map(cliente => ({
            empresa_interessada_id: parceiroSelecionado,
            empresa_desejada_id: cliente.id,
            empresa_proprietaria_id: marcaSelecionada,
            prioridade: cliente.prioridade,
            motivo: `Reciprocidade - Reunião ${format(dataReuniao, 'dd/MM/yyyy', { locale: pt })}`,
            observacoes: observacoesReuniao,
            status: "pendente" as const,
            data_solicitacao: new Date().toISOString(),
          }))
        : [];

      // Inserir todas as solicitações
      for (const solicitacao of [...solicitacoes, ...solicitacoesReciprocas]) {
        await addWishlistItem?.(solicitacao);
      }

      // 2. Criar registro no CRM Diário
      const marcaNome = marcasIntragrupo.find(m => m.id === marcaSelecionada)?.nome || "";
      const parceiroNome = parceiros.find(p => p.id === parceiroSelecionado)?.nome || "";
      
      let conteudoCrm = `📅 REUNIÃO DE TROCA DE INDICAÇÕES\n`;
      conteudoCrm += `📍 Data: ${format(dataReuniao, 'dd/MM/yyyy', { locale: pt })}\n`;
      conteudoCrm += `🏢 Entre: ${marcaNome} e ${parceiroNome}\n\n`;
      
      conteudoCrm += `🎯 CLIENTES SOLICITADOS POR ${marcaNome}:\n`;
      clientesParceiro.forEach((cliente, index) => {
        conteudoCrm += `${index + 1}. ${cliente.nome} (Prioridade: ${'⭐'.repeat(cliente.prioridade)})\n`;
      });

      if (desejaReciprocidade && clientesMarca.length > 0) {
        conteudoCrm += `\n🎯 CLIENTES SOLICITADOS POR ${parceiroNome}:\n`;
        clientesMarca.forEach((cliente, index) => {
          conteudoCrm += `${index + 1}. ${cliente.nome} (Prioridade: ${'⭐'.repeat(cliente.prioridade)})\n`;
        });
      }

      if (observacoesReuniao) {
        conteudoCrm += `\n📝 OBSERVAÇÕES:\n${observacoesReuniao}\n`;
      }

      conteudoCrm += `\n📊 RESUMO:\n`;
      conteudoCrm += `• Total de indicações solicitadas: ${clientesParceiro.length + clientesMarca.length}\n`;
      conteudoCrm += `• Reciprocidade: ${desejaReciprocidade ? 'Sim' : 'Não'}\n`;
      conteudoCrm += `• Status: Solicitações criadas e pendentes de aprovação\n`;

      // Determinar partner_id (sempre o parceiro externo)
      const partnerId = parceiroSelecionado;

      const crmAction = {
        description: `Reunião do dia ${format(dataReuniao, 'dd/MM/yyyy', { locale: pt })}`,
        content: conteudoCrm,
        communication_method: "reuniao_meet" as const,
        status: "concluida" as const,
        partner_id: partnerId,
        metadata: {
          wishlist_fluxo_aprimorado: true,
          marca_selecionada_id: marcaSelecionada,
          parceiro_selecionado_id: parceiroSelecionado,
          data_reuniao: dataReuniao.toISOString(),
          reciprocidade: desejaReciprocidade,
          clientes_solicitados: clientesParceiro.map(c => ({ 
            id: c.id, 
            nome: c.nome, 
            prioridade: c.prioridade 
          })),
          clientes_reciprocidade: desejaReciprocidade 
            ? clientesMarca.map(c => ({ 
                id: c.id, 
                nome: c.nome, 
                prioridade: c.prioridade 
              }))
            : [],
          total_solicitacoes: clientesParceiro.length + clientesMarca.length,
        }
      };

      await createAcaoCrm(crmAction);

      // 3. Feedback e fechamento
      await fetchWishlistItems?.();
      
      toast({
        title: "🎉 Processo Concluído!",
        description: `${clientesParceiro.length + clientesMarca.length} solicitações criadas e registradas no CRM`,
      });

      onClose();
      resetForm();

    } catch (error) {
      console.error("Erro ao finalizar processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o processo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Renderização dos steps
  const renderStepContent = () => {
    switch (currentStep) {
      case "selecao_marca":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Selecione sua Marca do Intragrupo</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Escolha qual das suas marcas do intragrupo fará a solicitação de clientes.
            </p>
            <Select value={marcaSelecionada} onValueChange={setMarcaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma marca do intragrupo" />
              </SelectTrigger>
              <SelectContent>
                {marcasIntragrupo.map((marca) => (
                  <SelectItem key={marca.id} value={marca.id}>
                    {marca.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "selecao_parceiro":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Selecione o Parceiro</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Escolha o parceiro com quem deseja fazer a troca de indicações.
            </p>
            <Select value={parceiroSelecionado} onValueChange={setParceiroSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um parceiro" />
              </SelectTrigger>
              <SelectContent>
                {parceiros.map((parceiro) => (
                  <SelectItem key={parceiro.id} value={parceiro.id}>
                    {parceiro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "clientes_parceiro":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Clientes do Parceiro</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione quais clientes do parceiro você gostaria de receber como indicação.
            </p>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {loadingClientes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Carregando clientes...</span>
                </div>
              ) : (
                <ClienteMultiSelect
                  clientes={clientes}
                  clientesSelecionados={clientesParceiro}
                  onClientesSelecionadosChange={setClientesParceiro}
                />
              )}
            </div>
            {clientesParceiro.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {clientesParceiro.length} cliente{clientesParceiro.length > 1 ? 's' : ''} selecionado{clientesParceiro.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        );

      case "reciprocidade_pergunta":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRight className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Deseja fazer o contrário?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              O parceiro também pode solicitar clientes da sua marca. Deseja habilitar esta opção?
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reciprocidade"
                checked={desejaReciprocidade}
                onCheckedChange={(checked) => {
                  if (typeof checked === 'boolean') {
                    setDesejaReciprocidade(checked);
                  }
                }}
              />
              <label
                htmlFor="reciprocidade"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sim, permitir que o parceiro também selecione nossos clientes
              </label>
            </div>
            {desejaReciprocidade && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  ✓ Na próxima etapa, você poderá selecionar quais clientes da sua marca o parceiro pode solicitar.
                </p>
              </div>
            )}
          </div>
        );

      case "clientes_marca":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Clientes da Sua Marca</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Selecione quais clientes da sua marca o parceiro pode solicitar como indicação.
            </p>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              {loadingClientesMarca ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Carregando clientes...</span>
                </div>
              ) : (
                <ClienteMultiSelect
                  clientes={clientesMarcaDisponiveis.map(item => ({
                    id: item.empresa_cliente?.id || '',
                    nome: item.empresa_cliente?.nome || ''
                  }))}
                  clientesSelecionados={clientesMarca}
                  onClientesSelecionadosChange={setClientesMarca}
                />
              )}
            </div>
            {clientesMarca.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {clientesMarca.length} cliente{clientesMarca.length > 1 ? 's' : ''} disponibilizado{clientesMarca.length > 1 ? 's' : ''} para o parceiro
              </div>
            )}
          </div>
        );

      case "detalhes_reuniao":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Detalhes da Reunião</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Data da Reunião</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataReuniao ? format(dataReuniao, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataReuniao}
                      onSelect={(date) => date && setDataReuniao(date)}
                      initialFocus
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium">Observações (opcional)</label>
                <Textarea
                  value={observacoesReuniao}
                  onChange={(e) => setObservacoesReuniao(e.target.value)}
                  placeholder="Observações sobre a reunião ou acordos específicos..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case "preview_final":
        const marcaNome = marcasIntragrupo.find(m => m.id === marcaSelecionada)?.nome || "";
        const parceiroNome = parceiros.find(p => p.id === parceiroSelecionado)?.nome || "";
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Resumo Final</h3>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">📅 Reunião</h4>
                <p className="text-sm">Data: {format(dataReuniao, "dd/MM/yyyy", { locale: pt })}</p>
                <p className="text-sm">Entre: {marcaNome} e {parceiroNome}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">🎯 Clientes Solicitados por {marcaNome}</h4>
                <div className="space-y-1">
                  {clientesParceiro.map((cliente, index) => (
                    <div key={cliente.id} className="flex justify-between text-sm">
                      <span>{index + 1}. {cliente.nome}</span>
                      <span>{'⭐'.repeat(cliente.prioridade)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {desejaReciprocidade && clientesMarca.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">🎯 Clientes Solicitados por {parceiroNome}</h4>
                  <div className="space-y-1">
                    {clientesMarca.map((cliente, index) => (
                      <div key={cliente.id} className="flex justify-between text-sm">
                        <span>{index + 1}. {cliente.nome}</span>
                        <span>{'⭐'.repeat(cliente.prioridade)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {observacoesReuniao && (
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium mb-2">📝 Observações</h4>
                  <p className="text-sm">{observacoesReuniao}</p>
                </div>
              )}

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">📊 Resumo</h4>
                <div className="text-sm space-y-1">
                  <p>• Total de solicitações: {clientesParceiro.length + clientesMarca.length}</p>
                  <p>• Reciprocidade: {desejaReciprocidade ? 'Sim' : 'Não'}</p>
                  <p>• Registro no CRM: Será criado automaticamente</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Título do step atual
  const getStepTitle = () => {
    switch (currentStep) {
      case "selecao_marca":
        return "Seleção de Marca";
      case "selecao_parceiro":
        return "Seleção de Parceiro";
      case "clientes_parceiro":
        return "Clientes do Parceiro";
      case "reciprocidade_pergunta":
        return "Reciprocidade";
      case "clientes_marca":
        return "Clientes da Marca";
      case "detalhes_reuniao":
        return "Detalhes da Reunião";
      case "preview_final":
        return "Confirmação Final";
      default:
        return "";
    }
  };

  // Indicador de progresso
  const totalSteps = desejaReciprocidade ? 7 : 6;
  const currentStepNumber = {
    "selecao_marca": 1,
    "selecao_parceiro": 2,
    "clientes_parceiro": 3,
    "reciprocidade_pergunta": 4,
    "clientes_marca": 5,
    "detalhes_reuniao": desejaReciprocidade ? 6 : 5,
    "preview_final": desejaReciprocidade ? 7 : 6,
  }[currentStep] || 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Fluxo Aprimorado de Wishlist</span>
            <Badge variant="secondary">
              {currentStepNumber} de {totalSteps}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {getStepTitle()} - Processo otimizado de troca de indicações
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-1">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === "selecao_marca" || loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            
            {currentStep === "preview_final" ? (
              <Button onClick={finalizarProcesso} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Finalizar
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed() || loading}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistFluxoAprimorado;