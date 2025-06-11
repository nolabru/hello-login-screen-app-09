import React from 'react';
import { Building, Mail, Phone, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { CompanyFormValues } from './CompanyFormSchema';
interface CompanyFormFieldsProps {
  form: UseFormReturn<CompanyFormValues>;
}
const CompanyFormFields: React.FC<CompanyFormFieldsProps> = ({
  form
}) => {
  return <div className="space-y-8">
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField control={form.control} name="companyName" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building size={16} className="text-portal-purple" />
                Nome da Empresa
              </FormLabel>
              <FormControl>
                <Input placeholder="Nome Comercial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="legalName" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building size={16} className="text-portal-purple" />
                Razão Social
              </FormLabel>
              <FormControl>
                <Input placeholder="Razão Social Completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="corporateEmail" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} className="text-portal-purple" />
                Email Corporativo
              </FormLabel>
              <FormControl>
                <Input placeholder="email@empresa.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="cnpj" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building size={16} className="text-portal-purple" />
                CNPJ
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="XX.XXX.XXX/0001-XX" 
                  {...field}
                  onChange={(e) => {
                    // Aplicar máscara de CNPJ
                    let value = e.target.value.replace(/\D/g, '');
                    
                    // Limitar a 14 dígitos
                    value = value.slice(0, 14);
                    
                    // Aplicar formatação XX.XXX.XXX/XXXX-XX
                    if (value.length > 12) {
                      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
                    } else if (value.length > 8) {
                      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
                    } else if (value.length > 5) {
                      value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
                    } else if (value.length > 2) {
                      value = value.replace(/^(\d{2})(\d+)$/, '$1.$2');
                    }
                    
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="contactEmail" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} className="text-portal-purple" />
                Email de Contato
              </FormLabel>
              <FormControl>
                <Input placeholder="contato@empresa.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />

        <FormField control={form.control} name="contactPhone" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={16} className="text-portal-purple" />
                Telefone de Contato
              </FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
      </div>

      {/* Password Field */}
      <div>
        <FormField control={form.control} name="password" render={({
        field
      }) => <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock size={16} className="text-portal-purple" />
                Senha
              </FormLabel>
              <FormControl>
                <Input placeholder="Senha (Mínimo 6 Caracteres)" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>} />
      </div>
    </div>;
};
export default CompanyFormFields;
