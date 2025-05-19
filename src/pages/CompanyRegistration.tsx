
import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';

type CompanyFormData = {
  companyName: string;
  legalName: string;
  corporateEmail: string;
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
};

const CompanyRegistration = () => {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyFormData>();

  const onSubmit = (data: CompanyFormData) => {
    toast({
      title: "Formulário enviado",
      description: "O cadastro foi iniciado com sucesso!"
    });
    console.log(data);
    // In a real application, you would send this data to your API
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-portal overflow-hidden">
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-gray-700 flex items-center hover:underline">
          <ArrowLeft size={20} className="mr-1" />
          Voltar
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-4">
          <Logo showTextLogo={true} size="md" />
        </div>
        
        <Card className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden p-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building size={24} className="text-portal-purple" />
              <h1 className="text-xl font-bold">Registro de Empresa</h1>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Building size={14} />
                    Nome da Empresa
                  </label>
                  <Input 
                    {...register("companyName", { required: true })}
                    placeholder="Nome comercial"
                    className={`text-sm py-1 h-8 ${errors.companyName ? "border-red-500" : ""}`}
                  />
                  {errors.companyName && <p className="text-red-500 text-xs">Nome da empresa é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Building size={14} />
                    Razão Social
                  </label>
                  <Input 
                    {...register("legalName", { required: true })}
                    placeholder="Razão social completa"
                    className={`text-sm py-1 h-8 ${errors.legalName ? "border-red-500" : ""}`}
                  />
                  {errors.legalName && <p className="text-red-500 text-xs">Razão social é obrigatória</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Mail size={14} />
                    Email Corporativo
                  </label>
                  <Input 
                    {...register("corporateEmail", { required: true, pattern: /^\S+@\S+$/i })}
                    placeholder="email@empresa.com"
                    className={`text-sm py-1 h-8 ${errors.corporateEmail ? "border-red-500" : ""}`}
                  />
                  {errors.corporateEmail && <p className="text-red-500 text-xs">Email válido é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Building size={14} />
                    CNPJ
                  </label>
                  <Input 
                    {...register("cnpj", { required: true })}
                    placeholder="XX.XXX.XXX/0001-XX"
                    className={`text-sm py-1 h-8 ${errors.cnpj ? "border-red-500" : ""}`}
                  />
                  {errors.cnpj && <p className="text-red-500 text-xs">CNPJ é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Mail size={14} />
                    Email de Contato
                  </label>
                  <Input 
                    {...register("contactEmail", { required: true, pattern: /^\S+@\S+$/i })}
                    placeholder="contato@empresa.com"
                    className={`text-sm py-1 h-8 ${errors.contactEmail ? "border-red-500" : ""}`}
                  />
                  {errors.contactEmail && <p className="text-red-500 text-xs">Email válido é obrigatório</p>}
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1 text-xs font-medium text-gray-700">
                    <Phone size={14} />
                    Telefone de Contato
                  </label>
                  <Input 
                    {...register("contactPhone", { required: true })}
                    placeholder="(XX) XXXXX-XXXX"
                    className={`text-sm py-1 h-8 ${errors.contactPhone ? "border-red-500" : ""}`}
                  />
                  {errors.contactPhone && <p className="text-red-500 text-xs">Telefone é obrigatório</p>}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-600">
                  Já possui uma conta? <Link to="/" className="text-portal-purple hover:underline font-medium">Faça login</Link>
                </p>
                
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gradient-button text-white rounded-md hover:opacity-90 transition text-sm"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistration;
