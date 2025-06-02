
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { psychologistFormSchema, PsychologistFormValues } from './PsychologistFormSchema';
import PsychologistFormFields from './PsychologistFormFields';
import { usePsychologistRegistration } from '@/hooks/usePsychologistRegistration';

const PsychologistForm: React.FC = () => {
  const { handleSubmit: handleRegistrationSubmit, isSubmitting } = usePsychologistRegistration();
  const navigate = useNavigate();
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<PsychologistFormValues>({
    resolver: zodResolver(psychologistFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      crp: '',
      specialization: '',
      biography: '',
      password: '',
    },
  });

  const onSubmit = (data: PsychologistFormValues) => {
    handleRegistrationSubmit(data);
  };

  return (
    <Card className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <CardContent className="p-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <UserRound size={32} className="text-portal-purple" />
          <h1 className="text-2xl font-display font-bold text-gray-800">Registro de Psicólogo</h1>
        </div>
        <p className="text-gray-600 mb-8 font-sans text-center">Preencha seus dados para criar uma conta profissional</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <PsychologistFormFields control={form.control} />

            <div className="flex justify-end space-x-6 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Criando Conta...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-10 pt-6 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Já possui uma conta? <Link to="/" className="text-portal-purple hover:text-portal-purple-dark font-medium">Faça Login</Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PsychologistForm;
