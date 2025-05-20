
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addSingleEmployeeSchema, AddSingleEmployeeFormValues } from './schemas/employeeSchema';

interface AddSingleEmployeeFormProps {
  onSubmit: (values: AddSingleEmployeeFormValues) => void;
  isLoading: boolean;
}

const AddSingleEmployeeForm: React.FC<AddSingleEmployeeFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<AddSingleEmployeeFormValues>({
    resolver: zodResolver(addSingleEmployeeSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      senha: '',
    },
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
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="CPF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input placeholder="Senha" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Adicionar Funcionário'}
        </Button>
      </form>
    </Form>
  );
};

export default AddSingleEmployeeForm;
