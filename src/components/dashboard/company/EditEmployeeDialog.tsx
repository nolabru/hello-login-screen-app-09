import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import type { Employee } from './EmployeesTableView';

type Department = Tables<'company_departments'>;

// Schema de validação
const editEmployeeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  department_id: z.string().uuid().optional().nullable(),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  companyId: string;
  onEmployeeUpdated: () => void;
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({
  open,
  onOpenChange,
  employee,
  companyId,
  onEmployeeUpdated,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department_id: null,
    },
  });

  // Buscar departamentos quando o dialog abrir
  useEffect(() => {
    if (open && companyId) {
      fetchDepartments();
    }
  }, [open, companyId]);

  // Preencher formulário com dados do funcionário
  useEffect(() => {
    if (employee && open) {
      form.reset({
        name: employee.nome || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department_id: employee.department_id || null,
      });
    }
  }, [employee, open, form]);

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
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar setores',
        description: 'Não foi possível carregar a lista de setores.',
      });
    }
  };

  const handleSubmit = async (data: EditEmployeeFormValues) => {
    if (!employee) return;

    setIsSubmitting(true);
    try {
      // Atualizar dados do funcionário
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          department_id: data.department_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'Funcionário atualizado',
        description: 'Os dados do funcionário foram atualizados com sucesso.',
      });

      onEmployeeUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o funcionário.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Funcionário</DialogTitle>
          <DialogDescription>
            Atualize as informações do funcionário.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {departments.length > 0 && (
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Sem setor</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-portal-purple hover:bg-portal-purple-dark"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;
