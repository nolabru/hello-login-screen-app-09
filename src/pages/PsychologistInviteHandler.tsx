import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PsychologistInviteHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      // Armazenar o código no localStorage
      localStorage.setItem('inviteCode', code);
      
      // Verificar se o usuário já está logado como psicólogo
      const psychologistId = localStorage.getItem('psychologistId');
      
      if (psychologistId) {
        // Se já estiver logado, processar o convite diretamente
        processInvite(code, psychologistId);
      } else {
        // Se não estiver logado, redirecionar para a página de login
        toast({
          title: "Convite recebido",
          description: "Faça login ou crie uma conta para aceitar o convite.",
        });
        setProcessing(false);
        navigate('/');
      }
    } else {
      // Se não houver código, redirecionar para a página inicial
      toast({
        title: "Código de convite não encontrado",
        description: "O link que você acessou não contém um código de convite válido.",
        variant: "destructive"
      });
      setProcessing(false);
      navigate('/');
    }
  }, [searchParams, navigate, toast]);
  
  const processInvite = async (code: string, psychologistId: string) => {
    try {
      // Chamar a API para processar o convite
      const response = await fetch('http://192.168.0.73:3000/process-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, psychologistId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Convite aceito com sucesso",
          description: "Você foi vinculado ao paciente que enviou o convite.",
        });
        
        // Limpar o código do localStorage
        localStorage.removeItem('inviteCode');
        
        // Redirecionar para o dashboard
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro ao processar convite",
          description: data.error || "Ocorreu um erro ao processar o convite.",
          variant: "destructive"
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao processar convite:', error);
      toast({
        title: "Erro ao processar convite",
        description: "Ocorreu um erro ao processar o convite. Tente novamente mais tarde.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Processando Convite - Portal Calma</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-portal">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-portal-purple">Processando seu convite</h1>
          
          {processing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-portal-purple animate-spin mb-4" />
              <p className="text-gray-600">Por favor, aguarde enquanto processamos seu convite...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-gray-600 mb-6">Redirecionando você para a página apropriada...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PsychologistInviteHandler;
