
import React, { useState, useEffect } from 'react';
import { RepositorioMaterial, Categoria, Empresa, RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface MaterialEditModalProps {
  material: RepositorioMaterial;
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  onClose: () => void;
  onSuccess: () => void;
}

const MaterialEditModal: React.FC<MaterialEditModalProps> = ({
  material,
  categorias,
  parceiros,
  tags,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: material.nome,
    empresa_id: material.empresa_id,
    categoria_id: material.categoria_id,
    tipo_arquivo: material.tipo_arquivo,
    validade_contrato: material.validade_contrato || '',
    tag_categoria: Array.isArray(material.tag_categoria) ? material.tag_categoria : [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('repositorio_materiais')
        .update({
          nome: formData.nome,
          empresa_id: formData.empresa_id,
          categoria_id: formData.categoria_id,
          tipo_arquivo: formData.tipo_arquivo,
          validade_contrato: formData.validade_contrato || null,
          tag_categoria: formData.tag_categoria,
        })
        .eq('id', material.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Material atualizado com sucesso!',
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o material.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Material</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value }))}
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
            <Label htmlFor="validade">Validade do Contrato</Label>
            <Input
              id="validade"
              type="date"
              value={formData.validade_contrato}
              onChange={(e) => setFormData(prev => ({ ...prev, validade_contrato: e.target.value }))}
            />
          </div>

          <div>
            <Label>Tags</Label>
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialEditModal;
