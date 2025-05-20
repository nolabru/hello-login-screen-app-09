
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchUsersWithLicense } from '@/services/licenseService';
import { Employee } from '@/pages/companies/types';

interface LicenseUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  licenseId: number;
  planName: string;
}

const LicenseUsersDialog: React.FC<LicenseUsersDialogProps> = ({
  open,
  onOpenChange,
  companyId,
  licenseId,
  planName
}) => {
  const [users, setUsers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && companyId && licenseId) {
      fetchLicensedUsers();
    }
  }, [open, companyId, licenseId]);

  const fetchLicensedUsers = async () => {
    setLoading(true);
    try {
      const usersData = await fetchUsersWithLicense(companyId, licenseId);
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao buscar usuários com licença:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Usuários com Licença Ativa - {planName}</DialogTitle>
          <DialogDescription>
            Listagem dos funcionários que possuem licenças ativas neste plano.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <p>Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p>Não há usuários utilizando este plano de licença no momento.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Ativa
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LicenseUsersDialog;
