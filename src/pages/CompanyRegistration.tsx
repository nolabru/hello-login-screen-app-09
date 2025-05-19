
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
    <div className="min-h-screen flex flex-col bg-gradient-portal">
      <div className="w-full p-4">
        <Link to="/" className="text-gray-700 flex items-center hover:underline">
          <ArrowLeft size={20} className="mr-1" />
          Voltar
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-12">
        {/* Logo with text positioned close to the form */}
        <div className="mb-4">
          <Logo showTextLogo={true} size="lg" />
        </div>
        
        <Card className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Building size={32} className="text-portal-purple" />
              <h1 className="text-2xl font-bold">Registro de Empresa</h1>
            </div>
            
            <p className="text-gray-600 mb-8 text-center">Preencha os dados para criar uma conta empresarial</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <Building size={20} className="text-portal-purple" />
                  Informações da Empresa
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building size={16} />
                      Nome da Empresa
                    </label>
                    <Input 
                      {...register("companyName", { required: true })}
                      placeholder="Nome comercial"
                      className={errors.companyName ? "border-red-500" : ""}
                    />
                    {errors.companyName && <p className="text-red-500 text-sm">Nome da empresa é obrigatório</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building size={16} />
                      Razão Social
                    </label>
                    <Input 
                      {...register("legalName", { required: true })}
                      placeholder="Razão social completa"
                      className={errors.legalName ? "border-red-500" : ""}
                    />
                    {errors.legalName && <p className="text-red-500 text-sm">Razão social é obrigatória</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail size={16} />
                      Email Corporativo
                    </label>
                    <Input 
                      {...register("corporateEmail", { required: true, pattern: /^\S+@\S+$/i })}
                      placeholder="email@empresa.com"
                      className={errors.corporateEmail ? "border-red-500" : ""}
                    />
                    {errors.corporateEmail && <p className="text-red-500 text-sm">Email corporativo válido é obrigatório</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Building size={16} />
                      CNPJ
                    </label>
                    <Input 
                      {...register("cnpj", { required: true })}
                      placeholder="XX.XXX.XXX/0001-XX"
                      className={errors.cnpj ? "border-red-500" : ""}
                    />
                    {errors.cnpj && <p className="text-red-500 text-sm">CNPJ é obrigatório</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail size={16} />
                      Email de Contato
                    </label>
                    <Input 
                      {...register("contactEmail", { required: true, pattern: /^\S+@\S+$/i })}
                      placeholder="contato@empresa.com"
                      className={errors.contactEmail ? "border-red-500" : ""}
                    />
                    {errors.contactEmail && <p className="text-red-500 text-sm">Email de contato válido é obrigatório</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone size={16} />
                      Telefone de Contato
                    </label>
                    <Input 
                      {...register("contactPhone", { required: true })}
                      placeholder="(XX) XXXXX-XXXX"
                      className={errors.contactPhone ? "border-red-500" : ""}
                    />
                    {errors.contactPhone && <p className="text-red-500 text-sm">Telefone de contato é obrigatório</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-button text-white rounded-lg hover:opacity-90 transition"
                >
                  Cadastrar
                </button>
              </div>
            </form>

            <div className="text-center mt-8 pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Já possui uma conta? <Link to="/" className="text-portal-purple hover:underline font-medium">Faça login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyRegistration;
