
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { Search, User } from 'lucide-react';
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

  return (
    <>
      <Helmet>
        <title>Funcionários | Área do Admin</title>
      </Helmet>
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-medium mb-2">Funcionários</h1>
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
                  <TableHead className="font-medium">Empresa</TableHead>
                  <TableHead className="font-medium">CPF</TableHead>
                  <TableHead className="font-medium">Telefone</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Licença</TableHead>
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
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        >
                          {employee.company_name}
                        </Badge>
                      </TableCell>
                      <TableCell>{employee.cpf}</TableCell>
                      <TableCell>{employee.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={employee.status ? 'default' : 'destructive'}
                          className={employee.status ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        >
                          {employee.status ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={employee.license_status === 'active' ? 
                            'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200' : 
                            'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'}
                        >
                          {employee.license_status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
    </>
  );
};

export default AdminEmployees;
