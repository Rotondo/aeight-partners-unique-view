import React, { useState } from 'react';
import { RepositorioMaterial, Categoria, Empresa, RepositorioTag } from '@/types';
import { FileText, Link2, Image, File, Edit2, Trash } from 'lucide-react';
import dayjs from 'dayjs';
import MaterialEditModal from './MaterialEditModal';

interface MateriaisListProps {
  materiais: RepositorioMaterial[];
  categorias: Categoria[];
  parceiros: Empresa[];
  tags: RepositorioTag[];
  isLoading: boolean;
  onRefresh: () => void;
}

const renderPreview = (material: RepositorioMaterial) => {
  if (material.tipo_arquivo === 'link' && material.url_arquivo) {
    return (
      <a
        href={material.url_arquivo}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline flex gap-1 items-center"
      >
        <Link2 size={16} /> Ver Link
      </a>
    );
  }
  if (material.tipo_arquivo?.includes('image')) {
    // Imagem (jpg, png, etc)
    return (
      <a href={material.url_arquivo} target="_blank" rel="noopener noreferrer">
        <img
          src={material.url_arquivo}
          alt={material.nome}
          className="max-h-16 max-w-28 rounded border"
        />
      </a>
    );
  }
  if (material.tipo_arquivo?.includes('pdf')) {
    // PDF
    return (
      <a href={material.url_arquivo} target="_blank" rel="noopener noreferrer" className="flex gap-1 items-center">
        <FilePdf size={18} /> Visualizar PDF
      </a>
    );
  }
  // Outro tipo de arquivo
  return (
    <a href={material.url_arquivo} target="_blank" rel="noopener noreferrer" className="flex gap-1 items-center">
      <FileText size={16} /> Visualizar arquivo
    </a>
  );
};

const getCategoriaNome = (categorias: Categoria[], id: string) =>
  categorias.find((c) => c.id === id)?.nome || '';

const getParceiroNome = (parceiros: Empresa[], id: string) =>
  parceiros.find((p) => p.id === id)?.nome || '';

const getTagNomes = (tags: RepositorioTag[], tagIds: string[] | string) => {
  if (!tagIds) return [];
  const arr = Array.isArray(tagIds) ? tagIds : [tagIds];
  return tags.filter((t) => arr.includes(t.id)).map((t) => t.nome);
};

const MateriaisList: React.FC<MateriaisListProps> = ({
  materiais,
  categorias,
  parceiros,
  tags,
  isLoading,
  onRefresh,
}) => {
  const [editingMaterial, setEditingMaterial] = useState<RepositorioMaterial | null>(null);

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Carregando materiais...</p>
      </div>
    );
  }

  if (!materiais || materiais.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Nenhum material encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <table className="min-w-full text-sm border border-gray-200 rounded">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1 border-b">Nome</th>
            <th className="px-2 py-1 border-b">Tipo</th>
            <th className="px-2 py-1 border-b">Preview</th>
            <th className="px-2 py-1 border-b">Tags</th>
            <th className="px-2 py-1 border-b">Categoria</th>
            <th className="px-2 py-1 border-b">Parceiro</th>
            <th className="px-2 py-1 border-b">Validade</th>
            <th className="px-2 py-1 border-b">Enviado em</th>
            <th className="px-2 py-1 border-b">Usuário</th>
            <th className="px-2 py-1 border-b"></th>
          </tr>
        </thead>
        <tbody>
          {materiais.map((material) => (
            <tr key={material.id} className="bg-white border-b last:border-0">
              <td className="px-2 py-1 font-semibold">{material.nome}</td>
              <td className="px-2 py-1">
                {material.tipo_arquivo === 'link' ? (
                  <span className="flex items-center gap-1"><Link2 size={14} /> Link</span>
                ) : material.tipo_arquivo?.includes('image') ? (
                  <span className="flex items-center gap-1"><Image size={14} /> Imagem</span>
                ) : material.tipo_arquivo?.includes('pdf') ? (
                  <span className="flex items-center gap-1"><FilePdf size={14} /> PDF</span>
                ) : (
                  <span className="flex items-center gap-1"><FileText size={14} /> {material.tipo_arquivo?.toUpperCase()}</span>
                )}
              </td>
              <td className="px-2 py-1">{renderPreview(material)}</td>
              <td className="px-2 py-1">
                {getTagNomes(tags, material.tag_categoria).map((tag) => (
                  <span key={tag} className="inline-block bg-blue-100 text-blue-800 rounded px-2 py-0.5 mr-1 text-xs">{tag}</span>
                ))}
              </td>
              <td className="px-2 py-1">{getCategoriaNome(categorias, material.categoria_id)}</td>
              <td className="px-2 py-1">{getParceiroNome(parceiros, material.empresa_id)}</td>
              <td className="px-2 py-1">
                {material.validade_contrato
                  ? dayjs(material.validade_contrato).format('DD/MM/YYYY')
                  : '-'}
              </td>
              <td className="px-2 py-1">
                {material.data_upload
                  ? dayjs(material.data_upload).format('DD/MM/YYYY')
                  : '-'}
              </td>
              <td className="px-2 py-1">{material.usuario_upload || '-'}</td>
              <td className="px-2 py-1 space-x-1">
                <button
                  className="inline-flex items-center px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
                  onClick={() => setEditingMaterial(material)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                {/* Exclusão também é possível pelo modal */}
                {material.url_arquivo && (
                  <a
                    href={material.url_arquivo}
                    download
                    className="inline-flex items-center px-2 py-1 rounded text-green-700 hover:bg-green-50"
                    title="Download"
                  >
                    <FileText size={15} />
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingMaterial && (
        <MaterialEditModal
          open={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          material={editingMaterial}
          categorias={categorias}
          parceiros={parceiros}
          tags={tags}
          onSave={() => {
            setEditingMaterial(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default MateriaisList;
