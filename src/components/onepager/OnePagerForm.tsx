import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Categoria, Empresa, OnePager } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { shouldCreateAutomaticClientRelationship } from '@/utils/companyClassification';
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
import { Loader2, Upload, Save, PlusCircle } from 'lucide-react';

// Schema para novo cliente apenas com nome obrigatório (fácil de expandir)
const newClientSchema = z.object({
  nome: z.string().min(2, { message: "Nome do cliente é obrigatório" }),
});

const formSchema = z.object({
  empresaId: z.string().uuid({ message: "Selecione um parceiro válido" }),
  categoriaId: z.string().uuid({ message: "Selecione uma categoria válida" }),
  nome: z.string().optional(),
  url: z.string().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: "URL deve estar em formato válido"
  }).optional(),
  icp: z.string().optional(),
  oferta: z.string().optional(),
  diferenciais: z.string().optional(),
  cases_sucesso: z.string().optional(),
  big_numbers: z.string().optional(),
  ponto_forte: z.string().optional(),
  ponto_fraco: z.string().optional(),
  contato_nome: z.string().optional(),
  contato_email: z.string().refine((val) => !val || z.string().email().safeParse(val).success, {
    message: "Email deve estar em formato válido"
  }).optional(),
  contato_telefone: z.string().optional(),
  clienteIds: z.array(z.string().uuid()).optional(),
  arquivo: z.instanceof(FileList).optional(),
  novosClientes: z.array(newClientSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type NewClient = z.infer<typeof newClientSchema>;

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

  // Estado local para novos clientes
  const [novosClientes, setNovosClientes] = useState<NewClient[]>([]);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [adicionandoCliente, setAdicionandoCliente] = useState(false);

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
      novosClientes: [],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const empresaIds = data.map((item: { empresa_id: string }) => item.empresa_id);
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

  // Handler para adicionar novo cliente na lista local
  const handleAddNovoCliente = () => {
    const nome = novoClienteNome.trim();
    if (!nome) return;
    // Validação básica: não duplicar na lista local nem na lista de clientes existentes
    const existeJa = clientes.some(c => c.nome.toLowerCase() === nome.toLowerCase())
      || novosClientes.some(c => c.nome.toLowerCase() === nome.toLowerCase());
    if (existeJa) {
      toast({
        title: 'Cliente já existe',
        description: 'Este nome já está na base ou na lista de novos clientes.',
        variant: 'destructive',
      });
      setNovoClienteNome('');
      return;
    }
    setNovosClientes([...novosClientes, { nome }]);
    setNovoClienteNome('');
  };

  // Remover cliente da lista local de novos clientes
  const handleRemoveNovoCliente = (nome: string) => {
    setNovosClientes(novosClientes.filter(c => c.nome !== nome));
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

      // Gerencia criação de novos clientes (em empresas) e correlaciona com parceiro (empresa_clientes)
      // Using let because we need to modify the array by pushing new client IDs
      // eslint-disable-next-line prefer-const
      let finalClienteIds: string[] = values.clienteIds ? [...values.clienteIds] : [];

      if (novosClientes.length > 0) {
        for (const novo of novosClientes) {
          // Verifica se já existe cliente com o mesmo nome (case insensitive)
          const exists = clientes.find(
            c => c.nome.trim().toLowerCase() === novo.nome.trim().toLowerCase()
          );
          let clienteId: string;
          if (exists) {
            clienteId = exists.id;
          } else {
            // Cria novo cliente na tabela empresas
            const { data: inserted, error: insertError } = await supabase
              .from('empresas')
              .insert({
                nome: novo.nome,
                tipo: 'cliente',
                status: true,
              })
              .select('id')
              .single();
            if (insertError) throw insertError;
            clienteId = inserted.id;
          }
          finalClienteIds.push(clienteId);

          // Cria relação empresa_clientes (parceiro-cliente), se não existir
          // Only create automatic relationships for valid partner companies
          if (values.empresaId && clienteId) {
            // Get company type to validate relationship creation
            const { data: empresaData, error: empresaError } = await supabase
              .from('empresas')
              .select('tipo')
              .eq('id', values.empresaId)
              .single();
            
            if (empresaError) throw empresaError;
            
            // Only create relationship if it's a valid partner company
            if (empresaData && shouldCreateAutomaticClientRelationship(empresaData.tipo, values.empresaId)) {
              const { data: relExists, error } = await supabase
                .from('empresa_clientes')
                .select('id')
                .eq('empresa_proprietaria_id', values.empresaId)
                .eq('empresa_cliente_id', clienteId)
                .maybeSingle();
              if (!relExists) {
                await supabase.from('empresa_clientes').insert({
                  empresa_proprietaria_id: values.empresaId,
                  empresa_cliente_id: clienteId,
                  status: true,
                  data_relacionamento: new Date().toISOString(),
                  observacoes: 'Vínculo criado via OnePager',
                });
              }
            }
          }
        }
      }

      // Para cada cliente selecionado, também garantir vínculo empresa_clientes
      // Only create relationships for valid partner companies
      if (values.empresaId && finalClienteIds.length > 0) {
        // Get company type to validate relationship creation
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('tipo')
          .eq('id', values.empresaId)
          .single();
        
        if (empresaError) throw empresaError;
        
        // Only create relationships if it's a valid partner company
        if (empresaData && shouldCreateAutomaticClientRelationship(empresaData.tipo, values.empresaId)) {
          for (const clienteId of finalClienteIds) {
            const { data: relExists, error } = await supabase
              .from('empresa_clientes')
              .select('id')
              .eq('empresa_proprietaria_id', values.empresaId)
              .eq('empresa_cliente_id', clienteId)
              .maybeSingle();
            if (!relExists) {
              await supabase.from('empresa_clientes').insert({
                empresa_proprietaria_id: values.empresaId,
                empresa_cliente_id: clienteId,
                status: true,
                data_relacionamento: new Date().toISOString(),
                observacoes: 'Vínculo criado via OnePager',
              });
            }
          }
        }
      }

      // Remove relacionamentos antigos
      await supabase
        .from('onepager_clientes')
        .delete()
        .eq('onepager_id', onepagerId);

      // Adiciona novos relacionamentos
      if (finalClienteIds.length > 0) {
        const clienteRelations = finalClienteIds.map(clienteId => ({
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
        setNovosClientes([]);
        setNovoClienteNome('');
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
                      <FormLabel>Arquivo OnePager (PDF, PNG ou JPG) - Opcional</FormLabel>
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
                      <FormLabel>Clientes Aeight que utilizam este parceiro</FormLabel>
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

                {/* Adição de novo cliente inline */}
                <div className="mt-6">
                  <FormLabel>Adicionar novo cliente</FormLabel>
                  <div className="flex gap-2 items-center mt-2">
                    <Input
                      value={novoClienteNome}
                      onChange={e => setNovoClienteNome(e.target.value)}
                      placeholder="Nome do novo cliente"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNovoCliente();
                        }
                      }}
                      disabled={adicionandoCliente}
                      className="w-72"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddNovoCliente}
                      disabled={adicionandoCliente || !novoClienteNome.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {(novosClientes.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {novosClientes.map((cliente) => (
                        <span
                          key={cliente.nome}
                          className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-sm border"
                        >
                          {cliente.nome}
                          <button
                            type="button"
                            onClick={() => handleRemoveNovoCliente(cliente.nome)}
                            className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                            title="Remover cliente"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-2 text-muted-foreground">
                    Clientes adicionados aqui serão automaticamente vinculados ao parceiro deste OnePager e à base de clientes Aeight.
                  </p>
                </div>
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
