import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Interface baseada no schema real
interface UserProfileWithCompany {
  id: string;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  company_id: string | null;
  employee_status: string;
  preferred_name: string;
  created_at: string;
  updated_at: string;
  company_name: string | null; // Via JOIN
}

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfileWithCompany | null>(null);

  // Fetch users with company info
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          user_id,
          full_name,
          email,
          phone_number,
          company_id,
          employee_status,
          created_at,
          updated_at,
          companies!user_profiles_companie_id_fkey(name)
        `)
        .order('full_name', { ascending: true });
        
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive"
        });
        throw error;
      }
      
      // Transform data to include company_name and full_name
      const transformedData = data?.map((user: any) => ({
        ...user,
        full_name: user.full_name, // Use full_name from database
        company_name: user.companies?.name || null
      })) || [];
      
      return transformedData as UserProfileWithCompany[];
    }
  });
  
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.preferred_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.company_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (user: UserProfileWithCompany) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userToDelete.id as any);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: `O usuário ${userToDelete.full_name || userToDelete.preferred_name} foi removido com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao remover usuário",
        description: "Não foi possível remover o usuário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Usuários | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-700">Usuários</h1>
            <p className="text-gray-500">Gerencie todos os usuários cadastrados no sistema</p>
          </div>

          <SearchBar
            placeholder="Buscar usuário por nome, email ou empresa..."
            value={searchQuery}
            onChange={setSearchQuery}
          />

          {usersLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando usuários...</p>
            </div>
          ) : usersError ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">Telefone</TableHead>
                  <TableHead className="font-medium">Empresa</TableHead>
                  <TableHead className="font-medium">Status Usuário</TableHead>
                  <TableHead className="font-medium">Status Licença</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || user.preferred_name || '-'}
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{user.phone_number || '-'}</TableCell>
                      <TableCell>{user.company_name || 'Sem empresa'}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            user.company_id 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {user.company_id ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? 'Nenhum usuário encontrado para essa busca.' 
                        : 'Nenhum usuário cadastrado no sistema.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </AdminDashboardLayout>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.full_name || userToDelete?.preferred_name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsers;
