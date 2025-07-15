
import React, { useState } from 'react';
import { Categoria, Empresa, RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, Loader2, Check } from 'lucide-react';

interface LinkUploadProps {
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  onSuccess: () => void;
}

const LinkUpload: React.FC<LinkUploadProps> = ({
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
    url: '',
    descricao: '',
    empresa_id: '',
    categoria_id: '',
    tag_categoria: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // NOVO: Validação de campos obrigatórios
    if (!formData.nome || !formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do link é obrigatório.',
        variant: 'destructive',
      });
      return;
    }
    if (!formData.url || !formData.url.trim()) {
      toast({
        title: 'Erro',
        description: 'A URL é obrigatória.',
        variant: 'destructive',
      });
      return;
    }
    // NOVO: Validação de URL
    const urlRegex = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlRegex.test(formData.url)) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira uma URL válida.',
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
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para adicionar links.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase
        .from('repositorio_links')
        .insert({
          nome: formData.nome,
          url: formData.url,
          descricao: formData.descricao || null,
          empresa_id: formData.empresa_id,
          categoria_id: formData.categoria_id,
          tag_categoria: formData.tag_categoria,
          usuario_upload: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Link adicionado com sucesso!',
        variant: 'default',
      });

      // Reset form
      setFormData({
        nome: '',
        url: '',
        descricao: '',
        empresa_id: '',
        categoria_id: '',
        tag_categoria: [],
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding link:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o link.',
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
          <Link className="h-5 w-5" />
          Adicionar Link
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome do Link</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Catálogo de Produtos, Manual de Instalação..."
              required
            />
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://exemplo.com/material"
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Breve descrição do conteúdo..."
              rows={3}
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

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Adicionar Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LinkUpload;
