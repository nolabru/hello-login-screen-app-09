
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  
  // Extrair parâmetros da URL para verificação
  const type = searchParams.get('type');
  const token = searchParams.get('token');

  return (
    <>
      <Helmet>
        <title>E-mail Verificado - Portal Calma</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&family=Quicksand:wght@300..700&display=swap" rel="stylesheet" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-portal flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo showTextLogo={true} size="lg" />
          </div>
          
          {/* Card de confirmação */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Ícone de sucesso */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            {/* Título */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4 font-display">
              E-mail Verificado!
            </h1>
            
            {/* Mensagem */}
            <p className="text-gray-600 mb-6 leading-relaxed">
              Seu e-mail foi confirmado com sucesso. Agora você pode acessar sua conta e começar a usar o Portal Calma.
            </p>
            
            {/* Botões de ação */}
            <div className="space-y-3">
              <Link to="/" className="w-full">
                <Button className="w-full bg-gradient-button hover:opacity-90 transition-opacity">
                  Ir para Login
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Informações adicionais */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Precisa de ajuda?{' '}
              <a href="mailto:suporte@portalcalma.com" className="text-portal-purple hover:underline">
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerified;
