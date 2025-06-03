import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import AddSingleEmployeeForm from './AddSingleEmployeeForm';
import LinkEmployeeForm from './LinkEmployeeForm';
import BulkEmployeeUpload from './BulkEmployeeUpload';
import { AddSingleEmployeeFormValues, LinkEmployeeFormValues } from './employeeSchema';
import { checkLicenseAvailability } from '@/services/licenseService';
interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
  companyId: number;
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

      // Inserir novo funcionário
      const {
        error
      } = await supabase.from('user_profiles').insert({
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        senha: data.senha,
        id_empresa: companyId,
        status: false,
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
  const handleLinkEmployeeSubmit = async (data: LinkEmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      // Verificar licenças novamente antes de vincular
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

      // Buscar funcionário pelo email
      const {
        data: existingUser,
        error: searchError
      } = await supabase.from('user_profiles').select('id, id_empresa').eq('email', data.email).single();
      if (searchError) {
        if (searchError.code === 'PGRST116') {
          toast({
            title: "Usuário não encontrado",
            description: "Não encontramos um usuário com este email.",
            variant: "destructive"
          });
        } else {
          throw searchError;
        }
        return;
      }
      if (existingUser.id_empresa) {
        toast({
          title: "Usuário já vinculado",
          description: "Este usuário já está vinculado a uma empresa.",
          variant: "destructive"
        });
        return;
      }

      // Vincular usuário à empresa
      const {
        error: updateError
      } = await supabase.from('user_profiles').update({
        id_empresa: companyId,
        license_status: 'active' // Definir como active para consumir uma licença
      }).eq('id', existingUser.id);
      if (updateError) throw updateError;
      toast({
        title: "Funcionário vinculado",
        description: "O funcionário foi vinculado à sua empresa com sucesso."
      });
      onEmployeeAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao vincular funcionário:', error);
      toast({
        title: "Erro",
        description: `Não foi possível vincular o funcionário: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
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
          <DialogTitle className="text-xl   text-neutral-700">Convidar Funcionário</DialogTitle>
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
            <LinkEmployeeForm onSubmit={handleLinkEmployeeSubmit} isSubmitting={isSubmitting} />
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