
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabsCustom from './ui/tabs-custom';
import CheckboxCustom from './ui/checkbox-custom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";

const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState('psychologists');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (userType === 'psychologists') {
        // Verificar se o psicólogo existe na tabela psychologists
        const { data: psychologist, error: fetchError } = await supabase
          .from('psychologists')
          .select()
          .eq('email', email)
          .eq('senha', password)
          .single();

        if (fetchError || !psychologist) {
          console.error('Erro ao fazer login:', fetchError);
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Se o psicólogo foi encontrado, criar uma sessão com Supabase auth
        // Use o email e senha para fazer login através do sistema de autenticação
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Se o login falhar (porque o usuário não existe no auth), criar um novo usuário
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            console.error('Erro ao criar usuário:', signUpError);
            toast({
              title: "Erro ao criar sessão",
              description: "Não foi possível criar sua sessão. Contate o administrador.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
          
          // Se o registro foi bem-sucedido, tente fazer login novamente
          const { error: secondLoginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (secondLoginError) {
            console.error('Erro ao fazer login após cadastro:', secondLoginError);
            toast({
              title: "Erro ao criar sessão",
              description: "Não foi possível criar sua sessão. Tente novamente mais tarde.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }

        // Login bem-sucedido - salvar ID do psicólogo na sessão
        localStorage.setItem('psychologistId', psychologist.id.toString());
        localStorage.setItem('psychologistName', psychologist.nome || psychologist.name || 'Psicólogo');

        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo(a) de volta, ${psychologist.nome || psychologist.name || 'Psicólogo'}!`
        });

        navigate('/dashboard');
      } else {
        // Lógica para empresas
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "O acesso para empresas ainda está sendo implementado."
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro no servidor",
        description: "Ocorreu um erro ao processar seu login. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tabOptions = [
    { id: 'psychologists', label: 'Psicólogos' },
    { id: 'companies', label: 'Empresas' },
  ];

  return (
    <div className="w-full max-w-md font-sans">
      <TabsCustom
        options={tabOptions}
        selectedTab={userType}
        onTabChange={setUserType}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <a href="#" className="text-sm text-portal-purple hover:text-portal-purple-dark">
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
              placeholder="Sua senha"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={20} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <CheckboxCustom
          id="remember-me"
          label="Lembrar de mim"
          checked={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-button rounded-lg text-white font-medium flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          )}
          {loading ? "Entrando..." : `Entrar como ${userType === 'psychologists' ? 'Psicólogo' : 'Empresa'}`}
        </button>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            {userType === 'psychologists' ? (
              <Link to="/register/psychologist" className="text-portal-purple hover:text-portal-purple-dark font-medium">
                Cadastre-se
              </Link>
            ) : (
              <Link to="/register/company" className="text-portal-purple hover:text-portal-purple-dark font-medium">
                Cadastre-se
              </Link>
            )}
          </p>
        </div>
      </form>

      <div className="mt-8 text-center">
        <button className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Acesso para Administradores
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
