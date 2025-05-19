
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { UserRound } from 'lucide-react';
import PsychologistFormFields, { PsychologistFormData } from './PsychologistFormFields';

const PsychologistForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<PsychologistFormData>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = (data: PsychologistFormData) => {
    console.log('Form data:', data);
    toast({
      title: "Cadastro enviado!",
      description: "Seus dados foram enviados com sucesso.",
    });
    // Em uma aplicação real, enviaria os dados para uma API
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="max-w-3xl w-full mx-auto bg-white rounded-lg shadow-md p-10 mb-8">
      <div className="flex items-center justify-center gap-4 mb-6">
        <UserRound size={32} className="text-portal-purple" />
        <h1 className="text-2xl font-display font-bold text-gray-800">Registro de Psicólogo</h1>
      </div>
      <p className="text-gray-600 mb-8 font-sans text-center">Preencha seus dados para criar uma conta profissional</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <PsychologistFormFields register={register} errors={errors} />

        <div className="flex justify-end space-x-6 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-button rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
        </div>
      </form>

      <div className="mt-10 pt-6 text-center border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Já possui uma conta? <a href="/" className="text-portal-purple hover:text-portal-purple-dark font-medium">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default PsychologistForm;
