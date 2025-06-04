
import React, { useState, useEffect } from 'react';
import { RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const TagsList: React.FC = () => {
  const { toast } = useToast();
  const [tags, setTags] = useState<RepositorioTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<RepositorioTag | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#3B82F6',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('repositorio_tags')
        .select('*')
        .order('nome');

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tags.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        const { error } = await supabase
          .from('repositorio_tags')
          .update(formData)
          .eq('id', editingTag.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Tag atualizada com sucesso!',
          variant: 'default',
        });
      } else {
        const { error } = await supabase
          .from('repositorio_tags')
          .insert(formData);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Tag criada com sucesso!',
          variant: 'default',
        });
      }

      setIsDialogOpen(false);
      setEditingTag(null);
      setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tag.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (tag: RepositorioTag) => {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;

    try {
      const { error } = await supabase
        .from('repositorio_tags')
        .delete()
        .eq('id', tag.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tag excluída com sucesso!',
        variant: 'default',
      });

      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tag.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (tag: RepositorioTag) => {
    setEditingTag(tag);
    setFormData({
      nome: tag.nome,
      descricao: tag.descricao || '',
      cor: tag.cor || '#3B82F6',
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingTag(null);
    setFormData({ nome: '', descricao: '', cor: '#3B82F6' });
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando tags...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tags do Repositório</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag ? 'Editar Tag' : 'Nova Tag'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor}
                  onChange={(e) =>
                    setFormData({ ...formData, cor: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingTag ? 'Atualizar' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {tags.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma tag cadastrada.</p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    style={{ backgroundColor: tag.cor }}
                    className="text-white"
                  >
                    {tag.nome}
                  </Badge>
                  {tag.descricao && (
                    <span className="text-sm text-muted-foreground">
                      {tag.descricao}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(tag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(tag)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagsList;
