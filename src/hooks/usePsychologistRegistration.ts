
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
          nome: data.name,
          email: data.email,
          phone: data.phone,
          crp: data.crp,
          especialidade: data.specialization,
          bio: data.biography,
          senha: data.password,
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
