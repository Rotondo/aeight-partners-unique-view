import React from 'react';
import ClientesStats from './ClientesStats';
import PaginatedClientesVinculadosTable from './PaginatedClientesVinculadosTable';
import PaginatedClientesNaoVinculadosTable from './PaginatedClientesNaoVinculadosTable';
import { EmpresaCliente } from '@/types';

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface ClientesTabContentProps {
  empresasClientesArray: EmpresaCliente[];
  searchTerm: string;
  filteredClientesNaoVinculados: EmpresaOption[];
  onEditar: (relacionamento: EmpresaCliente) => void;
  onSolicitarApresentacao: (relacionamento: EmpresaCliente) => void;
  onVincularCliente: (cliente: EmpresaOption) => void;
}

const CONSOLE_PREFIX = "[ClientesTabContent]";

const ClientesTabContent: React.FC<ClientesTabContentProps> = ({
  empresasClientesArray,
  searchTerm,
  filteredClientesNaoVinculados,
  onEditar,
  onSolicitarApresentacao,
  onVincularCliente,
}) => {
  React.useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Rendering with:`, {
      vinculados: empresasClientesArray.length,
      naoVinculados: filteredClientesNaoVinculados.length,
      searchTerm: searchTerm
    });
  }, [empresasClientesArray.length, filteredClientesNaoVinculados.length, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <ClientesStats empresasClientes={empresasClientesArray} />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Clientes Vinculados</h3>
          <PaginatedClientesVinculadosTable
            clientesVinculados={empresasClientesArray}
            searchTerm={searchTerm}
            onEditar={onEditar}
            onSolicitarApresentacao={onSolicitarApresentacao}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Clientes Disponíveis para Vinculação</h3>
          <PaginatedClientesNaoVinculadosTable
            clientesNaoVinculados={filteredClientesNaoVinculados}
            searchTerm={searchTerm}
            onVincular={onVincularCliente}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientesTabContent;