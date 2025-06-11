import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

const ResetPassword: React.FC = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!token) {
      toast({
        title: 'Token obrigatório',
        description: 'Por favor, insira o token recebido por e-mail.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!email) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Por favor, insira o e-mail associado à sua conta.',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Senha obrigatória',
        description: 'Por favor, insira uma nova senha.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'A confirmação de senha não corresponde à senha inserida.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Usar a API do Supabase para redefinir a senha com o token
      // Primeiro verificamos o token OTP
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'recovery',
      });
      
      if (verifyError) throw verifyError;
      
      // Depois atualizamos a senha
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      // Mostrar mensagem de sucesso
      toast({
        title: 'Senha redefinida com sucesso',
        description: 'Sua senha foi atualizada. Você já pode fazer login com a nova senha.',
      });

      // Redirecionar para a página de login
      navigate('/');
    } catch (error: any) {
      // Mostrar mensagem de erro
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível redefinir sua senha. Verifique o token e tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Redefinir Senha - Portal Calma</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-portal flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo showTextLogo={true} size="lg" />
          </div>

          {/* Card de redefinição de senha */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-portal-purple mb-6 text-center">
              Redefinir Senha
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de E-mail */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                  placeholder="Seu e-mail"
                />
              </div>
              
              {/* Campo de Token */}
              <div className="space-y-1">
                <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                  Token de Recuperação
                </label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                  placeholder="Insira o token recebido por e-mail"
                />
              </div>

              {/* Campo de Nova Senha */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nova Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                    placeholder="Nova senha (mínimo 6 caracteres)"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-portal-purple hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Campo de Confirmação de Senha */}
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                    placeholder="Confirme a nova senha"
                  />
                </div>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-button rounded-lg text-white font-medium flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processando...</span>
                  </>
                ) : (
                  'Redefinir Senha'
                )}
              </button>
            </form>

            {/* Link para voltar ao login */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-portal-purple hover:text-portal-purple-dark font-medium"
              >
                Voltar para o Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
