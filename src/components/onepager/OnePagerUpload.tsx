
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Categoria, Empresa } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';

const formSchema = z.object({
  empresaId: z.string({
    required_error: "Selecione um parceiro",
  }),
  categoriaId: z.string({
    required_error: "Selecione uma categoria",
  }),
  arquivo: z.instanceof(FileList, {
    message: "Selecione um arquivo para upload",
  }).refine((files) => files.length > 0, {
    message: "Selecione um arquivo para upload",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface OnePagerUploadProps {
  categorias: Categoria[];
  onSuccess?: () => void;
}

const OnePagerUpload: React.FC<OnePagerUploadProps> = ({ 
  categorias,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parceiros, setParceiros] = useState<Empresa[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresaId: '',
      categoriaId: '',
    },
  });
  
  // Load all partners
  useEffect(() => {
    const fetchParceiros = async () => {
      setLoading(true);
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
          description: 'Não foi possível carregar a lista de parceiros.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParceiros();
  }, [toast]);
  
  // When categoria changes, load partners for that categoria
  const handleCategoriaChange = async (value: string) => {
    setSelectedCategoria(value);
    form.setValue('categoriaId', value);
    
    try {
      // Get companies that belong to the selected category
      const { data, error } = await (supabase as any)
        .from('empresa_categoria')
        .select('empresa_id')
        .eq('categoria_id', value);

      if (error) throw error;

      if (data && data.length > 0) {
        const empresaIds = data.map((item: any) => item.empresa_id);
        
        const { data: empresas, error: empresasError } = await (supabase as any)
          .from('empresas')
          .select('*')
          .in('id', empresaIds)
          .eq('tipo', 'parceiro')
          .order('nome');

        if (empresasError) throw empresasError;
        
        if (empresas) {
          setParceiros(empresas as Empresa[]);
        }
      } else {
        setParceiros([]);
        form.setValue('empresaId', '');
      }
    } catch (error) {
      console.error('Error fetching category partners:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os parceiros desta categoria.',
        variant: 'destructive',
      });
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    setUploading(true);
    try {
      // Check if we already have an onepager for this empresa/categoria combo
      const { data: existingOnePager, error: checkError } = await (supabase as any)
        .from('onepager')
        .select('id')
        .eq('empresa_id', values.empresaId)
        .eq('categoria_id', values.categoriaId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      // Upload file to storage
      const file = values.arquivo[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${values.empresaId}_${values.categoriaId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('onepagers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from('onepagers')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      
      // Create or update onepager record
      if (existingOnePager) {
        // Update existing record
        const { data: updateData, error: updateError } = await (supabase as any)
          .from('onepager')
          .update({
            url_imagem: publicUrl,
            arquivo_upload: filePath,
            data_upload: new Date().toISOString(),
          })
          .eq('id', existingOnePager.id)
          .select();
        
        if (updateError) throw updateError;
        
        toast({
          title: 'Sucesso',
          description: 'OnePager atualizado com sucesso!',
        });
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await (supabase as any)
          .from('onepager')
          .insert({
            empresa_id: values.empresaId,
            categoria_id: values.categoriaId,
            url_imagem: publicUrl,
            arquivo_upload: filePath,
            data_upload: new Date().toISOString(),
          })
          .select();
        
        if (insertError) throw insertError;
        
        toast({
          title: 'Sucesso',
          description: 'OnePager enviado com sucesso!',
        });
      }
      
      // Reset form
      form.reset({
        empresaId: '',
        categoriaId: '',
      });
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading onepager:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer o upload do OnePager.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de OnePager</CardTitle>
        <CardDescription>
          Envie ou atualize o OnePager para um parceiro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={(value) => handleCategoriaChange(value)}
                    defaultValue={field.value}
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
                  <FormLabel>Parceiro</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!selectedCategoria || parceiros.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedCategoria 
                            ? "Selecione uma categoria primeiro" 
                            : parceiros.length === 0 
                              ? "Nenhum parceiro disponível" 
                              : "Selecione um parceiro"
                        } />
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
              name="arquivo"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo (PDF, PNG ou JPG)</FormLabel>
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
            
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar OnePager
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
