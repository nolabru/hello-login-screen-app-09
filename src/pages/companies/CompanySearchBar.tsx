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
  return;
};
export default CompanySearchBar;