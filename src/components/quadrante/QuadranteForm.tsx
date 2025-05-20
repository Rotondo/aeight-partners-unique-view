
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Empresa, IndicadoresParceiro, TamanhoEmpresa } from '@/types';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// Schema for form validation
const formSchema = z.object({
  id: z.string().optional(),
  empresa_id: z.string().min(1, 'Selecione um parceiro'),
  potencial_leads: z.number().min(0).max(5),
  potencial_investimento: z.number().min(0).max(5),
  engajamento: z.number().min(0).max(5),
  alinhamento: z.number().min(0).max(5),
  tamanho: z.enum(['PP', 'P', 'M', 'G', 'GG']),
});

type FormValues = z.infer<typeof formSchema>;

interface QuadranteFormProps {
  indicador: IndicadoresParceiro | null;
  readOnly?: boolean;
  onSave: (indicador: Partial<IndicadoresParceiro>) => Promise<void>;
}

const QuadranteForm: React.FC<QuadranteFormProps> = ({ indicador, readOnly = false, onSave }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: indicador?.id || undefined,
      empresa_id: indicador?.empresa_id || '',
      potencial_leads: indicador?.potencial_leads || 0,
      potencial_investimento: indicador?.potencial_investimento || 0,
      engajamento: indicador?.engajamento || 0,
      alinhamento: indicador?.alinhamento || 0,
      tamanho: indicador?.tamanho || 'M',
    },
  });

  // Reset form when indicador changes
  useEffect(() => {
    if (indicador) {
      form.reset({
        id: indicador.id,
        empresa_id: indicador.empresa_id,
        potencial_leads: indicador.potencial_leads,
        potencial_investimento: indicador.potencial_investimento,
        engajamento: indicador.engajamento,
        alinhamento: indicador.alinhamento,
        tamanho: indicador.tamanho,
      });
    } else {
      form.reset({
        id: undefined,
        empresa_id: '',
        potencial_leads: 0,
        potencial_investimento: 0,
        engajamento: 0,
        alinhamento: 0,
        tamanho: 'M',
      });
    }
  }, [indicador, form]);

  // Load companies for select
  useEffect(() => {
    const fetchParceiros = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('tipo', 'parceiro')
          .order('nome');

        if (error) throw error;
        
        setParceiros(data as Empresa[]);
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de parceiros.',
          variant: 'destructive',
        });
      }
    };

    fetchParceiros();
  }, [toast]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      await onSave({
        id: data.id,
        empresa_id: data.empresa_id,
        potencial_leads: data.potencial_leads,
        potencial_investimento: data.potencial_investimento,
        engajamento: data.engajamento,
        alinhamento: data.alinhamento,
        tamanho: data.tamanho,
      });

      // If this is a new record, reset the form
      if (!data.id) {
        form.reset({
          id: undefined,
          empresa_id: '',
          potencial_leads: 0,
          potencial_investimento: 0,
          engajamento: 0,
          alinhamento: 0,
          tamanho: 'M',
        });
      }
    } catch (error) {
      console.error('Error saving quadrant data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parceiro</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting || readOnly || !!indicador}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parceiros.map((parceiro) => (
                    <SelectItem key={parceiro.id} value={parceiro.id}>
                      {parceiro.nome}
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
          name="potencial_leads"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potencial de Geração de Leads (0-5)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isSubmitting || readOnly}
                  />
                  <div className="text-center font-medium">{field.value}</div>
                </div>
              </FormControl>
              <FormDescription>
                Capacidade do parceiro em gerar novas oportunidades de negócio.
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
              <FormLabel>Potencial de Investimento (0-5)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isSubmitting || readOnly}
                  />
                  <div className="text-center font-medium">{field.value}</div>
                </div>
              </FormControl>
              <FormDescription>
                Disponibilidade do parceiro para investir em iniciativas conjuntas.
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
              <FormLabel>Engajamento (0-5)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isSubmitting || readOnly}
                  />
                  <div className="text-center font-medium">{field.value}</div>
                </div>
              </FormControl>
              <FormDescription>
                Nível de participação e interação do parceiro.
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
              <FormLabel>Alinhamento Estratégico (0-5)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    disabled={isSubmitting || readOnly}
                  />
                  <div className="text-center font-medium">{field.value}</div>
                </div>
              </FormControl>
              <FormDescription>
                Compatibilidade de visão, valores e objetivos de negócio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tamanho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tamanho da Empresa</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting || readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PP">PP - Micro</SelectItem>
                  <SelectItem value="P">P - Pequena</SelectItem>
                  <SelectItem value="M">M - Média</SelectItem>
                  <SelectItem value="G">G - Grande</SelectItem>
                  <SelectItem value="GG">GG - Muito Grande</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!readOnly && (
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default QuadranteForm;
