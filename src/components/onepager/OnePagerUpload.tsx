
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Categoria, Empresa } from '@/types';
import {
  Form,
  FormControl,
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

// Schema for form validation
const formSchema = z.object({
  categoria_id: z.string().min(1, 'Selecione uma categoria'),
  empresa_id: z.string().min(1, 'Selecione um parceiro'),
  uploadType: z.enum(['file', 'url']),
  fileUpload: z.any().optional(),
  urlImagem: z.string().url('URL inválida').optional(),
}).refine(data => {
  if (data.uploadType === 'file') {
    return !!data.fileUpload;
  }
  if (data.uploadType === 'url') {
    return !!data.urlImagem;
  }
  return false;
}, {
  message: 'Você deve fornecer um arquivo ou uma URL',
  path: ['fileUpload'],
});

type FormValues = z.infer<typeof formSchema>;

interface OnePagerUploadProps {
  categorias: Categoria[];
  onSuccess?: () => void;
}

const OnePagerUpload: React.FC<OnePagerUploadProps> = ({ categorias, onSuccess }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoria_id: '',
      empresa_id: '',
      uploadType: 'file',
      urlImagem: '',
    },
  });

  // Watch for category changes to load partners
  const watchedCategoriaId = form.watch('categoria_id');
  
  useEffect(() => {
    if (!watchedCategoriaId) {
      setParceiros([]);
      return;
    }

    const fetchParceiros = async () => {
      try {
        // Get companies that belong to the selected category
        const { data: empresaCategoria, error: ecError } = await supabase
          .from('empresa_categoria')
          .select('empresa_id')
          .eq('categoria_id', watchedCategoriaId);

        if (ecError) throw ecError;

        if (empresaCategoria && empresaCategoria.length > 0) {
          const empresaIds = empresaCategoria.map(item => item.empresa_id);
          
          const { data: empresas, error: empresasError } = await supabase
            .from('empresas')
            .select('*')
            .in('id', empresaIds)
            .eq('tipo', 'parceiro')
            .order('nome');

          if (empresasError) throw empresasError;
          
          setParceiros(empresas as Empresa[]);
        } else {
          setParceiros([]);
        }
      } catch (error) {
        console.error('Error fetching partners for category:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os parceiros desta categoria.',
          variant: 'destructive',
        });
      }
    };

    fetchParceiros();
  }, [watchedCategoriaId, toast]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      form.setValue('fileUpload', file);
    } else {
      form.setValue('fileUpload', undefined);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar autenticado para realizar esta operação.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileName = null;
      let urlImagem = null;

      // Handle file upload
      if (data.uploadType === 'file' && selectedFile) {
        const timestamp = new Date().getTime();
        fileName = `${data.empresa_id}/${timestamp}-${selectedFile.name}`;
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('onepagers')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
      } else if (data.uploadType === 'url') {
        urlImagem = data.urlImagem;
      }
      
      // Check if an OnePager already exists for this company and category
      const { data: existingOnePager, error: existingError } = await supabase
        .from('onepager')
        .select('id')
        .eq('empresa_id', data.empresa_id)
        .eq('categoria_id', data.categoria_id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingOnePager) {
        // Update existing OnePager
        const { error: updateError } = await supabase
          .from('onepager')
          .update({
            url_imagem: urlImagem,
            arquivo_upload: fileName,
            data_upload: new Date().toISOString(),
          })
          .eq('id', existingOnePager.id);

        if (updateError) throw updateError;
      } else {
        // Insert new OnePager
        const { error: insertError } = await supabase
          .from('onepager')
          .insert({
            empresa_id: data.empresa_id,
            categoria_id: data.categoria_id,
            url_imagem: urlImagem,
            arquivo_upload: fileName,
            data_upload: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      toast({
        title: 'Sucesso',
        description: 'OnePager salvo com sucesso!',
      });

      // Reset form
      form.reset();
      setSelectedFile(null);

      // Trigger callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading OnePager:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar o OnePager. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting}
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
              name="empresa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parceiro</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isSubmitting || !watchedCategoriaId}
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
              name="uploadType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Upload</FormLabel>
                  <Tabs 
                    defaultValue="file" 
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="file" disabled={isSubmitting}>
                        Arquivo
                      </TabsTrigger>
                      <TabsTrigger value="url" disabled={isSubmitting}>
                        URL
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="file" className="mt-4">
                      <FormItem>
                        <FormLabel>Selecione um arquivo (PNG, JPEG, PDF)</FormLabel>
                        <FormControl>
                          <Input 
                            type="file" 
                            accept=".png,.jpg,.jpeg,.pdf"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground">
                            Arquivo selecionado: {selectedFile.name}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    </TabsContent>
                    
                    <TabsContent value="url" className="mt-4">
                      <FormField
                        control={form.control}
                        name="urlImagem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL da Imagem ou PDF</FormLabel>
                            <FormControl>
                              <Input 
                                type="url"
                                placeholder="https://exemplo.com/imagem.png" 
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <Upload className="mr-2 h-4 w-4" />
                  Salvar OnePager
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OnePagerUpload;
