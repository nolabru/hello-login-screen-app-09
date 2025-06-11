
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PsychologistFormValues } from '@/components/psychologist/PsychologistFormSchema';

export const usePsychologistRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PsychologistFormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Criar usuário no sistema de autenticação do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { 
            user_type: 'psychologist',
            name: data.name
          },
          emailRedirectTo: 'http://localhost:8080/email-verificado' // Especificar redirecionamento após verificação
        }
      });
      
      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        
        // Tratar erro de e-mail duplicado
        if (authError.message.includes('email')) {
          toast({
            variant: 'destructive',
            title: "Erro no cadastro",
            description: "Este email já está em uso.",
          });
          return;
        }
        
        toast({
          variant: 'destructive',
          title: "Erro no cadastro",
          description: authError.message || "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
        });
        return;
      }
      
      // Verificar se o usuário foi criado com sucesso
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // 2. Inserir dados específicos do psicólogo na tabela 'psychologists'
      // Usar 'as any' para contornar problemas de tipo, já que a estrutura da tabela mudou
      const { data: insertedData, error } = await supabase
        .from('psychologists')
        .insert({
          user_id: authData.user.id, // Vincular ao usuário criado
          name: data.name,
          email: data.email,
          phone: data.phone,
          crp: data.crp,
          specialization: data.specialization,
          bio: data.biography,
          status: true
        } as any)
        .select();
      
      if (error) {
        console.error('Erro ao inserir dados:', error);
        
        // Tentar remover o usuário criado para evitar inconsistências
        try {
          // Nota: Esta operação pode requerer permissões de admin
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Erro ao remover usuário após falha:', deleteError);
        }
        
        toast({
          variant: 'destructive',
          title: "Erro no cadastro",
          description: "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
        });
        return;
      }

      // Obter o ID do psicólogo inserido
      const psychologistId = insertedData?.[0]?.id?.toString();
      
      if (psychologistId) {
        // Store psychologist ID in localStorage
        localStorage.setItem('psychologistId', psychologistId);
        localStorage.setItem('psychologistName', data.name || 'Psicólogo');
        
        // Check if there's an invite code in localStorage
        let inviteCode = localStorage.getItem('inviteCode');
        
        // If there's no direct code but there's a token, try to get the code by email
        if (!inviteCode) {
          const inviteToken = localStorage.getItem('inviteToken');
          if (inviteToken) {
            try {
              // Get the invite code by email
              const response = await fetch(`http://192.168.0.73:3000/get-invite-by-email?email=${encodeURIComponent(data.email)}`);
              const inviteData = await response.json();
              
              if (inviteData.success && inviteData.code) {
                inviteCode = inviteData.code;
                localStorage.setItem('inviteCode', inviteCode);
                localStorage.removeItem('inviteToken'); // Clear the token after getting the code
              }
            } catch (error) {
              console.error('Error getting invite by email:', error);
            }
          }
        }
        
        if (inviteCode) {
          try {
            // Process the invite
            const processResponse = await fetch('http://192.168.0.73:3000/process-invite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                code: inviteCode, 
                psychologistId 
              }),
            });
            
            const processData = await processResponse.json();
            
            if (processData.success) {
              toast({
                title: "Convite Aceito com Sucesso",
                description: "Você foi vinculado ao paciente que enviou o convite."
              });
              
              // Clear the invite code from localStorage
              localStorage.removeItem('inviteCode');
              
              // Navigate to dashboard immediately
              navigate('/dashboard');
              return;
            } else {
              console.error('Erro ao processar convite:', processData.error);
              toast({
                variant: 'destructive',
                title: "Erro ao Processar Convite",
                description: processData.error || "Ocorreu um erro ao processar o convite."
              });
            }
          } catch (error) {
            console.error('Erro ao processar convite:', error);
            toast({
              variant: 'destructive',
              title: "Erro ao Processar Convite",
              description: "Ocorreu um erro ao processar o convite. Tente novamente mais tarde."
            });
          }
        }
      }
      
      // Success message
      toast({
        title: "Cadastro Enviado!",
        description: "Seus dados foram enviados com sucesso. Verifique seu e-mail para ativar sua conta.",
      });
      
      // Navigate to verification pending page
      navigate('/verificacao-pendente', { 
        state: { 
          email: data.email,
          userType: 'psychologist'
        } 
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        variant: 'destructive',
        title: "Erro no Cadastro",
        description: "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
