import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
interface PatientSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  return <div className="relative w-full">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <Input type="text" placeholder="Buscar pacientes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-3 py-6 text-lg border rounded-lg bg-white" />
    </div>;
};
export default PatientSearchBar;