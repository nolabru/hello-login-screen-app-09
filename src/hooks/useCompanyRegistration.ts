
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
      // 1. Criar usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.corporateEmail,
        password: data.password,
        options: {
          data: { 
            user_type: 'company',
            name: data.companyName
          },
          emailRedirectTo: 'http://localhost:8080/email-verificado' // Especificar redirecionamento após verificação
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        
        // Tratar erro de e-mail duplicado
        if (authError.message.includes('email')) {
          toast({
            title: "Erro no cadastro",
            description: "Este email já está em uso.",
            variant: "destructive"
          });
          return;
        }
        
        toast({
          title: "Erro no cadastro",
          description: authError.message || "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      // Verificar se o usuário foi criado com sucesso
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // 2. Inserir dados específicos da empresa na tabela 'companies'
      // Usar 'as any' para contornar problemas de tipo, já que a estrutura da tabela mudou
      const { error } = await supabase.from('companies').insert({
        user_id: authData.user.id, // Vincular ao usuário criado
        name: data.companyName,
        legal_name: data.legalName,
        email: data.corporateEmail,
        cnpj: data.cnpj,
        corp_email: data.contactEmail,
        phone: data.contactPhone
      } as any);

      if (error) {
        console.error('Erro ao inserir dados da empresa:', error);
        
        // Tentar remover o usuário criado para evitar inconsistências
        try {
          // Nota: Esta operação pode requerer permissões de admin
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Erro ao remover usuário após falha:', deleteError);
        }
        
        toast({
          title: "Erro no cadastro",
          description: "Ocorreu um erro ao cadastrar a empresa. Por favor, tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Show success toast and redirect to verification pending page
      toast({
        title: "Cadastro realizado com sucesso",
        description: "O cadastro da empresa foi realizado. Verifique seu e-mail para ativar sua conta.",
      });
      
      // Navigate to verification pending page
      navigate('/verificacao-pendente', { 
        state: { 
          email: data.corporateEmail,
          userType: 'company'
        } 
      });
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
