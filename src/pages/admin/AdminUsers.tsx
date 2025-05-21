
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, User, Trash2, Building2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableRow, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  status: boolean;
  phone: string | null;
  id_empresa: number | null;
}

interface Company {
  id: number;
  name: string;
}

const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<UserProfile | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('nome', { ascending: true });
        
      if (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as UserProfile[];
    }
  });

  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name', { ascending: true });
        
      if (error) {
        console.error("Error fetching companies:", error);
        toast({
          title: "Erro ao carregar empresas",
          description: "Não foi possível carregar a lista de empresas.",
          variant: "destructive"
        });
        throw error;
      }
      
      return data as Company[];
    }
  });
  
  const filteredUsers = users?.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.nome?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.cpf?.includes(searchQuery) ||
      (user.phone && user.phone.includes(searchQuery))
    );
  });

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: `O usuário ${userToDelete.nome} foi removido com sucesso.`,
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

  const handleAssignClick = (user: UserProfile) => {
    setUserToAssign(user);
    setSelectedCompanyId(user.id_empresa ? String(user.id_empresa) : '');
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = async () => {
    if (!userToAssign) return;
    
    try {
      // Update the user with the selected company ID
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          id_empresa: selectedCompanyId ? parseInt(selectedCompanyId) : null 
        })
        .eq('id', userToAssign.id);

      if (error) throw error;

      const companyName = selectedCompanyId 
        ? companies?.find(c => c.id === parseInt(selectedCompanyId))?.name 
        : 'nenhuma empresa';

      toast({
        title: "Usuário atualizado",
        description: `${userToAssign.nome} foi atribuído a ${companyName}.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch (error) {
      console.error("Error assigning user to company:", error);
      toast({
        title: "Erro ao atribuir usuário",
        description: "Não foi possível atribuir o usuário à empresa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setAssignDialogOpen(false);
      setUserToAssign(null);
      setSelectedCompanyId('');
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
            <h1 className="text-3xl font-medium mb-2">Usuários</h1>
            <p className="text-gray-500">Gerencie todos os usuários cadastrados no sistema</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <Input
                  placeholder="Buscar usuário por nome, email ou CPF..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

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
                  <TableHead className="font-medium">CPF</TableHead>
                  <TableHead className="font-medium">Telefone</TableHead>
                  <TableHead className="font-medium">Empresa</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Tipo</TableHead>
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
                          className={user.id_empresa ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}
                        >
                          {user.id_empresa ? 'Funcionário' : 'Paciente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleAssignClick(user)}
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(user)}
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
          )}
        </div>
      </AdminDashboardLayout>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {userToDelete?.nome}? Esta ação não pode ser desfeita.
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

      {/* Assign Company Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Empresa</DialogTitle>
            <DialogDescription>
              Selecione a empresa para o usuário {userToAssign?.nome}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="company" className="text-sm font-medium">
                Empresa
              </label>
              {companiesLoading ? (
                <div>Carregando empresas...</div>
              ) : (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma empresa</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={String(company.id)}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignConfirm}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
