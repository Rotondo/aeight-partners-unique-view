import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Empresa, IndicadoresParceiro, TamanhoEmpresa } from "@/types";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save } from "lucide-react";

// Validation schema ajustado para 0-5
const formSchema = z.object({
  empresa_id: z.string().min(1, "Selecione um parceiro"),
  potencial_leads: z.coerce.number().min(0).max(5),
  potencial_investimento: z.coerce.number().min(0).max(5),
  engajamento: z.coerce.number().min(0).max(5),
  alinhamento: z.coerce.number().min(0).max(5),
  tamanho: z.enum(["PP", "P", "M", "G", "GG"]),
  base_clientes: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuadranteFormProps {
  indicador: IndicadoresParceiro | null;
  onSave: (indicador: Partial<IndicadoresParceiro>) => void;
  readOnly?: boolean;
  onParceiroSelect?: (empresa_id: string) => void;
}

const QuadranteForm: React.FC<QuadranteFormProps> = ({
  indicador,
  onSave,
  readOnly = false,
  onParceiroSelect,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);

  // Carrega empresas (apenas parceiros)
  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data } = await supabase
        .from("empresas")
        .select("*")
        .eq("tipo", "parceiro");
      setParceiros(data || []);
    };
    fetchEmpresas();
  }, []);

  // Ordena parceiros alfabeticamente
  const parceirosOrdenados = [...parceiros].sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR")
  );

  // Configure form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa_id: indicador?.empresa_id || "",
      potencial_leads: indicador?.potencial_leads ?? 2.5,
      potencial_investimento: indicador?.potencial_investimento ?? 2.5,
      engajamento: indicador?.engajamento ?? 2.5,
      alinhamento: indicador?.alinhamento ?? 2.5,
      tamanho: indicador?.tamanho || "M",
      base_clientes: indicador?.base_clientes ?? 0,
    },
  });

  // Atualiza form ao trocar de indicador
  useEffect(() => {
    if (indicador) {
      form.reset({
        empresa_id: indicador.empresa_id,
        potencial_leads: indicador.potencial_leads,
        potencial_investimento: indicador.potencial_investimento,
        engajamento: indicador.engajamento,
        alinhamento: indicador.alinhamento,
        tamanho: indicador.tamanho,
        base_clientes: indicador.base_clientes,
      });
    } else {
      form.reset({
        empresa_id: "",
        potencial_leads: 2.5,
        potencial_investimento: 2.5,
        engajamento: 2.5,
        alinhamento: 2.5,
        tamanho: "M",
        base_clientes: 0,
      });
    }
    // eslint-disable-next-line
  }, [indicador]);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await onSave(
        indicador
          ? { ...indicador, ...values }
          : { ...values }
      );
      toast({
        title: "Sucesso",
        description: "Indicador salvo com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o indicador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parceiro</FormLabel>
              <Select
                disabled={readOnly}
                onValueChange={(val) => {
                  field.onChange(val);
                  if (onParceiroSelect) onParceiroSelect(val);
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parceirosOrdenados.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>
                      {empresa.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tamanho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanho</FormLabel>
              <Select
                disabled={readOnly}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PP">PP</SelectItem>
                  <SelectItem value="P">P</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="GG">GG</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="potencial_leads"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potencial de Leads</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                {field.value}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="potencial_investimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potencial de Investimento</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                {field.value}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="engajamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engajamento</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                {field.value}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="alinhamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alinhamento</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[field.value]}
                  onValueChange={([val]) => field.onChange(val)}
                  disabled={readOnly}
                />
              </FormControl>
              <FormDescription>
                {field.value}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="base_clientes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base de Clientes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!readOnly && (
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        )}
      </form>
    </Form>
  );
};

export default QuadranteForm;
