
import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';

interface UserSearchProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <SearchBar
      placeholder="Buscar usuário por nome, email ou CPF..."
      value={searchQuery}
      onChange={onSearchQueryChange}
    />
  );
};

export default UserSearch;
