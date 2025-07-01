import React, { useMemo } from 'react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';
import ClientesVinculadosTable from './ClientesVinculadosTable';
import { EmpresaCliente } from '@/types';

interface PaginatedClientesVinculadosTableProps {
  clientesVinculados: EmpresaCliente[];
  searchTerm: string;
  onEditar: (relacionamento: EmpresaCliente) => void;
  onSolicitarApresentacao: (relacionamento: EmpresaCliente) => void;
}

const CONSOLE_PREFIX = "[PaginatedClientesVinculadosTable]";

const PaginatedClientesVinculadosTable: React.FC<PaginatedClientesVinculadosTableProps> = ({
  clientesVinculados,
  searchTerm,
  onEditar,
  onSolicitarApresentacao,
}) => {
  // Filter clients based on search term
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) {
      console.log(`${CONSOLE_PREFIX} No search term, returning all ${clientesVinculados.length} clients`);
      return clientesVinculados;
    }

    const filtered = clientesVinculados.filter((cliente) => {
      try {
        if (!cliente) return false;
        
        const clienteNome = cliente?.empresa_cliente?.nome || "";
        const proprietarioNome = cliente?.empresa_proprietaria?.nome || "";
        
        if (!cliente.empresa_cliente || !cliente.empresa_cliente.nome) {
          console.warn(`${CONSOLE_PREFIX} Cliente sem nome ou objeto nulo:`, cliente);
        }
        if (!cliente.empresa_proprietaria || !cliente.empresa_proprietaria.nome) {
          console.warn(`${CONSOLE_PREFIX} Proprietário sem nome ou objeto nulo:`, cliente);
        }
        
        return (
          clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proprietarioNome.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao filtrar clientes vinculados:`, error, cliente);
        return false;
      }
    });

    console.log(`${CONSOLE_PREFIX} Filtered ${filtered.length} clients from ${clientesVinculados.length} total with search: "${searchTerm}"`);
    return filtered;
  }, [clientesVinculados, searchTerm]);

  // Initialize pagination
  const pagination = usePagination({
    data: filteredClientes,
    itemsPerPageOptions: [20, 50, 100],
    defaultItemsPerPage: 20,
  });

  React.useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Pagination state:`, {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      itemsPerPage: pagination.itemsPerPage,
      totalItems: pagination.totalItems,
      paginatedItems: pagination.paginatedData.length,
    });
  }, [pagination.currentPage, pagination.totalPages, pagination.itemsPerPage, pagination.totalItems, pagination.paginatedData.length]);

  return (
    <div className="space-y-4">
      {/* Table */}
      <ClientesVinculadosTable
        clientesVinculados={pagination.paginatedData}
        onEditar={onEditar}
        onSolicitarApresentacao={onSolicitarApresentacao}
      />

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        itemsPerPage={pagination.itemsPerPage}
        totalItems={pagination.totalItems}
        pageInfo={pagination.pageInfo}
        itemsPerPageOptions={[20, 50, 100]}
        canGoNext={pagination.canGoNext}
        canGoPrevious={pagination.canGoPrevious}
        onPageChange={pagination.setCurrentPage}
        onItemsPerPageChange={pagination.setItemsPerPage}
        onNext={pagination.goToNextPage}
        onPrevious={pagination.goToPreviousPage}
      />
    </div>
  );
};

export default PaginatedClientesVinculadosTable;