
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
      <div className="min-h-screen bg-gradient-portal">
        <div className="w-full p-4">
          <Link to="/" className="text-gray-700 flex items-center hover:underline">
            <ArrowLeft size={20} className="mr-1" />
            Voltar
          </Link>
        </div>

        {/* Logo moved outside the card */}
        <div className="flex justify-center mb-4">
          <Logo showTextLogo={false} size="lg" />
        </div>

        <div className="container mx-auto py-4">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <UserRound size={32} className="text-portal-purple" />
              <h1 className="text-2xl font-display font-bold text-gray-800">Registro de Psicólogo</h1>
            </div>
            <p className="text-gray-600 mb-6 font-sans text-center">Preencha seus dados para criar uma conta profissional</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserRound size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      placeholder="Nome do psicólogo"
                      className={`w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent`}
                      {...register('name', { required: true })}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">Nome é obrigatório</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      placeholder="Email do psicólogo"
                      className={`w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent`}
                      {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">Email válido é obrigatório</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      placeholder="(00) 00000-0000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                      {...register('phone')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="crp" className="block text-sm font-medium text-gray-700">
                    CRP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="crp"
                      placeholder="Número do CRP"
                      className={`w-full pl-10 pr-3 py-2 border ${errors.crp ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent`}
                      {...register('crp', { required: true })}
                    />
                  </div>
                  {errors.crp && <p className="text-red-500 text-xs mt-1">CRP é obrigatório</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Especialização <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="specialization"
                  placeholder="Área de especialização"
                  className={`w-full px-3 py-2 border ${errors.specialization ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent`}
                  {...register('specialization', { required: true })}
                />
                {errors.specialization && <p className="text-red-500 text-xs mt-1">Especialização é obrigatória</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
                  Biografia
                </label>
                <Textarea
                  id="biography"
                  placeholder="Breve biografia profissional (opcional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                  rows={4}
                  {...register('biography')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    className={`w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent`}
                    {...register('password', { required: true, minLength: 6 })}
                  />
                </div>
                {errors.password && errors.password.type === 'required' && (
                  <p className="text-red-500 text-xs mt-1">Senha é obrigatória</p>
                )}
                {errors.password && errors.password.type === 'minLength' && (
                  <p className="text-red-500 text-xs mt-1">Senha deve ter pelo menos 6 caracteres</p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
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

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Já possui uma conta? <Link to="/" className="text-portal-purple hover:text-portal-purple-dark font-medium">Faça login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PsychologistRegistration;
