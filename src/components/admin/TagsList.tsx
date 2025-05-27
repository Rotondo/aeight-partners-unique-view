import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { RepositorioTag } from '@/types';

interface TagsListProps {
  onTagSelect?: (tag: RepositorioTag | null) => void;
}

const TagsList: React.FC<TagsListProps> = ({ onTagSelect }) => {
  const { toast } = useToast();
  const [tags, setTags] = useState<RepositorioTag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTag, setCurrentTag] = useState<RepositorioTag | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('repositorio_tags').select('*').order('nome');
        if (error) throw error;
        setTags(data || []);
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as tags.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  const handleOpenForm = (tag?: RepositorioTag) => {
    if (tag) {
      setCurrentTag(tag);
      setIsEditing(true);
    } else {
      setCurrentTag(null);
      setIsEditing(false);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentTag(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentTag?.nome) {
      toast({
        title: 'Erro',
        description: 'Nome da tag é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing && currentTag.id) {
        const { error } = await supabase
          .from('repositorio_tags')
          .update({ nome: currentTag.nome, descricao: currentTag.descricao, cor: currentTag.cor })
          .eq('id', currentTag.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Tag atualizada com sucesso!',
          variant: 'success',
        });
      } else {
        const { error } = await supabase
          .from('repositorio_tags')
          .insert({ nome: currentTag?.nome, descricao: currentTag?.descricao, cor: currentTag?.cor });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Tag criada com sucesso!',
          variant: 'success',
        });
      }

      handleCloseForm();
      const { data } = await supabase.from('repositorio_tags').select('*').order('nome');
      setTags(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a tag.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('repositorio_tags').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: 'Sucesso',
        description: 'Tag excluída com sucesso!',
        variant: 'success',
      });

      const { data } = await supabase.from('repositorio_tags').select('*').order('nome');
      setTags(data || []);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a tag.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gerenciar Tags</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        onClick={() => handleOpenForm()}
      >
        Adicionar Nova Tag
      </button>

      {isFormOpen && (
        <div className="mb-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={currentTag?.nome || ''}
                onChange={(e) => setCurrentTag({ ...currentTag, nome: e.target.value } as RepositorioTag)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Nome da Tag"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <input
                type="text"
                value={currentTag?.descricao || ''}
                onChange={(e) => setCurrentTag({ ...currentTag, descricao: e.target.value } as RepositorioTag)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Descrição (opcional)"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">Cor</label>
              <input
                type="color"
                value={currentTag?.cor || '#000000'}
                onChange={(e) => setCurrentTag({ ...currentTag, cor: e.target.value } as RepositorioTag)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                onClick={handleCloseForm}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {isEditing ? 'Atualizar Tag' : 'Criar Tag'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-auto bg-white rounded-lg shadow-md border">
        {isLoading ? (
          <p>Carregando...</p>
        ) : tags.length === 0 ? (
          <p>Nenhuma tag cadastrada.</p>
        ) : (
          <table className="table-auto w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Descrição</th>
                <th className="px-4 py-2">Cor</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="border px-4 py-2">{tag.nome}</td>
                  <td className="border px-4 py-2">{tag.descricao || '-'}</td>
                  <td className="border px-4 py-2">
                    <span
                      className="inline-block w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.cor || '#000000' }}
                    ></span>
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      className="text-blue-500 hover:underline mr-2"
                      onClick={() => handleOpenForm(tag)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(tag.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TagsList;
