
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, User, Trash2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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

interface Employee {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  status: boolean;
  license_status: string | null;
  phone: string | null;
  company_name?: string;
  id_empresa: number | null;
}

const AdminEmployees: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const { data: employees, isLoading, error } = useQuery({
    queryKey: ['adminEmployees'],
    queryFn: async () => {
      // First fetch all users that belong to companies
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*, companies:id_empresa(name)')
        .filter('id_empresa', 'not.is', null)
        .order('nome', { ascending: true });
        
      if (userError) {
        console.error("Error fetching employees:", userError);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar a lista de funcionários.",
          variant: "destructive"
        });
        throw userError;
      }
      
      // Transform the data to include company name
      const employeesData = userData.map(user => ({
        ...user,
        company_name: user.companies?.name || 'Não informado'
      })) as Employee[];
      
      return employeesData;
    }
  });
  
  const filteredEmployees = employees?.filter(employee => {
    const searchLower = searchQuery.toLowerCase();
    return (
      employee.nome?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.cpf?.includes(searchQuery) ||
      employee.company_name?.toLowerCase().includes(searchLower) ||
      (employee.phone && employee.phone.includes(searchQuery))
    );
  });

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', employeeToDelete.id);

      if (error) throw error;

      toast({
        title: "Funcionário removido",
        description: `O funcionário ${employeeToDelete.nome} foi removido com sucesso.`,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Erro ao remover funcionário",
        description: "Não foi possível remover o funcionário. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Funcionários | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-neutral-700">Funcionários</h1>
            <p className="text-gray-500">Gerencie todos os funcionários vinculados às empresas</p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="text-gray-400" size={20} />
                <Input
                  placeholder="Buscar funcionário por nome, email, CPF ou empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Carregando funcionários...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erro ao carregar dados. Por favor, tente novamente.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">Nome</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium text-center">Empresa</TableHead>
                  <TableHead className="font-medium">CPF</TableHead>
                  <TableHead className="font-medium">Telefone</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Licença</TableHead>
                  <TableHead className="text-right font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees && filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        {employee.nome}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="indigo"
                          className="bg-blue-100 text-blue-800 px-3 py-1.5 flex flex-col items-center justify-center w-40 mx-auto"
                        >
                          {employee.company_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.cpf}</TableCell>
                      <TableCell>{employee.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.status ? 'success' : 'destructive'}
                        >
                          {employee.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={employee.license_status === 'active' ? 
                            'bg-purple-100 text-purple-800 border-purple-200' : 
                            'bg-gray-100 text-gray-800 border-gray-200'}
                        >
                          {employee.license_status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(employee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchQuery 
                        ? 'Nenhum funcionário encontrado para essa busca.' 
                        : 'Nenhum funcionário cadastrado no sistema.'}
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
              Tem certeza que deseja excluir o funcionário {employeeToDelete?.nome}? Esta ação não pode ser desfeita.
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

export default AdminEmployees;
