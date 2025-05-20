
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import AddEmployeeDialog from './AddEmployeeDialog';
import EmployeeSearch from './EmployeeSearch';
import ViewModeToggle from './ViewModeToggle';
import EmployeesTableView from './EmployeesTableView';
import EmployeesCardView from './EmployeesCardView';
import EmployeesEmptyState from './EmployeesEmptyState';
import type { Employee } from './EmployeesTableView';

const CompanyEmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

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
      
      // Map the data to include connection_status
      const mappedEmployees = data?.map(employee => ({
        ...employee,
        connection_status: employee.status ? 'approved' : 'pending'
      })) || [];
      
      setEmployees(mappedEmployees);
      setFilteredEmployees(mappedEmployees);
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="py-8 text-center">
          <p className="text-gray-500">Carregando funcionários...</p>
        </div>
      );
    }
    
    if (filteredEmployees.length === 0) {
      return <EmployeesEmptyState onAddEmployee={() => setIsAddDialogOpen(true)} />;
    }
    
    return viewMode === 'table' 
      ? <EmployeesTableView 
          employees={filteredEmployees} 
          onRemoveEmployee={handleRemoveEmployee} 
        />
      : <EmployeesCardView 
          employees={filteredEmployees} 
          onRemoveEmployee={handleRemoveEmployee} 
        />;
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
      
      <div className="flex justify-between items-center mb-4">
        <EmployeeSearch 
          searchQuery={searchQuery} 
          onSearchChange={handleSearchChange}
        />
        
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode}
        />
      </div>
      
      {renderContent()}
      
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
