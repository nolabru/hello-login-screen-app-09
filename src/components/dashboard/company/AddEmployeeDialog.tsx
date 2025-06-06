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
import { checkLicenseAvailability } from '@/services/licenseService';
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

      console.log('Adicionando novo funcionário com company_id:', companyId, 'tipo:', typeof companyId);
      
      // Inserir novo funcionário
      const {
        error
      } = await supabase.from('user_profiles').insert({
        name: data.nome, // Usando 'name' no banco, mas 'nome' no formulário
        email: data.email,
        cpf: data.cpf,
        password: data.senha, // Usando 'password' no banco, mas 'senha' no formulário
        company_id: companyId,
        status: true, // Definir como true por padrão, já que não usamos mais a distinção na interface
        license_status: 'active' // Definir como active para consumir uma licença
      });
      if (error) throw error;
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
            <AddSingleEmployeeForm onSubmit={handleSingleEmployeeSubmit} isSubmitting={isSubmitting} />
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
