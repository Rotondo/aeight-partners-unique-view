import React, { useMemo } from 'react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/ui/PaginationControls';
import ClientesNaoVinculadosTable from './ClientesNaoVinculadosTable';

interface EmpresaOption {
  id: string;
  nome: string;
  tipo: string;
}

interface PaginatedClientesNaoVinculadosTableProps {
  clientesNaoVinculados: EmpresaOption[];
  searchTerm: string;
  onVincular: (cliente: EmpresaOption) => void;
}

const CONSOLE_PREFIX = "[PaginatedClientesNaoVinculadosTable]";

const PaginatedClientesNaoVinculadosTable: React.FC<PaginatedClientesNaoVinculadosTableProps> = ({
  clientesNaoVinculados,
  searchTerm,
  onVincular,
}) => {
  // Filter clients based on search term
  const filteredClientes = useMemo(() => {
    if (!searchTerm.trim()) {
      console.log(`${CONSOLE_PREFIX} No search term, returning all ${clientesNaoVinculados.length} clients`);
      return clientesNaoVinculados;
    }

    const filtered = clientesNaoVinculados.filter((cliente) => {
      try {
        if (!cliente || !cliente.id) return false;
        
        if (!cliente.nome) {
          console.warn(`${CONSOLE_PREFIX} Cliente não vinculado sem nome:`, cliente);
        }
        
        return (cliente.nome || "").toLowerCase().includes(searchTerm.toLowerCase());
      } catch (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao filtrar clientes não vinculados:`, error, cliente);
        return false;
      }
    });

    console.log(`${CONSOLE_PREFIX} Filtered ${filtered.length} clients from ${clientesNaoVinculados.length} total with search: "${searchTerm}"`);
    return filtered;
  }, [clientesNaoVinculados, searchTerm]);

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
      {/* Table Wrapper */}
      <div className="overflow-x-auto rounded-md border bg-background shadow-sm">
        <table className="min-w-full text-sm align-middle">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Cliente</th>
              <th className="px-3 py-2 text-left font-medium">Proprietário</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Desde</th>
              <th className="px-3 py-2 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <ClientesNaoVinculadosTable
              clientesNaoVinculados={pagination.paginatedData}
              onVincular={onVincular}
            />
          </tbody>
        </table>
      </div>

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

export default PaginatedClientesNaoVinculadosTable;