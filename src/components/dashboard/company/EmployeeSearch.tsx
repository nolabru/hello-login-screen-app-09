import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';

interface EmployeeSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="w-full max-w-md">
      <SearchBar
        placeholder="Buscar funcionário por nome ou email..."
        value={searchQuery}
        onChange={(value) => onSearchChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
        className="max-w-md"
      />
    </div>
  );
};

export default EmployeeSearch;
