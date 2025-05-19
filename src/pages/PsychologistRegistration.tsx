
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Phone, UserRound, FileText, Lock, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

type FormData = {
  name: string;
  email: string;
  phone: string;
  crp: string;
  specialization: string;
  biography: string;
  password: string;
};

const PsychologistRegistration = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    toast({
      title: "Cadastro enviado!",
      description: "Seus dados foram enviados com sucesso.",
    });
    // Em uma aplicação real, enviaria os dados para uma API
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="h-screen bg-gradient-portal overflow-hidden">
        <div className="absolute top-4 left-4">
          <Link to="/" className="text-gray-700 flex items-center hover:underline">
            <ArrowLeft size={20} className="mr-1" />
            Voltar
          </Link>
        </div>

        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4">
            <Logo showTextLogo={true} size="md" />
          </div>

          <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UserRound size={24} className="text-portal-purple" />
              <h1 className="text-xl font-display font-bold text-gray-800">Registro de Psicólogo</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <UserRound size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      placeholder="Nome do psicólogo"
                      className={`w-full pl-7 pr-2 py-1 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm`}
                      {...register('name', { required: true })}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">Nome é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Mail size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="Email"
                      className={`w-full pl-7 pr-2 py-1 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm`}
                      {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">Email válido é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Phone size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      placeholder="(00) 00000-0000"
                      className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="crp" className="block text-xs font-medium text-gray-700">
                    CRP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <FileText size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="crp"
                      placeholder="Número do CRP"
                      className={`w-full pl-7 pr-2 py-1 border ${errors.crp ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm`}
                      {...register('crp', { required: true })}
                    />
                  </div>
                  {errors.crp && <p className="text-red-500 text-xs">CRP é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="specialization" className="block text-xs font-medium text-gray-700">
                    Especialização <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    placeholder="Área de especialização"
                    className={`w-full px-3 py-1 border ${errors.specialization ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm`}
                    {...register('specialization', { required: true })}
                  />
                  {errors.specialization && <p className="text-red-500 text-xs">Especialização é obrigatória</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Lock size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      placeholder="Senha (mínimo 6 caracteres)"
                      className={`w-full pl-7 pr-2 py-1 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm`}
                      {...register('password', { required: true, minLength: 6 })}
                    />
                  </div>
                  {errors.password && errors.password.type === 'required' && (
                    <p className="text-red-500 text-xs">Senha é obrigatória</p>
                  )}
                  {errors.password && errors.password.type === 'minLength' && (
                    <p className="text-red-500 text-xs">Senha deve ter pelo menos 6 caracteres</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="biography" className="block text-xs font-medium text-gray-700">
                  Biografia
                </label>
                <Textarea
                  id="biography"
                  placeholder="Breve biografia profissional (opcional)"
                  className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-portal-purple focus:border-transparent text-sm"
                  rows={2}
                  {...register('biography')}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-600">
                  Já possui uma conta? <Link to="/" className="text-portal-purple hover:text-portal-purple-dark font-medium">Faça login</Link>
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-4 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-button rounded-md text-white font-medium hover:opacity-90 transition-opacity text-sm"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PsychologistRegistration;
