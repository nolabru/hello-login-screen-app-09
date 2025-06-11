
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CheckCircle, ArrowRight, Smartphone } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userType, setUserType] = useState('web'); // Default to web
  
  // Extrair parâmetros da URL para verificação
  const type = searchParams.get('type');
  const token = searchParams.get('token');
  const source = searchParams.get('source');
  
  // Detectar o tipo de usuário com base nos parâmetros da URL
  useEffect(() => {
    // Verificar se é um deep link (app mobile)
    const isMobileDeepLink = window.location.href.includes('calma://');
    
    // Se for um deep link, é mobile no mesmo dispositivo
    if (isMobileDeepLink) {
      setUserType('mobile');
      console.log('Detectado como usuário mobile no mesmo dispositivo (deep link)');
    } 
    // Se o parâmetro source=mobile estiver presente, é explicitamente mobile
    else if (source === 'mobile') {
      setUserType('mobile');
      console.log('Detectado como usuário mobile (parâmetro source)');
    }
    // Se tiver token mas não for deep link, provavelmente é mobile em outro dispositivo
    else if (token && !isMobileDeepLink) {
      setUserType('mobileOnWeb');
      console.log('Detectado como usuário mobile em outro dispositivo');
    }
    // Em todos os outros casos, é um usuário web
    else {
      setUserType('web');
      console.log('Detectado como usuário web');
    }
    
    // Registrar a verificação bem-sucedida
    if (token) {
      localStorage.setItem('emailVerified', 'true');
      
      // Não tentamos verificar o token com o Supabase, apenas registramos localmente
      console.log('Token recebido:', token);
      
      // Mostrar mensagem de sucesso
      toast({
        title: "E-mail verificado",
        description: "Seu e-mail foi verificado com sucesso!"
      });
    }
  }, [searchParams, source, token]);

  return (
    <>
      <Helmet>
        <title>E-mail Verificado - Portal Calma</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
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
            
            {/* Conteúdo condicional com base no tipo de usuário */}
            {userType === 'web' && (
              <>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Seu e-mail foi confirmado com sucesso. Agora você pode fazer login e aproveitar todos os recursos do C'Alma.
                </p>
                
                <div className="space-y-3">
                  <Link to="/" className="w-full">
                    <Button className="w-full bg-gradient-button text-white hover:opacity-90 transition-opacity">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ir para Login
                    </Button>
                  </Link>
                </div>
              </>
            )}
            
            {userType === 'mobile' && (
              <>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Seu e-mail foi confirmado com sucesso. Você pode fechar esta janela e voltar ao aplicativo C'Alma.
                </p>
                
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <Smartphone className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">
                    Retorne ao aplicativo para continuar.
                  </p>
                </div>
              </>
            )}
            
            {userType === 'mobileOnWeb' && (
              <>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Seu e-mail foi confirmado com sucesso. Por favor, volte ao aplicativo C'Alma em seu dispositivo móvel e faça login novamente.
                </p>
                
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <Smartphone className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-blue-700">
                    Abra o aplicativo C'Alma em seu dispositivo móvel para continuar.
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Informações adicionais */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Caso tenha problemas para acessar, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerified;
