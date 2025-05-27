import React from 'react';
import { RepositorioMaterial } from '@/types';

interface MateriaisListProps {
  materiais: RepositorioMaterial[];
  isLoading: boolean;
}

const MateriaisList: React.FC<MateriaisListProps> = ({ materiais, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Carregando materiais...</p>
      </div>
    );
  }

  if (materiais.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Nenhum material encontrado.</p>
      </div>
    );
  }

  return (
    <ul className="p-4 space-y-4">
      {materiais.map((material) => (
        <li key={material.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
          <div>
            <h3 className="text-lg font-semibold">{material.nome}</h3>
            <p className="text-sm text-gray-600">{material.tipo_arquivo.toUpperCase()}</p>
          </div>
          <div className="flex space-x-2">
            {/* Botão para visualizar o material */}
            <a
              href={material.url_arquivo}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Visualizar
            </a>
            {/* Botão para download */}
            {material.arquivo_upload && (
              <a
                href={material.arquivo_upload}
                download
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Download
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default MateriaisList;
