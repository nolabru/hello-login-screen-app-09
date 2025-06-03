
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CompanySearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const CompanySearchBar: React.FC<CompanySearchBarProps> = ({
  searchQuery,
  onSearchQueryChange
}) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input 
        type="text" 
        placeholder="Buscar empresas..." 
        value={searchQuery} 
        onChange={(e) => onSearchQueryChange(e.target.value)} 
        className="pl-10 py-6 text-lg border rounded-lg bg-white" 
      />
    </div>
  );
};

export default CompanySearchBar;
