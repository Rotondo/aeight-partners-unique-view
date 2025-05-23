import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Oportunidade, StatusOportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

// Ajuste: array de status válidos
const statusOptions: StatusOportunidade[] = [
  "em_contato",
  "negociando",
  "ganho",
  "perdido",
  "Contato"
];

const formSchema = z.object({
  nome_lead: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }).max(50, {
    message: "Nome não pode ter mais de 50 caracteres.",
  }),
  empresa_origem_id: z.string().min(1, {
    message: "Selecione a empresa de origem.",
  }),
  empresa_destino_id: z.string().min(1, {
    message: "Selecione a empresa de destino.",
  }),
  contato_id: z.string().optional(),
  valor: z.union([z.string(), z.number()]).optional(),
  status: z.enum(["em_contato", "negociando", "ganho", "perdido", "Contato"]),
  data_indicacao: z.date(),
  data_fechamento: z.date().optional(),
  motivo_perda: z.string().optional(),
  usuario_recebe_id: z.string().optional(),
  observacoes: z.string().optional(),
});

interface OportunidadesFormProps {
  onSubmit?: (data: z.infer<typeof formSchema>) => void; // usado caso for inline
  onClose: () => void;
  oportunidade?: Oportunidade;
  isLoading?: boolean;
  oportunidadeId?: string | null; // caso use id para buscar
}

