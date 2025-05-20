
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { linkEmployeeSchema, LinkEmployeeFormValues } from './schemas/employeeSchema';

interface LinkEmployeeFormProps {
  onSubmit: (values: LinkEmployeeFormValues) => void;
  isLoading: boolean;
}

const LinkEmployeeForm: React.FC<LinkEmployeeFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<LinkEmployeeFormValues>({
    resolver: zodResolver(linkEmployeeSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email do funcionário</FormLabel>
              <FormControl>
                <Input placeholder="Email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Vincular Funcionário'}
        </Button>
      </form>
    </Form>
  );
};

export default LinkEmployeeForm;
