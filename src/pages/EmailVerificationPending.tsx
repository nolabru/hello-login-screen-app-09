import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Mail, RefreshCw, ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationPending = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  
  // Extrair o e-mail e o tipo de usuário do estado da localização
  const email = location.state?.email || '';
  const userType = location.state?.userType || '';
  
  // Função para reenviar o e-mail de verificação
  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "E-mail não encontrado",
        description: "Não foi possível identificar seu e-mail. Por favor, tente fazer o registro novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "E-mail reenviado",
        description: "Um novo e-mail de verificação foi enviado para o seu endereço.",
      });
    } catch (error: any) {
      console.error('Erro ao reenviar e-mail:', error);
      toast({
        title: "Erro ao reenviar e-mail",
        description: error.message || "Não foi possível reenviar o e-mail de verificação. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verificação de E-mail - Portal Calma</title>
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
          
          {/* Card de verificação pendente */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Ícone de e-mail */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-portal-purple/20 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-portal-purple" />
              </div>
            </div>
            
            {/* Título */}
            <h1 className="text-xl font-bold text-portal-purple mb-4 font-display">
              Verifique seu E-mail
            </h1>
            
            {/* Mensagem */}
            <p className="text-gray-600 mb-2 leading-relaxed">
              Enviamos um link de verificação para:
            </p>
            <p className="text-portal-purple/90 font-medium mb-4">
              {email || "seu endereço de e-mail"}
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Por favor, verifique sua caixa de entrada e clique no link de verificação para ativar sua conta. 
              {userType === 'psychologist' ? ' Após a verificação, você poderá fazer login como psicólogo.' : 
               userType === 'company' ? ' Após a verificação, você poderá fazer login como empresa.' : 
               ' Após a verificação, você poderá fazer login.'}
            </p>
            
            {/* Botões de ação */}
            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-white border border-portal-purple text-portal-purple hover:bg-portal-purple/10 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 text-portal-purple ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? "Reenviando..." : "Reenviar E-mail de Verificação"}
              </Button>
              
              <Link to="/" className="w-full block mt-4">
                <Button 
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Informações adicionais */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Não recebeu o e-mail? Verifique sua pasta de spam ou lixo eletrônico.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Caso tenha problemas para verificar seu e-mail, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerificationPending;
