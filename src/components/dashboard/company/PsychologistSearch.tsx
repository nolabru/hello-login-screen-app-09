import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
interface PsychologistSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const PsychologistSearch: React.FC<PsychologistSearchProps> = ({
  searchQuery,
  onSearchChange
}) => {
  return <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input placeholder="Buscar psicólogo por nome, email ou CRP..." value={searchQuery} onChange={onSearchChange} className="pl-6 w-full" />
    </div>;
};
export default PsychologistSearch;