
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompanyFormValues } from '@/components/company/CompanyFormSchema';

export const useCompanyRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      // Insert the company data into the companies table
      const { error } = await supabase.from('companies').insert({
        name: data.companyName,
        legal_name: data.legalName,
        email: data.corporateEmail,
        cnpj: data.cnpj,
        corp_email: data.contactEmail,
        password: data.password, // Use the password from form
        phone: data.contactPhone // Adding phone field
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
