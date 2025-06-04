
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Categoria, Empresa, OnePager } from '@/types';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Save } from 'lucide-react';

const formSchema = z.object({
  empresaId: z.string().uuid({ message: "Selecione um parceiro válido" }),
  categoriaId: z.string().uuid({ message: "Selecione uma categoria válida" }),
  nome: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  icp: z.string().optional(),
  oferta: z.string().optional(),
  diferenciais: z.string().optional(),
  cases_sucesso: z.string().optional(),
  big_numbers: z.string().optional(),
  ponto_forte: z.string().optional(),
  ponto_fraco: z.string().optional(),
  contato_nome: z.string().optional(),
  contato_email: z.string().email().optional().or(z.literal('')),
  contato_telefone: z.string().optional(),
  clienteIds: z.array(z.string().uuid()).optional(),
  arquivo: z.instanceof(FileList).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OnePagerFormProps {
  categorias: Categoria[];
  onSuccess?: () => void;
  editingOnePager?: OnePager | null;
}

const OnePagerForm: React.FC<OnePagerFormProps> = ({
  categorias,
  onSuccess,
  editingOnePager,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [clientes, setClientes] = useState<Empresa[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [notaQuadrante, setNotaQuadrante] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresaId: '',
      categoriaId: '',
      nome: '',
      url: '',
      icp: '',
      oferta: '',
      diferenciais: '',
      cases_sucesso: '',
      big_numbers: '',
      ponto_forte: '',
      ponto_fraco: '',
      contato_nome: '',
      contato_email: '',
      contato_telefone: '',
      clienteIds: [],
    },
  });

  // Carrega dados do OnePager para edição
  useEffect(() => {
    if (editingOnePager) {
      form.setValue('empresaId', editingOnePager.empresa_id);
      form.setValue('categoriaId', editingOnePager.categoria_id);
      form.setValue('nome', editingOnePager.nome || '');
      form.setValue('url', editingOnePager.url || '');
      form.setValue('icp', editingOnePager.icp || '');
      form.setValue('oferta', editingOnePager.oferta || '');
      form.setValue('diferenciais', editingOnePager.diferenciais || '');
      form.setValue('cases_sucesso', editingOnePager.cases_sucesso || '');
      form.setValue('big_numbers', editingOnePager.big_numbers || '');
      form.setValue('ponto_forte', editingOnePager.ponto_forte || '');
      form.setValue('ponto_fraco', editingOnePager.ponto_fraco || '');
      form.setValue('contato_nome', editingOnePager.contato_nome || '');
      form.setValue('contato_email', editingOnePager.contato_email || '');
      form.setValue('contato_telefone', editingOnePager.contato_telefone || '');
      setSelectedCategoria(editingOnePager.categoria_id);
      setNotaQuadrante(editingOnePager.nota_quadrante || null);
      
      // Carregar clientes associados
      fetchClientesAssociados(editingOnePager.id);
    }
  }, [editingOnePager, form]);

  // Carrega todos os clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('tipo', 'cliente')
          .eq('status', true)
          .order('nome');
        
        if (error) throw error;
        if (data) setClientes(data as Empresa[]);
      } catch (error) {
        console.error('Error fetching clientes:', error);
      }
    };

    fetchClientes();
  }, []);

  const fetchClientesAssociados = async (onepagerId: string) => {
    try {
      const { data, error } = await supabase
        .from('onepager_clientes')
        .select('cliente_id')
        .eq('onepager_id', onepagerId);
      
      if (error) throw error;
      if (data) {
        const clienteIds = data.map(item => item.cliente_id);
        form.setValue('clienteIds', clienteIds);
      }
    } catch (error) {
      console.error('Error fetching clientes associados:', error);
    }
  };

  // Quando categoria é alterada, carrega parceiros vinculados
  const handleCategoriaChange = async (value: string) => {
    setSelectedCategoria(value);
    form.setValue('categoriaId', value);

    try {
      const { data, error } = await supabase
        .from('empresa_categoria')
        .select('empresa_id')
        .eq('categoria_id', value);

      if (error) throw error;

      if (data && data.length > 0) {
        const empresaIds = data.map((item: any) => item.empresa_id);
        const { data: empresas, error: empresasError } = await supabase
          .from('empresas')
          .select('*')
          .in('id', empresaIds)
          .eq('tipo', 'parceiro')
          .order('nome');
        
        if (empresasError) throw empresasError;
        if (empresas) {
          setParceiros(empresas as Empresa[]);
          if (!editingOnePager && empresas.length > 0) {
            form.setValue('empresaId', empresas[0].id);
          }
        }
      } else {
        setParceiros([]);
        form.setValue('empresaId', '');
      }
    } catch (error) {
      console.error('Error fetching category partners:', error);
      setParceiros([]);
      form.setValue('empresaId', '');
    }
  };

  // Busca nota do quadrante quando empresa é selecionada
  const handleEmpresaChange = async (empresaId: string) => {
    form.setValue('empresaId', empresaId);
    
    try {
      const { data, error } = await supabase
        .from('indicadores_parceiro')
        .select('score_x, score_y')
        .eq('empresa_id', empresaId)
        .maybeSingle();
      
      if (error) throw error;
      if (data && data.score_x !== null && data.score_y !== null) {
        // Calcula nota baseada nos scores (exemplo: média simples)
        const nota = (data.score_x + data.score_y) / 2;
        setNotaQuadrante(Math.round(nota * 100) / 100);
      } else {
        setNotaQuadrante(null);
      }
    } catch (error) {
      console.error('Error fetching quadrante score:', error);
      setNotaQuadrante(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      if (!values.empresaId || !values.categoriaId) {
        toast({
          title: 'Erro',
          description: 'Selecione uma categoria e parceiro antes de enviar.',
          variant: 'destructive',
        });
        setUploading(false);
        return;
      }

      let url_imagem = editingOnePager?.url_imagem || '';
      let arquivo_upload = editingOnePager?.arquivo_upload || '';

      // Upload de arquivo se fornecido
      if (values.arquivo && values.arquivo.length > 0) {
        const file = values.arquivo[0];
        const filePath = `${values.empresaId}_${values.categoriaId}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('onepagers')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('onepagers')
          .getPublicUrl(filePath);
        
        url_imagem = data?.publicUrl || '';
        arquivo_upload = filePath;
      }

      const onepagerData = {
        empresa_id: values.empresaId,
        categoria_id: values.categoriaId,
        nome: values.nome || null,
        url: values.url || null,
        icp: values.icp || null,
        oferta: values.oferta || null,
        diferenciais: values.diferenciais || null,
        cases_sucesso: values.cases_sucesso || null,
        big_numbers: values.big_numbers || null,
        ponto_forte: values.ponto_forte || null,
        ponto_fraco: values.ponto_fraco || null,
        contato_nome: values.contato_nome || null,
        contato_email: values.contato_email || null,
        contato_telefone: values.contato_telefone || null,
        nota_quadrante: notaQuadrante,
        url_imagem: url_imagem || null,
        arquivo_upload: arquivo_upload || null,
        data_upload: new Date().toISOString(),
      };

      let onepagerId: string;

      if (editingOnePager) {
        // Atualiza registro existente
        const { error: updateError } = await supabase
          .from('onepager')
          .update(onepagerData)
          .eq('id', editingOnePager.id);
        
        if (updateError) throw updateError;
        onepagerId = editingOnePager.id;
      } else {
        // Insere novo registro
        const { data: insertData, error: insertError } = await supabase
          .from('onepager')
          .insert(onepagerData)
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        onepagerId = insertData.id;
      }

      // Gerencia relacionamentos com clientes
      if (values.clienteIds && values.clienteIds.length > 0) {
        // Remove relacionamentos existentes
        await supabase
          .from('onepager_clientes')
          .delete()
          .eq('onepager_id', onepagerId);

        // Adiciona novos relacionamentos
        const clienteRelations = values.clienteIds.map(clienteId => ({
          onepager_id: onepagerId,
          cliente_id: clienteId,
        }));

        const { error: clienteError } = await supabase
          .from('onepager_clientes')
          .insert(clienteRelations);
        
        if (clienteError) throw clienteError;
      }

      toast({
        title: 'Sucesso',
        description: editingOnePager ? 'OnePager atualizado com sucesso!' : 'OnePager criado com sucesso!',
      });

      // Limpa o formulário se for criação
      if (!editingOnePager) {
        form.reset();
        setNotaQuadrante(null);
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving onepager:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o OnePager.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editingOnePager ? 'Editar OnePager' : 'Criar OnePager'}
        </CardTitle>
        <CardDescription>
          Preencha as informações estruturadas do parceiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="business">Negócio</TabsTrigger>
                <TabsTrigger value="contact">Contato</TabsTrigger>
                <TabsTrigger value="clients">Clientes</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoriaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select
                        onValueChange={handleCategoriaChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
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
                  name="empresaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parceiro *</FormLabel>
                      <Select
                        onValueChange={handleEmpresaChange}
                        value={field.value}
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
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Parceiro</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome para exibição" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site/URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://www.exemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {notaQuadrante !== null && (
                  <div className="p-4 bg-muted rounded-lg">
                    <label className="text-sm font-medium">Nota no Quadrante</label>
                    <p className="text-lg font-semibold">{notaQuadrante}</p>
                    <p className="text-xs text-muted-foreground">
                      Calculada automaticamente baseada nos indicadores
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="arquivo"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Arquivo OnePager (PDF, PNG ou JPG)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => onChange(e.target.files)}
                          disabled={uploading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <FormField
                  control={form.control}
                  name="icp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ICP (Ideal Customer Profile)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descreva o perfil ideal de cliente..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oferta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oferta</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descreva a oferta principal..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diferenciais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diferenciais</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Principais diferenciais competitivos..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cases_sucesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cases de Sucesso</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Exemplos de cases de sucesso..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="big_numbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Big Numbers</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Números importantes da empresa..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ponto_forte"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto Forte</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Principal ponto forte" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ponto_fraco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ponto Fraco</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Principal ponto de atenção" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <FormField
                  control={form.control}
                  name="contato_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do contato principal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contato_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@exemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contato_telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(11) 99999-9999" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="clients" className="space-y-4">
                <FormField
                  control={form.control}
                  name="clienteIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clientes A&eight que utilizam este parceiro</FormLabel>
                      <div className="space-y-2">
                        {clientes.map((cliente) => (
                          <div key={cliente.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`cliente-${cliente.id}`}
                              checked={field.value?.includes(cliente.id) || false}
                              onChange={(e) => {
                                const currentValues = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentValues, cliente.id]);
                                } else {
                                  field.onChange(currentValues.filter(id => id !== cliente.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <label
                              htmlFor={`cliente-${cliente.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {cliente.nome}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {editingOnePager ? 'Atualizar OnePager' : 'Criar OnePager'}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OnePagerForm;
