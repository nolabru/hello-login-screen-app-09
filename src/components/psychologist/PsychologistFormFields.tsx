
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, UserRound, FileText, Lock } from 'lucide-react';

export type PsychologistFormData = {
  name: string;
  email: string;
  phone: string;
  crp: string;
  specialization: string;
  biography: string;
  password: string;
};

interface PsychologistFormFieldsProps {
  register: UseFormRegister<PsychologistFormData>;
  errors: FieldErrors<PsychologistFormData>;
}

const PsychologistFormFields: React.FC<PsychologistFormFieldsProps> = ({ register, errors }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
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

        <div className="space-y-3">
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

        <div className="space-y-3">
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

        <div className="space-y-3">
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

      <div className="space-y-3">
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

      <div className="space-y-3">
        <label htmlFor="biography" className="block text-sm font-medium text-gray-700">
          Biografia
        </label>
        <Textarea
          id="biography"
          placeholder="Breve biografia profissional (opcional)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
          rows={3}
          {...register('biography')}
        />
      </div>

      <div className="space-y-3">
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
    </>
  );
};

export default PsychologistFormFields;
