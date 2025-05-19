
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import RegistrationLayout from '@/components/layout/RegistrationLayout';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Validation schema for the company registration form
const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  legalName: z.string().min(2, { message: 'Razão social é obrigatória' }),
  corporateEmail: z.string().email({ message: 'Email corporativo válido é obrigatório' }),
  cnpj: z.string().min(14, { message: 'CNPJ válido é obrigatório' }),
  contactEmail: z.string().email({ message: 'Email de contato válido é obrigatório' }),
  contactPhone: z.string().min(10, { message: 'Telefone de contato válido é obrigatório' }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const CompanyRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      // Insert the company data into the companies table
      const { error } = await supabase.from('companies').insert({
        name: data.companyName,
        razao_social: data.legalName,
        email: data.corporateEmail,
        cnpj: data.cnpj,
        contact_email: data.contactEmail,
        senha: 'temporary_password' // In a real app, you would implement proper password handling
      });

      if (error) throw error;

      // Show success toast and redirect to login page
      toast({
        title: "Cadastro realizado com sucesso",
        description: "O cadastro da empresa foi realizado. Em breve entraremos em contato.",
      });
      
      // In a real application, you would implement email verification and proper onboarding
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error registering company:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao cadastrar a empresa. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <RegistrationLayout>
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
              </div>

              <div className="flex justify-end pt-8">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-button text-white rounded-lg hover:opacity-90 transition"
                >
                  Cadastrar
                </button>
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
    </RegistrationLayout>
  );
};

export default CompanyRegistration;
