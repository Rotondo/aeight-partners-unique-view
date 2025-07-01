import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ClientSearchFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeTab: string;
  placeholder?: string;
}

const CONSOLE_PREFIX = "[ClientSearchFilters]";

const ClientSearchFilters: React.FC<ClientSearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  activeTab,
  placeholder,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    console.log(`${CONSOLE_PREFIX} Search term changed: "${newTerm}" (tab: ${activeTab})`);
    onSearchChange(newTerm);
  };

  const defaultPlaceholder = activeTab === "clientes"
    ? "Buscar por empresa ou proprietário..."
    : "Buscar parceiros...";

  return (
    <div className="flex items-center space-x-2 mt-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder || defaultPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>
    </div>
  );
};

export default ClientSearchFilters;