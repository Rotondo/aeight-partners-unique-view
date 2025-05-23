import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Oportunidade, StatusOportunidade } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
  valor: z.string().optional(),
  status: z.enum([StatusOportunidade.EM_CONTATO, StatusOportunidade.NEGOCIANDO, StatusOportunidade.GANHO, StatusOportunidade.PERDIDO]),
  data_indicacao: z.date(),
  data_fechamento: z.date().optional(),
  motivo_perda: z.string().optional(),
  usuario_recebe_id: z.string().optional(),
  observacoes: z.string().optional(),
});

interface OportunidadesFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  oportunidade?: Oportunidade;
  isLoading: boolean;
}

const OportunidadesForm: React.FC<OportunidadesFormProps> = ({
  onSubmit,
  oportunidade,
  isLoading
}) => {
  const [empresas, setEmpresas] = useState<{ id: string; nome: string; tipo: string; status: boolean }[]>([]);
  const [contatos, setContatos] = useState<{ id: string; nome: string }[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_lead: oportunidade?.nome_lead || "",
      empresa_origem_id: oportunidade?.empresa_origem_id || "",
      empresa_destino_id: oportunidade?.empresa_destino_id || "",
      contato_id: oportunidade?.contato_id || "",
      valor: oportunidade?.valor || "",
      status: oportunidade?.status || StatusOportunidade.EM_CONTATO,
      data_indicacao: oportunidade?.data_indicacao ? new Date(oportunidade.data_indicacao) : new Date(),
      data_fechamento: oportunidade?.data_fechamento ? new Date(oportunidade.data_fechamento) : undefined,
      motivo_perda: oportunidade?.motivo_perda || "",
      usuario_recebe_id: oportunidade?.usuario_recebe_id || "",
      observacoes: oportunidade?.observacoes || "",
    },
  });

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
        console.error('Erro ao buscar empresas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as empresas.",
          variant: "destructive",
        });
      }
    };

    const fetchContatos = async () => {
      try {
        const { data, error } = await supabase
          .from('contatos')
          .select('id, nome')
          .order('nome');

        if (error) throw error;

        setContatos(data || []);
      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os contatos.",
          variant: "destructive",
        });
      }
    };

    fetchEmpresas();
    fetchContatos();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nome_lead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Lead</FormLabel>
              <FormControl>
                <Input placeholder="Nome do lead" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="empresa_origem_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa de Origem</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa de origem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="empresa_destino_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa de Destino</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa de destino" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {empresas.map((empresa) => (
                    <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contato_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contato" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {contatos.map((contato) => (
                    <SelectItem key={contato.id} value={contato.id}>{contato.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input placeholder="Valor da oportunidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={StatusOportunidade.EM_CONTATO}>Em Contato</SelectItem>
                  <SelectItem value={StatusOportunidade.NEGOCIANDO}>Negociando</SelectItem>
                  <SelectItem value={StatusOportunidade.GANHO}>Ganho</SelectItem>
                  <SelectItem value={StatusOportunidade.PERDIDO}>Perdido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_indicacao"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Indicação</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_fechamento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Fechamento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    locale={ptBR}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motivo_perda"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Perda</FormLabel>
              <FormControl>
                <Input placeholder="Motivo da perda" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre a oportunidade"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};

export default OportunidadesForm;
