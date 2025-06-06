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
import { updateEmployeeLicenseStatus } from '@/services/licenseService';

const CompanyEmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const {
    toast
  } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
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
      setFilteredEmployees(employees.filter(employee => employee.nome?.toLowerCase().includes(query) || employee.email?.toLowerCase().includes(query)));
    }
  }, [searchQuery, employees]);
  const fetchEmployees = async () => {
    if (!companyId) return;
    setIsLoading(true);
    try {
      console.log('Buscando funcionários para a empresa ID:', companyId);
      console.log('Tipo do companyId:', typeof companyId);
      
      // Tentar converter para número para ver se isso resolve o problema
      const companyIdNum = parseInt(companyId, 10);
      console.log('companyId convertido para número:', companyIdNum);
      
      // Primeiro, vamos tentar com o ID como string
      let { data, error } = await supabase.from('user_profiles').select('*')
        .eq('company_id', companyId);
        
      console.log('Resultado da consulta com ID como string:', { data, error });
      
      // Se não funcionou com string, tentar com número convertido para string
      if (!data || data.length === 0) {
        console.log('Tentando consulta com ID como número convertido para string...');
        const companyIdNumStr = companyIdNum.toString();
        const result = await supabase.from('user_profiles').select('*')
          .eq('company_id', companyIdNumStr);
          
        data = result.data;
        error = result.error;
        console.log('Resultado da consulta com ID como número:', { data, error });
      }
      
      if (error) throw error;
      
      console.log('Dados retornados pela consulta:', data);
      console.log('Número de funcionários encontrados:', data?.length || 0);

      // Map the data to include only necessary fields and map correct fields from database
      const mappedEmployees = data?.map(employee => {
        console.log('Mapeando funcionário:', employee);
        
        // Usar uma abordagem segura para acessar os campos, já que a estrutura pode variar
        const employeeData = employee as any; // Usar any para evitar erros de tipo
        
        return {
          id: employeeData.id,
          nome: employeeData.full_name || employeeData.preferred_name || employeeData.name || 'Nome não disponível',
          email: employeeData.email || employeeData.user_id || '',
          status: employeeData.employee_status === 'active', // Converter para booleano para compatibilidade
          employee_status: employeeData.employee_status || 'pending', // Usar o novo campo diretamente
          connection_status: 'active', // Mantemos o campo para compatibilidade, mas não o usamos na interface
          phone: employeeData.phone_number || employeeData.phone || undefined,
          profile_photo: employeeData.profile_photo,
          gender: employeeData.gender,
          age_range: employeeData.age_range,
          created_at: employeeData.created_at,
          license_status: employeeData.license_status
        };
      }) || [];
      
      console.log('Funcionários mapeados:', mappedEmployees);
      
      setEmployees(mappedEmployees);
      setFilteredEmployees(mappedEmployees);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar funcionários',
        description: 'Não foi possível carregar a lista de funcionários. Tente novamente mais tarde.'
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
      // Primeiro, marcar a licença como inativa para liberar a licença
      await updateEmployeeLicenseStatus(employeeId, 'inactive');

      // Em seguida, desvincular o funcionário da empresa
      const {
        error
      } = await supabase.from('user_profiles').update({
        company_id: null,
        employee_status: 'pending' // Atualizar para 'pending' quando desvinculado
      }).eq('id', employeeId);
      if (error) throw error;
      toast({
        title: 'Funcionário desvinculado',
        description: 'O funcionário foi desvinculado da empresa com sucesso e a licença foi liberada.'
      });
      fetchEmployees();
    } catch (error) {
      console.error('Erro ao desvincular funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao desvincular funcionário',
        description: 'Ocorreu um erro ao desvincular o funcionário. Tente novamente.'
      });
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return <div className="py-8 text-center">
          <p className="text-gray-500">Carregando Funcionários...</p>
        </div>;
    }
    if (filteredEmployees.length === 0) {
      return <EmployeesEmptyState onAddEmployee={() => setIsAddDialogOpen(true)} />;
    }
    return viewMode === 'table' ? <EmployeesTableView employees={filteredEmployees} onRemoveEmployee={handleRemoveEmployee} /> : <EmployeesCardView employees={filteredEmployees} onRemoveEmployee={handleRemoveEmployee} />;
  };
  return <div className="space-y-4">
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-portal-purple hover:bg-portal-purple-dark">
          <Plus className="h-4 w-4 mr-2" />
          Convidar Funcionário
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <EmployeeSearch searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      
      {renderContent()}
      
      {companyId && <AddEmployeeDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onEmployeeAdded={fetchEmployees} companyId={companyId} />}
    </div>;
};
export default CompanyEmployeesList;
