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
  const [nome, setNome] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState<string>('');
  const [validade, setValidade] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const resetForm = () => {
    setSelectedCategoria(null);
    setSelectedParceiro(null);
    setSelectedTags([]);
    setNome('');
    setFile(null);
    setLink('');
    setValidade('');
  };

  const handleUpload = async () => {
    if (!selectedCategoria || !selectedParceiro || !nome.trim() || (!file && !link.trim())) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios (categoria, parceiro, nome e arquivo ou link).',
        variant: 'destructive',
      });
      return;
    }

    if (file && link.trim()) {
      toast({
        title: 'Atenção',
        description: 'Envie apenas um arquivo ou um link, não ambos.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      let tipo_arquivo = '';
      let url_arquivo = '';
      let arquivo_upload = '';

      if (file) {
        tipo_arquivo = file.type || 'arquivo';
        const uniqueName = `${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('materiais')
          .upload(`public/${uniqueName}`, file);

        if (uploadError) throw uploadError;
        url_arquivo = uploadData?.path ?? '';
        arquivo_upload = uploadData?.path ?? '';
      } else if (link.trim()) {
        tipo_arquivo = 'link';
        url_arquivo = link.trim();
        arquivo_upload = '';
      }

      const { error: insertError } = await supabase
        .from('repositorio_materiais')
        .insert({
          categoria_id: selectedCategoria,
          empresa_id: selectedParceiro,
          tag_categoria: selectedTags.length > 0 ? selectedTags : null,
          nome: nome.trim(),
          tipo_arquivo,
          url_arquivo,
          arquivo_upload,
          validade_contrato: validade || null,
          data_upload: new Date().toISOString(),
          usuario_upload: '', // Complete aqui se tiver usuário logado
        });

      if (insertError) throw insertError;

      toast({
        title: 'Sucesso',
        description: 'Material enviado com sucesso!',
        variant: 'success',
      });

      resetForm();
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

      {/* Categoria */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Categoria *</label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedCategoria || ''}
          onChange={e => setSelectedCategoria(e.target.value)}
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categorias.map(categoria => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Parceiro */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Parceiro *</label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedParceiro || ''}
          onChange={e => setSelectedParceiro(e.target.value)}
        >
          <option value="" disabled>
            Selecione um parceiro
          </option>
          {parceiros.map(parceiro => (
            <option key={parceiro.id} value={parceiro.id}>
              {parceiro.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Nome personalizado */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Nome do Material *</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg"
          value={nome}
          onChange={e => setNome(e.target.value)}
          maxLength={100}
          placeholder="Dê um nome ao material"
        />
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Tags</label>
        {tags.length === 0 ? (
          <p className="text-gray-500">Nenhuma tag disponível. Verifique o gerenciamento de tags.</p>
        ) : (
          <select
            className="w-full px-4 py-2 border rounded-lg"
            multiple
            value={selectedTags}
            onChange={e =>
              setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            {tags.map(tag => (
              <option key={tag.id} value={tag.id}>
                {tag.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Validade do Contrato */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Validade do Contrato</label>
        <input
          type="date"
          className="w-full px-4 py-2 border rounded-lg"
          value={validade}
          onChange={e => setValidade(e.target.value)}
        />
      </div>

      {/* Link ou Arquivo */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Arquivo</label>
        <input
          type="file"
          className="w-full px-4 py-2 border rounded-lg"
          onChange={e => setFile(e.target.files?.[0] || null)}
          disabled={!!link}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Ou Link</label>
        <input
          type="url"
          className="w-full px-4 py-2 border rounded-lg"
          value={link}
          onChange={e => setLink(e.target.value)}
          placeholder="https://..."
          disabled={!!file}
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
