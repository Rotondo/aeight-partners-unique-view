import React, { useState } from 'react';
import { Categoria, Empresa, RepositorioTag } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedParceiro, setSelectedParceiro] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!selectedCategoria || !selectedParceiro || !file) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Faz upload do arquivo para o bucket do Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materiais')
        .upload(`public/${file.name}`, file);

      if (uploadError) throw uploadError;

      // Salva os dados do material no banco
      const { error: insertError } = await supabase.from('repositorio_materiais').insert({
        categoria_id: selectedCategoria,
        empresa_id: selectedParceiro,
        tag_categoria: selectedTags,
        nome: file.name,
        tipo_arquivo: file.type,
        url_arquivo: uploadData?.path,
        data_upload: new Date(),
      });

      if (insertError) throw insertError;

      toast({
        title: 'Sucesso',
        description: 'Material enviado com sucesso!',
        variant: 'success',
      });

      setFile(null);
      setSelectedCategoria(null);
      setSelectedParceiro(null);
      setSelectedTags([]);
      onSuccess();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o material.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload de Material</h2>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Categoria</label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedCategoria || ''}
          onChange={(e) => setSelectedCategoria(e.target.value)}
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Parceiro</label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedParceiro || ''}
          onChange={(e) => setSelectedParceiro(e.target.value)}
        >
          <option value="" disabled>
            Selecione um parceiro
          </option>
          {parceiros.map((parceiro) => (
            <option key={parceiro.id} value={parceiro.id}>
              {parceiro.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Tags</label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          multiple
          value={selectedTags}
          onChange={(e) =>
            setSelectedTags(Array.from(e.target.selectedOptions, (option) => option.value))
          }
        >
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Arquivo</label>
        <input
          type="file"
          className="w-full px-4 py-2 border rounded-lg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {isUploading ? 'Enviando...' : 'Enviar Material'}
      </button>
    </div>
  );
};

export default MaterialUpload;
