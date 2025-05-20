
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
import { Save } from 'lucide-react';

// Validation schema
const formSchema = z.object({
  empresa_id: z.string().min(1, "Selecione um parceiro"),
  potencial_leads: z.coerce.number().min(0).max(10),
  potencial_investimento: z.coerce.number().min(0).max(10),
  engajamento: z.coerce.number().min(0).max(10),
  alinhamento: z.coerce.number().min(0).max(10),
  tamanho: z.enum(['PP', 'P', 'M', 'G', 'GG']),
  base_clientes: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QuadranteFormProps {
  indicador: IndicadoresParceiro | null;
  onSave: (indicador: Partial<IndicadoresParceiro>) => void;
  readOnly?: boolean;
}

const QuadranteForm: React.FC<QuadranteFormProps> = ({ 
  indicador,
  onSave,
  readOnly = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  
  // Configure form 
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa_id: indicador?.empresa_id || '',
      potencial_leads: indicador?.potencial_leads || 5,
      potencial_investimento: indicador?.potencial_investimento || 5,
      engajamento: indicador?.engajamento || 5,
      alinhamento: indicador?.alinhamento || 5,
      tamanho: indicador?.tamanho || 'M',
      base_clientes: indicador?.base_clientes || 0,
    },
  });
  
  // Update form when indicador changes
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
        empresa_id: '',
        potencial_leads: 5,
        potencial_investimento: 5,
        engajamento: 5,
        alinhamento: 5,
        tamanho: 'M',
        base_clientes: 0,
      });
    }
  }, [indicador, form]);
  
  // Fetch partners
  useEffect(() => {
    const fetchParceiros = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('empresas')
          .select('*')
          .eq('tipo', 'parceiro')
          .order('nome');

        if (error) throw error;
        
        if (data) {
          setParceiros(data as Empresa[]);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os parceiros.',
          variant: 'destructive',
        });
      }
    };

    fetchParceiros();
  }, [toast]);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      
      // Prepare data for submission
      const formData: Partial<IndicadoresParceiro> = {
        ...values,
        data_avaliacao: new Date().toISOString(),
      };
      
      // Add ID if editing existing record
      if (indicador?.id) {
        formData.id = indicador.id;
      }
      
      // Call parent save handler
      onSave(formData);
    } catch (error) {
      console.error('Error saving form:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Empresa (Partner) Selection */}
        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parceiro</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading || readOnly || !!indicador}
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
        
        {/* Tamanho (Size) Selection */}
        <FormField
          control={form.control}
          name="tamanho"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Porte da Empresa</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading || readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o porte" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PP">PP (Startup/Micro)</SelectItem>
                  <SelectItem value="P">P (Pequena)</SelectItem>
                  <SelectItem value="M">M (Média)</SelectItem>
                  <SelectItem value="G">G (Grande)</SelectItem>
                  <SelectItem value="GG">GG (Enterprise)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Tamanho aproximado do parceiro
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Base de Clientes (Client Base) */}
        <FormField
          control={form.control}
          name="base_clientes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Base de Clientes</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  disabled={loading || readOnly}
                  placeholder="Número aproximado de clientes"
                />
              </FormControl>
              <FormDescription>
                Quantidade estimada de clientes do parceiro
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Potencial de Leads */}
        <FormField
          control={form.control}
          name="potencial_leads"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Potencial de Leads (1-10): {value}</FormLabel>
              <FormControl>
                <Slider
                  value={[value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(vals) => onChange(vals[0])}
                  disabled={loading || readOnly}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Capacidade do parceiro de gerar leads qualificados
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Potencial de Investimento */}
        <FormField
          control={form.control}
          name="potencial_investimento"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Potencial de Investimento (1-10): {value}</FormLabel>
              <FormControl>
                <Slider
                  value={[value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(vals) => onChange(vals[0])}
                  disabled={loading || readOnly}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Capacidade do parceiro de investir em projetos conjuntos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Engajamento */}
        <FormField
          control={form.control}
          name="engajamento"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Engajamento (1-10): {value}</FormLabel>
              <FormControl>
                <Slider
                  value={[value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(vals) => onChange(vals[0])}
                  disabled={loading || readOnly}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Nível de engajamento e colaboração do parceiro
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Alinhamento */}
        <FormField
          control={form.control}
          name="alinhamento"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Alinhamento (1-10): {value}</FormLabel>
              <FormControl>
                <Slider
                  value={[value]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(vals) => onChange(vals[0])}
                  disabled={loading || readOnly}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Quanto os objetivos e cultura do parceiro estão alinhados com os nossos
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!readOnly && (
          <Button type="submit" disabled={loading} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
        )}
      </form>
    </Form>
  );
};

export default QuadranteForm;
