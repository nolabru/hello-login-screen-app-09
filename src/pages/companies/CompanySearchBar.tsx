import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';

interface CompanySearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const CompanySearchBar: React.FC<CompanySearchBarProps> = ({
  searchQuery,
  onSearchQueryChange
}) => {
  return (
    <SearchBar
      placeholder="Buscar empresas..."
      value={searchQuery}
      onChange={onSearchQueryChange}
    />
  );
};

export default CompanySearchBar;
