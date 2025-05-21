
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface UserSearchProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ searchQuery, onSearchQueryChange }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400" size={20} />
          <Input
            placeholder="Buscar usuário por nome, email ou CPF..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
