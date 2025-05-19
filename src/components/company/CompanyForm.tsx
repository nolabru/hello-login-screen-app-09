
import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { companyFormSchema, CompanyFormValues } from './CompanyFormSchema';
import { useCompanyRegistration } from '@/hooks/useCompanyRegistration';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const CompanyForm = () => {
  const { handleSubmit: handleRegistrationSubmit, isSubmitting } = useCompanyRegistration();
  
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
      password: '',
    },
  });

  const onSubmit = (data: CompanyFormValues) => {
    handleRegistrationSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
      <CardContent className="p-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Building size={32} className="text-portal-purple" />
          <h1 className="text-2xl font-bold">Registro de Empresa</h1>
        </div>
        
        <p className="text-gray-600 mb-10 text-center">Preencha os dados para criar uma conta empresarial</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8">
              <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                <Building size={20} className="text-portal-purple" />
                Informações da Empresa
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building size={16} />
                        Nome da Empresa
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome comercial" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building size={16} />
                        Razão Social
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Razão social completa" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="corporateEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail size={16} />
                        Email Corporativo
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@empresa.com" 
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Building size={16} />
                        CNPJ
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XX.XXX.XXX/0001-XX" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Mail size={16} />
                        Email de Contato
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="contato@empresa.com" 
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Phone size={16} />
                        Telefone de Contato
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(XX) XXXXX-XXXX" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password Field */}
              <div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Lock size={16} />
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite sua senha" 
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <Button 
                type="submit"
                className="px-6 py-3 bg-gradient-button text-white rounded-lg hover:opacity-90 transition"
                disabled={isSubmitting}
              >
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
    </Card>
  );
};

export default CompanyForm;
