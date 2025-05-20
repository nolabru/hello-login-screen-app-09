
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
    <Input
      placeholder="Buscar funcionário por nome ou email..."
      value={searchQuery}
      onChange={onSearchChange}
      className="max-w-md"
      icon={Search}
    />
  );
};

export default EmployeeSearch;
