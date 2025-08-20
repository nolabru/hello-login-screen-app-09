import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import AddSingleEmployeeForm from './AddSingleEmployeeForm';
import BulkEmployeeUpload from './BulkEmployeeUpload';
import EmployeeSearchDialog from './EmployeeSearchDialog';
import { AddSingleEmployeeFormValues } from './employeeSchema';
import { checkLicenseAvailability, updateEmployeeLicenseStatus } from '@/services/licenseService';
import { Tables } from '@/integrations/supabase/types';

type Department = Tables<'company_departments'>;

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
  companyId: string;
}
const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({
  open,
  onOpenChange,
  onEmployeeAdded,
  companyId
}) => {
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('add');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAvailableLicenses, setHasAvailableLicenses] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Fetch departments when dialog opens
  useEffect(() => {
    if (open && companyId) {
      fetchDepartments();
    }
  }, [open, companyId]);
  
  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('company_departments')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
    }
  };
  
  useEffect(() => {
    if (open) {
      const checkLicenses = async () => {
        try {
          const {
            available
          } = await checkLicenseAvailability(companyId);
          console.log('Licenças disponíveis:', available);
          setHasAvailableLicenses(available > 0);
          if (available <= 0) {
            toast({
              title: "Sem licenças disponíveis",
              description: "Você não possui licenças disponíveis para adicionar funcionários. Adquira mais licenças na aba de Licenças.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Erro ao verificar licenças disponíveis:', error);
        }
      };
      checkLicenses();
    }
  }, [open, companyId, toast]);
  const handleSingleEmployeeSubmit = async (data: AddSingleEmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      // Verificar licenças novamente antes de adicionar
      const {
        available
      } = await checkLicenseAvailability(companyId);
      if (available <= 0) {
        toast({
          title: "Sem licenças disponíveis",
          description: "Você não possui licenças disponíveis para adicionar funcionários. Adquira mais licenças na aba de Licenças.",
          variant: "destructive"
        });
        onOpenChange(false);
        return;
      }

      // Logs detalhados para debug
      console.log('=== DADOS DO FORMULÁRIO ===');
      console.log('Dados recebidos:', data);
      console.log('Company ID:', companyId, 'tipo:', typeof companyId);
      
      // Processar department_id corretamente - tratar "no-department" como null
      const processedDepartmentId = data.department_id === 'no-department' ? null : data.department_id;
      console.log('Department ID original:', data.department_id);
      console.log('Department ID processado:', processedDepartmentId);
      
      const insertData = {
        email: data.email,
        full_name: data.nome,
        preferred_name: data.nome,
        company_id: companyId,
        department_id: processedDepartmentId,
        employee_status: 'pending',
        // Campos obrigatórios com valores mínimos
        gender: 'N/A',
        age_range: 'N/A',
        aia_objectives: [],
        mental_health_experience: 'N/A'
      };
      
      console.log('=== DADOS PARA INSERÇÃO ===');
      console.log('Dados para inserir:', insertData);
      
      // Inserir novo funcionário (usando casting para contornar tipos desatualizados)
      const { data: newEmployee, error } = await supabase
        .from('user_profiles')
        .insert(insertData as any)
        .select('id')
        .single();
      
      console.log('=== RESULTADO DA INSERÇÃO ===');
      console.log('Novo funcionário:', newEmployee);
      console.log('Erro (se houver):', error);
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }
      
      // Incrementar o contador de licenças usadas
      if (newEmployee) {
        await updateEmployeeLicenseStatus(newEmployee.id, 'active', companyId);
      }
      toast({
        title: "Funcionário adicionado",
        description: "O funcionário foi adicionado com sucesso e receberá um convite por email."
      });
      onEmployeeAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao adicionar funcionário:', error);
      toast({
        title: "Erro",
        description: `Não foi possível adicionar o funcionário: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Estado para controlar a abertura do diálogo de busca de funcionários
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  if (!hasAvailableLicenses) {
    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Sem Licenças Disponíveis</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="mb-4">
              Sua empresa não possui licenças disponíveis para adicionar novos funcionários.
            </p>
            <p>
              Acesse a aba de <strong>Licenças</strong> para adquirir mais licenças e poder adicionar novos funcionários.
            </p>
          </div>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-md text-neutral-700">Convidar Funcionário</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="add">Novo Funcionário</TabsTrigger>
            <TabsTrigger value="link">Vincular Existente</TabsTrigger>
            <TabsTrigger value="bulk">Importar CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="py-2">
            <AddSingleEmployeeForm 
              onSubmit={handleSingleEmployeeSubmit} 
              isSubmitting={isSubmitting}
              departments={departments}
            />
          </TabsContent>

          <TabsContent value="link" className="py-2">
            <div className="text-center py-4">
              <p className="mb-6 text-neutral-400 text-sm">Busque um Usuário que já usa o C'Alma e o Vincule a sua Empresa.</p>
              <Button 
                onClick={() => setIsSearchDialogOpen(true)} 
                className="bg-portal-purple hover:bg-portal-purple-dark"
              >
                Buscar Funcionário
              </Button>
            </div>
            
            {/* Diálogo de busca de funcionários */}
            <EmployeeSearchDialog 
              open={isSearchDialogOpen} 
              onOpenChange={setIsSearchDialogOpen} 
              companyId={companyId} 
              onEmployeeLinked={onEmployeeAdded} 
            />
          </TabsContent>
          
          <TabsContent value="bulk" className="py-2">
            <BulkEmployeeUpload companyId={companyId} onComplete={() => {
            onEmployeeAdded();
            onOpenChange(false);
          }} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
};
export default AddEmployeeDialog;
