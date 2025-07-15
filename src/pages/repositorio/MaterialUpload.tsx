
import React, { useState } from 'react';
import { Categoria, Empresa, RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Loader2, File, Check } from 'lucide-react';
import { sanitizeFileName, validateFileName } from '@/utils/fileUtils';

interface MaterialUploadProps {
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  onSuccess: () => void;
}

const MaterialUpload: React.FC<MaterialUploadProps> = ({
  categorias,
  parceiros,
  tags,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    empresa_id: '',
    categoria_id: '',
    tipo_arquivo: '',
    validade_contrato: '',
    tag_categoria: [] as string[],
    arquivo: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // NOVO: Validação de campos obrigatórios
    if (!formData.nome || !formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do material é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.empresa_id) {
      toast({
        title: 'Erro',
        description: 'Selecione a empresa.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.categoria_id) {
      toast({
        title: 'Erro',
        description: 'Selecione a categoria.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.arquivo || !user) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo e verifique se está logado.',
        variant: 'destructive',
      });
      return;
    }
    // NOVO: Validação de tipo e tamanho de arquivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(formData.arquivo.type)) {
      toast({
        title: 'Erro',
        description: 'Tipo de arquivo não permitido. Apenas PDF, JPG ou PNG.',
        variant: 'destructive',
      });
      return;
    }
    if (formData.arquivo.size > 10 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo deve ter no máximo 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Sanitiza o nome do arquivo
      const originalFileName = formData.arquivo.name;
      const sanitizedFileName = sanitizeFileName(originalFileName);
      
      // Valida o nome do arquivo sanitizado
      const validation = validateFileName(sanitizedFileName);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Cria um nome único para o arquivo
      const timestamp = Date.now();
      const fileName = `${timestamp}_${sanitizedFileName}`;
      
      console.log('Original filename:', originalFileName);
      console.log('Sanitized filename:', fileName);

      // Upload do arquivo para o bucket 'materiais'
      const { error: uploadError } = await supabase.storage
        .from('materiais')
        .upload(fileName, formData.arquivo);

      if (uploadError) throw uploadError;

      // Salvar dados no banco
      const { error: insertError } = await supabase
        .from('repositorio_materiais')
        .insert({
          nome: formData.nome,
          empresa_id: formData.empresa_id,
          categoria_id: formData.categoria_id,
          tipo_arquivo: formData.tipo_arquivo,
          validade_contrato: formData.validade_contrato || null,
          tag_categoria: formData.tag_categoria,
          arquivo_upload: fileName,
          usuario_upload: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Sucesso',
        description: 'Material enviado com sucesso!',
        variant: 'default',
      });

      // Reset form
      setFormData({
        nome: '',
        empresa_id: '',
        categoria_id: '',
        tipo_arquivo: '',
        validade_contrato: '',
        tag_categoria: [],
        arquivo: null,
      });

      // Reset file input
      const fileInput = document.getElementById('arquivo') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      onSuccess();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar o material.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTagChange = (tagName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      tag_categoria: checked
        ? [...prev.tag_categoria, tagName]
        : prev.tag_categoria.filter(t => t !== tagName)
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Material
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Material</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do material"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="parceiro">Parceiro</Label>
            <Select
              value={formData.empresa_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, empresa_id: value }))}
              required
            >
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

          <div>
            <Label htmlFor="tipo">Tipo de Arquivo</Label>
            <Select
              value={formData.tipo_arquivo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_arquivo: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="image">Imagem</SelectItem>
                <SelectItem value="document">Documento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="validade">Validade do Contrato (Opcional)</Label>
            <Input
              id="validade"
              type="date"
              value={formData.validade_contrato}
              onChange={(e) => setFormData(prev => ({ ...prev, validade_contrato: e.target.value }))}
            />
          </div>

          <div>
            <Label>Tags (Opcional)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={formData.tag_categoria.includes(tag.nome)}
                    onCheckedChange={(checked) => handleTagChange(tag.nome, checked as boolean)}
                  />
                  <Label htmlFor={`tag-${tag.id}`} className="text-sm">
                    {tag.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="arquivo">Arquivo</Label>
            <div className="space-y-2">
              <Input
                id="arquivo"
                type="file"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  arquivo: e.target.files?.[0] || null 
                }))}
                required
              />
              {formData.arquivo && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md border border-green-200">
                  <Check className="h-4 w-4" />
                  <File className="h-4 w-4" />
                  <span>Arquivo selecionado: {formData.arquivo.name}</span>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Material
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MaterialUpload;
