
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddSingleEmployeeFormValues, addSingleEmployeeSchema } from './employeeSchema';
import { Tables } from '@/integrations/supabase/types';

type Department = Tables<'company_departments'>;

interface AddSingleEmployeeFormProps {
  onSubmit: (data: AddSingleEmployeeFormValues) => void;
  isSubmitting: boolean;
  departments?: Department[];
}

const AddSingleEmployeeForm: React.FC<AddSingleEmployeeFormProps> = ({
  onSubmit,
  isSubmitting,
  departments = []
}) => {
  const form = useForm<AddSingleEmployeeFormValues>({
    resolver: zodResolver(addSingleEmployeeSchema),
    defaultValues: {
      nome: '',
      email: '',
      department_id: 'no-department'
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do Funcionário" {...field} />
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
        
        
        {departments.length > 0 && (
          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setor (opcional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-department">Sem setor</SelectItem>
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
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full bg-portal-purple hover:bg-portal-purple-dark">
            {isSubmitting ? "Adicionando..." : "Adicionar Funcionário"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddSingleEmployeeForm;
