
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Trash2, Building2 } from 'lucide-react';
import { UserProfile } from '@/types/user';
import { Company } from '@/types/company';

interface UserTableProps {
  users: UserProfile[] | undefined;
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  companies: Company[] | undefined;
  onAssignClick: (user: UserProfile) => void;
  onDeleteClick: (user: UserProfile) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  error,
  searchQuery,
  companies,
  onAssignClick,
  onDeleteClick
}) => {
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.nome?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.cpf?.includes(searchQuery) ||
      (user.phone && user.phone.includes(searchQuery))
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Email</TableHead>
          <TableHead className="font-medium">CPF</TableHead>
          <TableHead className="font-medium">Telefone</TableHead>
          <TableHead className="font-medium">Empresa</TableHead>
          <TableHead className="font-medium">Status</TableHead>
          <TableHead className="font-medium">Licença</TableHead>
          <TableHead className="text-right font-medium">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredUsers && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium flex items-center">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                {user.nome}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.cpf}</TableCell>
              <TableCell>{user.phone || '-'}</TableCell>
              <TableCell>
                {user.id_empresa ? (
                  <Badge 
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 flex flex-col items-center justify-center w-40"
                  >
                    {companies?.find(c => c.id === user.id_empresa)?.name || 'Carregando...'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500">
                    Sem empresa
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  className={user.status ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}
                >
                  {user.status ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  className={user.license_status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
                >
                  {user.license_status === 'active' ? 'Ativa' : 'Inativa'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onAssignClick(user)}
                  >
                    <Building2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteClick(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              {searchQuery 
                ? 'Nenhum usuário encontrado para essa busca.' 
                : 'Nenhum usuário cadastrado no sistema.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
