
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { User, Plus, UserPlus } from 'lucide-react';
import AddEmployeeDialog from './AddEmployeeDialog';
import { Input } from '@/components/ui/input';

const CompanyEmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(parseInt(storedCompanyId, 10));
    }
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEmployees(
        employees.filter(
          employee => 
            employee.nome?.toLowerCase().includes(query) || 
            employee.email?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id_empresa', companyId);
        
      if (error) throw error;
      
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar funcionários',
        description: 'Não foi possível carregar a lista de funcionários. Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveEmployee = async (employeeId: number) => {
    if (!confirm('Tem certeza que deseja desvincular este funcionário?')) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ id_empresa: null })
        .eq('id', employeeId);
        
      if (error) throw error;
      
      toast({
        title: 'Funcionário desvinculado',
        description: 'O funcionário foi desvinculado da empresa com sucesso.',
      });
      
      fetchEmployees();
    } catch (error) {
      console.error('Erro ao desvincular funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desvincular funcionário',
        description: 'Ocorreu um erro ao desvincular o funcionário. Tente novamente.',
      });
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Ativo' : 'Pendente';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium">Funcionários</h2>
        <Button 
          className="bg-indigo-900 hover:bg-indigo-800"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Funcionário
        </Button>
      </div>
      
      <div className="mb-4">
        <Input
          placeholder="Buscar funcionário por nome ou email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">Carregando funcionários...</p>
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-6 w-6 text-indigo-500" />
                    <h3 className="font-medium">{employee.nome}</h3>
                  </div>
                  
                  <div className="text-sm text-gray-500">{employee.email}</div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}
                    >
                      {getStatusText(employee.status)}
                    </span>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleRemoveEmployee(employee.id)}
                    >
                      Desvincular
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-gray-500">Nenhum funcionário encontrado.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Funcionário
          </Button>
        </div>
      )}
      
      {companyId && (
        <AddEmployeeDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onEmployeeAdded={fetchEmployees}
          companyId={companyId}
        />
      )}
    </div>
  );
};

export default CompanyEmployeesList;
