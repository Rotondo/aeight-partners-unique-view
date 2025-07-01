import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  pageInfo: {
    startItem: number;
    endItem: number;
    totalItems: number;
  };
  itemsPerPageOptions: number[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  pageInfo,
  itemsPerPageOptions,
  canGoNext,
  canGoPrevious,
  onPageChange,
  onItemsPerPageChange,
  onNext,
  onPrevious,
}) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            {pageInfo.totalItems > 0 
              ? `Exibindo ${pageInfo.startItem} a ${pageInfo.endItem} de ${pageInfo.totalItems} resultados`
              : 'Nenhum resultado encontrado'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Itens por página:</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground">
          Exibindo {pageInfo.startItem} a {pageInfo.endItem} de {pageInfo.totalItems} resultados
        </p>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Itens por página:</p>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                disabled={!canGoPrevious}
                className="h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Anterior</span>
              </Button>
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={index}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="h-8 w-8"
                  >
                    {page}
                  </Button>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={onNext}
                disabled={!canGoNext}
                className="h-8 px-3"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Próximo</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default PaginationControls;