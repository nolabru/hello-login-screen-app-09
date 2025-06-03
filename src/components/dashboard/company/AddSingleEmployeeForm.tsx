import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddSingleEmployeeFormValues, addSingleEmployeeSchema } from './employeeSchema';
interface AddSingleEmployeeFormProps {
  onSubmit: (data: AddSingleEmployeeFormValues) => void;
  isSubmitting: boolean;
}
const AddSingleEmployeeForm: React.FC<AddSingleEmployeeFormProps> = ({
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<AddSingleEmployeeFormValues>({
    resolver: zodResolver(addSingleEmployeeSchema),
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      senha: ''
    }
  });
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="nome" render={({
        field
      }) => <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do funcionário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="email" render={({
        field
      }) => <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="cpf" render={({
        field
      }) => <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="CPF do funcionário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="senha" render={({
        field
      }) => {}} />
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full bg-portal-purple hover:bg-portal-purple-dark">
            {isSubmitting ? "Adicionando..." : "Adicionar Funcionário"}
          </Button>
        </div>
      </form>
    </Form>;
};
export default AddSingleEmployeeForm;