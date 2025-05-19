
import React from 'react';
import { Control } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, UserRound, FileText, Lock } from 'lucide-react';
import { PsychologistFormValues } from './PsychologistFormSchema';

interface PsychologistFormFieldsProps {
  control: Control<PsychologistFormValues>;
}

const PsychologistFormFields: React.FC<PsychologistFormFieldsProps> = ({ control }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <UserRound size={16} />
                Nome <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do psicólogo" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail size={16} />
                Email <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="Email do psicólogo" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone size={16} />
                Telefone
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="(00) 00000-0000" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="crp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText size={16} />
                CRP <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Número do CRP" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="specialization"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              Especialização <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Área de especialização" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="biography"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <UserRound size={16} />
              Biografia
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Breve biografia profissional (opcional)" 
                className="min-h-[120px]"
                {...field} 
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock size={16} />
              Senha <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input 
                type="password"
                placeholder="Senha (mínimo 6 caracteres)" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PsychologistFormFields;
