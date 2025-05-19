
import React from 'react';
import { Building, Mail, Phone, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormValues } from './CompanyFormSchema';

interface CompanyFormFieldsProps {
  form: UseFormReturn<CompanyFormValues>;
}

const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({ form }) => {
  return (
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
  );
};

export default CompanyFormFields;
