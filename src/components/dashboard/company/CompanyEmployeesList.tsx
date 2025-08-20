import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, UserMinus, Users, Search, Filter, UserPlus } from 'lucide-react';
import AddEmployeeDialog from './AddEmployeeDialog';
import EditEmployeeDialog from './EditEmployeeDialog';
import EmployeesTableView from './EmployeesTableView';
import EmployeesEmptyState from './EmployeesEmptyState';
import { Input } from '@/components/ui/input';
import type { Employee } from './EmployeesTableView';
import { updateEmployeeLicenseStatus } from '@/services/licenseService';
import { AuthService } from '@/services/authService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CompanyEmployeesList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 CompanyEmployeesList: Inicializando autenticação...');
      
      // Usar o AuthService padronizado
      const validatedId = await AuthService.getValidatedCompanyId();
      
      if (validatedId) {
        console.log('✅ CompanyEmployeesList: Company ID validado:', validatedId);
        setCompanyId(validatedId);
      } else {
        console.error('❌ CompanyEmployeesList: Company ID não encontrado');
        toast({
          variant: 'destructive',
          title: 'Erro de autenticação',
          description: 'Não foi possível validar sua empresa. Faça login novamente.'
        });
      }
    };

    initializeAuth();
  }, [toast]);
  
  useEffect(() => {
    if (companyId) {
      console.log('📋 CompanyEmployeesList: Carregando funcionários para empresa:', companyId);
      fetchEmployees();
    }
  }, [companyId]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEmployees(employees.filter(employee => 
        employee.nome?.toLowerCase().includes(query) || 
        employee.email?.toLowerCase().includes(query)
      ));
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
      
      // Primeiro, vamos tentar com o ID como string - SEM join por enquanto
      let { data, error } = await supabase.from('user_profiles')
        .select('*')
        .eq('company_id', companyId);
        
      console.log('Resultado da consulta com ID como string:', { data, error });
      
      // Se não funcionou com string, tentar com número convertido para string
      if (!data || data.length === 0) {
        console.log('Tentando consulta com ID como número convertido para string...');
        const companyIdNumStr = companyIdNum.toString();
        const result = await supabase.from('user_profiles')
          .select('*')
          .eq('company_id', companyIdNumStr);
          
        data = result.data;
        error = result.error;
        console.log('Resultado da consulta com ID como número:', { data, error });
      }
      
      if (error) throw error;
      
      console.log('Dados retornados pela consulta:', data);
      console.log('Número de funcionários encontrados:', data?.length || 0);

      // Buscar departamentos separadamente se houver funcionários com department_id
      let departmentsMap: Record<string, string> = {};
      if (data && data.length > 0) {
        const departmentIds = data
          .map(e => e.department_id)
          .filter(Boolean);
        
        if (departmentIds.length > 0) {
          const { data: departments } = await supabase
            .from('company_departments')
            .select('id, name')
            .in('id', departmentIds);
          
          if (departments) {
            departmentsMap = departments.reduce((acc, dept) => {
              acc[dept.id] = dept.name;
              return acc;
            }, {} as Record<string, string>);
          }
        }
      }

      // Map the data to include only necessary fields and map correct fields from database
      const mappedEmployees = data?.map(employee => {
        console.log('Mapeando funcionário:', employee);
        
        // Usar uma abordagem segura para acessar os campos, já que a estrutura pode variar
        const employeeData = employee as any; // Usar any para evitar erros de tipo
        
        return {
          id: employeeData.id,
          nome: employeeData.full_name || employeeData.preferred_name || employeeData.name || 'Nome não disponível',
          email: employeeData.email || employeeData.user_id || '',
          status: employeeData.license_status === 'active', // Usar license_status para compatibilidade
          employee_status: employeeData.license_status || 'pending', // Usar license_status como employee_status
          connection_status: 'active', // Mantemos o campo para compatibilidade, mas não o usamos na interface
          phone: employeeData.phone_number || employeeData.phone || undefined,
          profile_photo: employeeData.profile_photo,
          gender: employeeData.gender,
          age_range: employeeData.age_range,
          created_at: employeeData.created_at,
          license_status: employeeData.license_status,
          department_id: employeeData.department_id,
          department_name: employeeData.department_id ? departmentsMap[employeeData.department_id] || 'Não atribuído' : 'Não atribuído'
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
    // Abrir o diálogo de confirmação
    setEmployeeToRemove(employeeId);
    setIsConfirmDialogOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setIsEditDialogOpen(true);
  };

  const confirmRemoveEmployee = async () => {
    if (!employeeToRemove) return;
    
    try {
      // Atualizar o status do funcionário para 'inactive' e decrementar o contador de licenças
      await updateEmployeeLicenseStatus(employeeToRemove, 'inactive');
      
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
    } finally {
      // Fechar o diálogo e limpar o estado
      setIsConfirmDialogOpen(false);
      setEmployeeToRemove(null);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Carregando funcionários...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (filteredEmployees.length === 0) {
      return <EmployeesEmptyState onAddEmployee={() => setIsAddDialogOpen(true)} />;
    }
    
    return <EmployeesTableView employees={filteredEmployees} onRemoveEmployee={handleRemoveEmployee} onEditEmployee={handleEditEmployee} />;
  };
  
  return (
    <div className="space-y-6">
      {/* Controles de Ação */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Funcionários da Empresa
            </CardTitle>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-calma hover:bg-calma-dark"
            >
              <Plus className="h-4 w-4 mr-2" />
              Convidar Funcionário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra de Busca e Filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Conteúdo */}
          {renderContent()}
        </CardContent>
      </Card>
      
      {companyId && (
        <>
          <AddEmployeeDialog 
            open={isAddDialogOpen} 
            onOpenChange={setIsAddDialogOpen} 
            onEmployeeAdded={fetchEmployees} 
            companyId={companyId} 
          />
          
          <EditEmployeeDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            employee={employeeToEdit}
            companyId={companyId}
            onEmployeeUpdated={fetchEmployees}
          />
        </>
      )}
      
      {/* Diálogo de confirmação para desvincular funcionário */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <UserMinus className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Desvincular Funcionário</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tem certeza que deseja desvincular este funcionário da empresa?
              <p className="mt-2 text-sm text-gray-500">
                Esta ação liberará a licença associada a este funcionário.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveEmployee}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CompanyEmployeesList;
