
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
      // Insert the psychologist data into the database
      const { data: insertedData, error } = await supabase
        .from('psychologists')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone,
          crp: data.crp,
          specialization: data.specialization,
          bio: data.biography,
          password: data.password,
          status: true
        })
        .select();
      
      if (error) {
        console.error('Error inserting data:', error);
        
        // Handle duplicate email error
        if (error.code === '23505' && error.message.includes('email')) {
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
          description: "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
        });
        return;
      }

      // Get the inserted psychologist ID
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
                title: "Convite aceito com sucesso",
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
                title: "Erro ao processar convite",
                description: processData.error || "Ocorreu um erro ao processar o convite."
              });
            }
          } catch (error) {
            console.error('Erro ao processar convite:', error);
            toast({
              variant: 'destructive',
              title: "Erro ao processar convite",
              description: "Ocorreu um erro ao processar o convite. Tente novamente mais tarde."
            });
          }
        }
      }
      
      // Success message
      toast({
        title: "Cadastro enviado!",
        description: "Seus dados foram enviados com sucesso.",
      });
      
      // Navigate to home after successful registration
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        variant: 'destructive',
        title: "Erro no cadastro",
        description: "Houve um problema ao registrar seus dados. Por favor, tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
};
