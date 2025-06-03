import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LinkEmployeeFormValues, linkEmployeeSchema } from './employeeSchema';
interface LinkEmployeeFormProps {
  onSubmit: (data: LinkEmployeeFormValues) => void;
  isSubmitting: boolean;
}
const LinkEmployeeForm: React.FC<LinkEmployeeFormProps> = ({
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<LinkEmployeeFormValues>({
    resolver: zodResolver(linkEmployeeSchema),
    defaultValues: {
      email: ''
    }
  });
  return <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({
        field
      }) => <FormItem>
              <FormLabel>Email do Funcionário</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full bg-portal-purple hover:bg-portal-purple-dark">
            {isSubmitting ? "Vinculando..." : "Vincular Funcionário"}
          </Button>
        </div>
      </form>
    </Form>;
};
export default LinkEmployeeForm;