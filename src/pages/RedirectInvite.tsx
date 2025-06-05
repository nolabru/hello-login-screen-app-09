import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const RedirectInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processRedirect = async () => {
      try {
        // Verificar se há um código direto na URL
        const directCode = searchParams.get('code');
        if (directCode) {
          // Se temos um código direto, armazenamos no localStorage e redirecionamos
          localStorage.setItem('inviteCode', directCode);
          navigate(`/psychologist/enter-code?code=${directCode}`);
          return;
        }
        
        // Verificar se há um token na URL
        const token = searchParams.get('token');
        if (token) {
          // Se temos um token, armazenamos no localStorage
          localStorage.setItem('inviteToken', token);
          
          // Verificar se o usuário já está logado
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && user.email) {
            // Se o usuário já está logado, buscamos o convite pelo e-mail
            try {
              const response = await fetch(`http://192.168.0.73:3000/get-invite-by-email?email=${encodeURIComponent(user.email)}`);
              const data = await response.json();
              
              if (data.success && data.code) {
                // Se encontramos um convite, armazenamos o código e redirecionamos
                localStorage.setItem('inviteCode', data.code);
                navigate(`/psychologist/enter-code?code=${data.code}`);
                return;
              }
            } catch (error) {
              console.error('Erro ao buscar convite:', error);
            }
          }
          
          // Se o usuário não está logado ou não encontramos um convite,
          // redirecionamos para a página de login
          toast({
            title: "Convite recebido",
            description: "Faça login ou crie uma conta para aceitar o convite.",
          });
          navigate('/');
          return;
        }
        
        // Se não temos nem código nem token, tentamos obter o e-mail do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !user.email) {
          // Se não temos um usuário ou e-mail, redirecionamos para a página inicial
          setError('Não foi possível identificar o usuário. Por favor, faça login.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        // Agora que temos o e-mail, buscamos o convite
        const response = await fetch(`http://192.168.0.73:3000/get-invite-by-email?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (data.success && data.code) {
          // Se encontramos um convite, armazenamos o código e redirecionamos
          localStorage.setItem('inviteCode', data.code);
          navigate(`/psychologist/enter-code?code=${data.code}`);
        } else {
          // Se não encontramos um convite, mostramos um erro
          setError('Não foi encontrado nenhum convite pendente para o seu e-mail.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Erro ao processar redirecionamento:', err);
        setError('Ocorreu um erro ao processar o redirecionamento.');
        setTimeout(() => navigate('/'), 3000);
      }
    };
    
    processRedirect();
  }, [searchParams, navigate, toast]);
  
  return (
    <>
      <Helmet>
        <title>Redirecionando - Portal Calma</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-portal">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-portal-purple">Processando seu convite</h1>
          <div className="flex flex-col items-center">
            {error ? (
              <>
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-gray-600">Redirecionando para a página inicial...</p>
              </>
            ) : (
              <>
                <Loader2 className="h-12 w-12 text-portal-purple animate-spin mb-4" />
                <p className="text-gray-600">Redirecionando para a página de convite...</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RedirectInvite;
