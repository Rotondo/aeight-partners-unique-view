import { useState, useMemo } from 'react';

export interface UsePaginationProps<T> {
  data: T[];
  itemsPerPageOptions?: number[];
  defaultItemsPerPage?: number;
}

export interface UsePaginationReturn<T> {
  // Pagination state
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  
  // Paginated data
  paginatedData: T[];
  
  // Pagination controls
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  
  // Helper functions
  canGoNext: boolean;
  canGoPrevious: boolean;
  pageInfo: {
    startItem: number;
    endItem: number;
    totalItems: number;
  };
}

export const usePagination = <T>({
  data,
  itemsPerPageOptions = [20, 50, 100],
  defaultItemsPerPage = 20,
}: UsePaginationProps<T>): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(defaultItemsPerPage);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Helper functions
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => {
    if (canGoNext) setCurrentPage(currentPage + 1);
  };
  const goToPreviousPage = () => {
    if (canGoPrevious) setCurrentPage(currentPage - 1);
  };

  const setItemsPerPage = (items: number) => {
    setItemsPerPageState(items);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  // Ensure current page is valid when data changes
  const safeCurrentPage = useMemo(() => {
    if (totalPages === 0) return 1;
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);

  // Update current page if it's out of bounds
  if (safeCurrentPage !== currentPage) {
    setCurrentPage(safeCurrentPage);
  }

  const pageInfo = {
    startItem: totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(safeCurrentPage * itemsPerPage, totalItems),
    totalItems,
  };

  return {
    currentPage: safeCurrentPage,
    itemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
    pageInfo,
  };
};