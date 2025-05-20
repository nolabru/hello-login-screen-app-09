
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CompanySearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

const CompanySearchBar: React.FC<CompanySearchBarProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Search className="text-gray-400" size={20} />
      <Input
        placeholder="Buscar por nome ou email..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};

export default CompanySearchBar;
