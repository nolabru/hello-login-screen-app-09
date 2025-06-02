import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { companyFormSchema, CompanyFormValues } from './CompanyFormSchema';
import { useCompanyRegistration } from '@/hooks/useCompanyRegistration';
import { Form } from '@/components/ui/form';
import CompanyFormFields from './CompanyFormFields';
const CompanyForm = () => {
  const {
    handleSubmit: handleRegistrationSubmit,
    isSubmitting
  } = useCompanyRegistration();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: '',
      legalName: '',
      corporateEmail: '',
      cnpj: '',
      contactEmail: '',
      contactPhone: '',
      password: ''
    }
  });
  const onSubmit = (data: CompanyFormValues) => {
    handleRegistrationSubmit(data);
  };
  return <Card className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
      <CardContent className="p-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          
          <h1 className="font-semibold text-2xl text-portal-purple">Registro de Empresa</h1>
        </div>
        
        <p className="text-gray-600 mb-10 text-center">Preencha os dados para criar uma conta empresarial</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CompanyFormFields form={form} />

            <div className="flex justify-end pt-8">
              <Button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-portal-purple text-white rounded-lg hover:opacity-90 transition">
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>

        <div className="text-center mt-10 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Já possui uma conta? <Link to="/" className="text-portal-purple hover:underline font-medium">Faça login</Link>
          </p>
        </div>
      </CardContent>
    </Card>;
};
export default CompanyForm;