const OportunidadesForm: React.FC<OportunidadesFormProps> = ({
  onSubmit,
  onClose,
  oportunidade,
  isLoading = false,
  oportunidadeId,
}) => {
  const [empresas, setEmpresas] = useState<{ id: string; nome: string; tipo: string; status: boolean }[]>([]);
  const [contatos, setContatos] = useState<{ id: string; nome: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Oportunidade | null>(oportunidade || null);
  const { toast } = useToast();

  // Fetch oportunidade se vier apenas o id
  useEffect(() => {
    if (!oportunidade && oportunidadeId) {
      (async () => {
        const { data, error } = await supabase
          .from('oportunidades')
          .select('*')
          .eq('id', oportunidadeId)
          .single();
        if (error) {
          toast({ title: "Erro", description: "Erro ao buscar oportunidade.", variant: "destructive" });
        } else if (data) {
          setFormData(data as Oportunidade);
        }
      })();
    } else if (oportunidade) {
      setFormData(oportunidade);
    }
  }, [oportunidade, oportunidadeId]);

  // Carregar empresas
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome, tipo, status')
          .eq('status', true)
          .order('nome');

        if (error) throw error;

        setEmpresas(data || []);
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao buscar empresas.", variant: "destructive" });
      }
    };
    fetchEmpresas();
  }, []);

  // Carregar contatos se origem for selecionada
  useEffect(() => {
    if (!watchEmpresaOrigemId) return;
    const fetchContatos = async () => {
      try {
        const { data, error } = await supabase
          .from('contatos')
          .select('id, nome')
          .eq('empresa_id', watchEmpresaOrigemId);

        if (error) throw error;
        setContatos(data || []);
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao buscar contatos.", variant: "destructive" });
      }
    };
    fetchContatos();
  }, [formData?.empresa_origem_id]);

  // Formulário RHF
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formData
      ? {
          ...formData,
          valor: formData.valor ? String(formData.valor) : "",
          data_indicacao: formData.data_indicacao
            ? new Date(formData.data_indicacao)
            : new Date(),
          data_fechamento: formData.data_fechamento
            ? new Date(formData.data_fechamento)
            : undefined,
        }
      : {
          nome_lead: "",
          empresa_origem_id: "",
          empresa_destino_id: "",
          contato_id: "",
          valor: "",
          status: "em_contato",
          data_indicacao: new Date(),
          data_fechamento: undefined,
          motivo_perda: "",
          usuario_recebe_id: "",
          observacoes: "",
        },
  });

  // Watch empresa_origem para atualizar contatos dinamicamente
  const watchEmpresaOrigemId = watch("empresa_origem_id");
  useEffect(() => {
    if (watchEmpresaOrigemId) {
      setValue("contato_id", "");
      setContatos([]);
      // fetch contatos já é feito acima
    }
  }, [watchEmpresaOrigemId, setValue]);

  // Ao submeter
  const submitHandler = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Chama onSubmit se fornecido (modo inline), senão salva no supabase
      if (onSubmit) {
        await onSubmit(values);
        onClose();
        return;
      }

      if (formData && formData.id) {
        // update
        const { error } = await supabase
          .from('oportunidades')
          .update({
            ...values,
            valor: values.valor ? Number(values.valor) : null,
            data_indicacao: values.data_indicacao ? values.data_indicacao.toISOString() : null,
            data_fechamento: values.data_fechamento ? values.data_fechamento.toISOString() : null,
          })
          .eq('id', formData.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Oportunidade atualizada com sucesso." });
      } else {
        // create
        const { error } = await supabase
          .from('oportunidades')
          .insert({
            ...values,
            valor: values.valor ? Number(values.valor) : null,
            data_indicacao: values.data_indicacao ? values.data_indicacao.toISOString() : null,
            data_fechamento: values.data_fechamento ? values.data_fechamento.toISOString() : null,
          });

        if (error) throw error;
        toast({ title: "Sucesso", description: "Oportunidade criada com sucesso." });
      }
      onClose();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao salvar oportunidade.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <h2 className="text-xl font-bold">
        {formData?.id ? "Editar Oportunidade" : "Nova Oportunidade"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome do Lead */}
        <div className="space-y-2">
          <label className="font-medium">
            Nome da Oportunidade <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("nome_lead")}
            placeholder="Nome do lead"
            className={cn(errors.nome_lead && "border-red-500")}
            disabled={isLoading || isSubmitting}
          />
          {errors.nome_lead && (
            <span className="text-red-500 text-sm">{errors.nome_lead.message}</span>
          )}
        </div>

        {/* Empresa Origem */}
        <div className="space-y-2">
          <label className="font-medium">
            Empresa Origem <span className="text-red-500">*</span>
          </label>
          <Select
            value={watch("empresa_origem_id")}
            onValueChange={value => setValue("empresa_origem_id", value)}
            disabled={isLoading || isSubmitting}
          >
            <SelectTrigger className={cn(errors.empresa_origem_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa de origem" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.empresa_origem_id && (
            <span className="text-red-500 text-sm">{errors.empresa_origem_id.message}</span>
          )}
        </div>

        {/* Empresa Destino */}
        <div className="space-y-2">
          <label className="font-medium">
            Empresa Destino <span className="text-red-500">*</span>
          </label>
          <Select
            value={watch("empresa_destino_id")}
            onValueChange={value => setValue("empresa_destino_id", value)}
            disabled={isLoading || isSubmitting}
          >
            <SelectTrigger className={cn(errors.empresa_destino_id && "border-red-500")}>
              <SelectValue placeholder="Selecione a empresa de destino" />
            </SelectTrigger>
            <SelectContent>
              {empresas.map(e => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.empresa_destino_id && (
            <span className="text-red-500 text-sm">{errors.empresa_destino_id.message}</span>
          )}
        </div>

        {/* Contato (opcional) */}
        <div className="space-y-2">
          <label className="font-medium">Contato (opcional)</label>
          <Select
            value={watch("contato_id") || ""}
            onValueChange={value => setValue("contato_id", value)}
            disabled={isLoading || isSubmitting || !watch("empresa_origem_id")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um contato" />
            </SelectTrigger>
            <SelectContent>
              {contatos.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Valor (opcional) */}
        <div className="space-y-2">
          <label className="font-medium">Valor (R$)</label>
          <Input
            {...register("valor")}
            placeholder="Valor da oportunidade"
            disabled={isLoading || isSubmitting}
          />
        </div>

        {/* Status (sempre editável) */}
        <div className="space-y-2">
          <label className="font-medium">
            Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={watch("status")}
            onValueChange={value => setValue("status", value as StatusOportunidade)}
            disabled={isLoading || isSubmitting}
          >
            <SelectTrigger className={cn(errors.status && "border-red-500")}>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ").replace(/^./, s => s.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <span className="text-red-500 text-sm">{errors.status.message}</span>
          )}
        </div>

        {/* Data de indicação */}
        <div className="space-y-2">
          <label className="font-medium">
            Data de Indicação <span className="text-red-500">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  errors.data_indicacao && "border-red-500",
                  !watch("data_indicacao") && "text-muted-foreground"
                )}
                disabled={isLoading || isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch("data_indicacao")
                  ? format(watch("data_indicacao"), "dd/MM/yyyy", { locale: ptBR })
                  : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("data_indicacao")}
                onSelect={(date) => date && setValue("data_indicacao", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.data_indicacao && (
            <span className="text-red-500 text-sm">{errors.data_indicacao.message}</span>
          )}
        </div>

        {/* Data de fechamento (opcional) */}
        <div className="space-y-2">
          <label className="font-medium">Data de Fechamento</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  errors.data_fechamento && "border-red-500",
                  !watch("data_fechamento") && "text-muted-foreground"
                )}
                disabled={isLoading || isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {watch("data_fechamento")
                  ? format(watch("data_fechamento"), "dd/MM/yyyy", { locale: ptBR })
                  : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("data_fechamento")}
                onSelect={(date) => setValue("data_fechamento", date || undefined)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.data_fechamento && (
            <span className="text-red-500 text-sm">{errors.data_fechamento.message}</span>
          )}
        </div>

        {/* Motivo da perda (aparece se status = perdido) */}
        {watch("status") === "perdido" && (
          <div className="space-y-2 md:col-span-2">
            <label className="font-medium">
              Motivo da Perda <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register("motivo_perda")}
              placeholder="Descreva o motivo da perda"
              disabled={isLoading || isSubmitting}
            />
            {errors.motivo_perda && (
              <span className="text-red-500 text-sm">{errors.motivo_perda.message}</span>
            )}
          </div>
        )}

        {/* Observações */}
        <div className="space-y-2 md:col-span-2">
          <label className="font-medium">Observações</label>
          <Textarea
            {...register("observacoes")}
            placeholder="Observações gerais"
            disabled={isLoading || isSubmitting}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : formData?.id ? "Atualizar" : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

export { OportunidadesForm };
