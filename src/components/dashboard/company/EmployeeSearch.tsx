
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EmployeeSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder="Buscar funcionário por nome ou email..."
        value={searchQuery}
        onChange={onSearchChange}
        className="pl-9 w-full"
      />
    </div>
  );
};

export default EmployeeSearch;
