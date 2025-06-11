import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TabsCustom from './ui/tabs-custom';
import CheckboxCustom from './ui/checkbox-custom';
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

// Definir interfaces para os tipos de dados
interface UserMetadata {
  user_type?: string;
  name?: string;
  email_verified?: boolean;
  [key: string]: any; // Para permitir propriedades adicionais
}

interface Psychologist {
  id: string | number;
  name: string;
  email: string;
  [key: string]: any;
}

interface Company {
  id: string | number;
  name: string;
  email?: string;
  corp_email?: string;
  [key: string]: any;
}
const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState('psychologists');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  
  // Função para solicitar redefinição de senha
  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast({
        title: "E-mail obrigatório",
        description: "Por favor, informe seu e-mail para recuperar a senha.",
        variant: "destructive"
      });
      return;
    }
    
    setResetLoading(true);
    
    try {
      // Remover o parâmetro redirectTo para usar a abordagem baseada em token
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      // Mostrar mensagem de sucesso
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      
      // Fechar o modal
      setForgotPasswordOpen(false);
    } catch (error: any) {
      // Mostrar mensagem de erro
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o e-mail de redefinição.",
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };
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
      // 1. Tentar autenticar com Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      // Se houver erro na autenticação, tentar o método antigo
      if (error) {
        console.log('Erro na autenticação com Supabase Auth:', error);
        console.log('Detalhes do erro:', error.message, error.status, error.code);
        console.log('Tentando método antigo de login...');
        
        // Método antigo para login de psicólogos
        if (userType === 'psychologists') {
          console.log('Tentando login como psicólogo com método antigo para:', email);
          // Primeiro, vamos verificar se o psicólogo existe
          const { data: psychologistCheck, error: checkError } = await supabase
            .from('psychologists')
            .select('id, name, email, password')
            .eq('email', email)
            .single();
            
          if (checkError) {
            console.error('Erro ao verificar psicólogo:', checkError);
            throw new Error('Psicólogo não encontrado');
          }
          
          console.log('Psicólogo encontrado:', psychologistCheck);
          
          // Agora verificamos a senha
          if (psychologistCheck.password !== password) {
            console.error('Senha incorreta para o psicólogo');
            throw new Error('Senha incorreta');
          }
          
          // Se chegou aqui, o login é válido
          const psychologist = psychologistCheck;
          
          // Psicólogo encontrado, salvar dados na sessão
          localStorage.setItem('psychologistId', psychologist.id.toString());
          localStorage.setItem('psychologistName', psychologist.name || 'Psicólogo');
          
          // Processar convites (código existente)
          // ...
          
          toast({
            title: "Login Bem-Sucedido",
            description: `Bem-Vindo(a) de Volta, ${psychologist.name || 'Psicólogo'}!`
          });
          navigate('/dashboard');
          return;
        } 
        // Método antigo para login de empresas
        else if (userType === 'companies') {
          console.log('Tentando login como empresa com método antigo para:', email);
          // Primeiro, verificamos se a empresa existe com o email principal
          let { data: companyCheck, error: checkError } = await supabase
            .from('companies')
            .select('id, name, email, corp_email, password')
            .eq('email', email)
            .single();
            
          // Se não encontrar com o email principal, tentamos com o email corporativo
          if (checkError) {
            console.log('Empresa não encontrada com email principal, tentando email corporativo');
            const result = await supabase
              .from('companies')
              .select('id, name, email, corp_email, password')
              .eq('corp_email', email)
              .single();
              
            companyCheck = result.data;
            checkError = result.error;
          }
          
          if (checkError) {
            console.error('Erro ao verificar empresa:', checkError);
            throw new Error('Empresa não encontrada');
          }
          
          console.log('Empresa encontrada:', companyCheck);
          
          // Verificar a senha
          if (companyCheck.password !== password) {
            console.error('Senha incorreta para a empresa');
            throw new Error('Senha incorreta');
          }
          
          // Se chegou aqui, o login é válido
          const company = companyCheck;
          
          // Empresa encontrada, salvar dados na sessão
          localStorage.setItem('companyId', company.id.toString());
          localStorage.setItem('companyName', company.name || 'Empresa');
          localStorage.setItem('companyEmail', company.email || company.corp_email || email);
          
          toast({
            title: "Login Bem-Sucedido",
            description: `Bem-Vindo(a) de Volta, ${company.name || 'Empresa'}!`
          });
          navigate('/company/dashboard');
          return;
        }
        // Admin login handling com método antigo
        else if (adminMode) {
          if (email === 'admin@admin.com') {
            // Verificar se este admin existe e a senha está correta
            const { data: admin, error: adminError } = await supabase
              .from('user_profiles')
              .select('*')
              .match({ email: 'admin@admin.com', password: password })
              .single();
              
            if (adminError || !admin) {
              throw new Error('Credenciais de administrador inválidas');
            }
            
            // Admin autenticado
            localStorage.setItem('adminId', admin.id.toString());
            localStorage.setItem('adminName', admin.name || 'Administrador');
            
            toast({
              title: "Login de administrador bem-sucedido",
              description: "Bem-vindo à área do administrador"
            });
            navigate('/admin/dashboard');
            return;
          } else {
            toast({
              title: "Acesso negado",
              description: "Somente o administrador pode acessar esta área",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }
        }
        
        // Se chegou aqui, nenhum método funcionou
        throw new Error('Credenciais inválidas');
      }
      
      // Garantir que temos um usuário
      if (!data || !data.user) {
        throw new Error("Usuário não encontrado");
      }
      
      // 2. Verificar o tipo de usuário
      const user: User = data.user;
      const userMetadata = user.user_metadata as UserMetadata;
      
      // Inicialmente, tentamos obter o tipo do usuário dos metadados
      let userTypeFromAuth = userMetadata.user_type || '';
      
      // Se não houver tipo de usuário nos metadados, vamos determinar com base nas tabelas
      if (!userTypeFromAuth) {
        console.log('Tipo de usuário não encontrado nos metadados, verificando nas tabelas...');
        
        // Verificar se é um psicólogo
        const { data: psychCheck, error: psychError } = await supabase
          .from('psychologists')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (psychCheck && !psychError) {
          console.log('Usuário encontrado na tabela psychologists');
          userTypeFromAuth = 'psychologist';
        } else {
          // Verificar se é uma empresa
          const { data: companyCheck, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .single();
            
          if (companyCheck && !companyError) {
            console.log('Usuário encontrado na tabela companies');
            userTypeFromAuth = 'company';
          }
        }
        
        // Se encontramos o tipo, vamos atualizar os metadados para futuras autenticações
        if (userTypeFromAuth) {
          console.log('Atualizando metadados do usuário com o tipo:', userTypeFromAuth);
          // Atualizar apenas o campo user_type para evitar problemas
          await supabase.auth.updateUser({
            data: { 
              user_type: userTypeFromAuth
            }
          });
        } else {
          console.error('Não foi possível determinar o tipo de usuário');
        }
      }
      
      console.log('Tipo de usuário determinado:', userTypeFromAuth);
      
      // Admin login handling
      if (userTypeFromAuth === 'admin' || (adminMode && email === 'admin@admin.com')) {
        // Admin autenticado
        localStorage.setItem('adminId', data.user.id);
        localStorage.setItem('adminName', userMetadata.name || 'Administrador');
        toast({
          title: "Login de administrador bem-sucedido",
          description: "Bem-vindo à área do administrador"
        });
        navigate('/admin/dashboard');
        return;
      }
      
      // Verificar se estamos em modo admin mas o usuário não é admin
      if (adminMode) {
        toast({
          title: "Acesso negado",
          description: "Somente o administrador pode acessar esta área",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // 3. Buscar dados adicionais e redirecionar com base no tipo
      if (userTypeFromAuth === 'psychologist') {
        // Buscar dados do psicólogo
        // @ts-ignore - Ignorar erro de tipo complexo
        const { data: psychologistData, error: psychError } = await supabase
          .from('psychologists')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (psychError) {
          console.error('Erro ao buscar dados do psicólogo:', psychError);
          throw new Error('Erro ao buscar dados do psicólogo');
        }
        
        if (!psychologistData) {
          throw new Error('Psicólogo não encontrado');
        }
        
        const psychologist = psychologistData as Psychologist;
        
        // Psicólogo encontrado, salvar dados na sessão
        localStorage.setItem('psychologistId', psychologist.id.toString());
        localStorage.setItem('psychologistName', psychologist.name || 'Psicólogo');
        
        // Verificar se há um código de convite armazenado
        let inviteCode = localStorage.getItem('inviteCode');
        
        // Se não há um código direto, mas há um token, buscar o código pelo e-mail
        if (!inviteCode) {
          const inviteToken = localStorage.getItem('inviteToken');
          if (inviteToken) {
            try {
              // Buscar o convite pelo e-mail do psicólogo
              const response = await fetch(`http://192.168.0.73:3000/get-invite-by-email?email=${encodeURIComponent(email)}`);
              const data = await response.json();
              
              if (data.success && data.code) {
                inviteCode = data.code;
                localStorage.setItem('inviteCode', inviteCode);
                localStorage.removeItem('inviteToken'); // Limpar o token após obter o código
              }
            } catch (error) {
              console.error('Erro ao buscar convite pelo e-mail:', error);
            }
          }
        }
        
        if (inviteCode) {
          try {
            // Processar o convite
            const processResponse = await fetch('http://192.168.0.73:3000/process-invite', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                code: inviteCode, 
                psychologistId: psychologist.id.toString() 
              }),
            });
            
            const processData = await processResponse.json();
            
            if (processData.success) {
              toast({
                title: "Convite aceito com sucesso",
                description: "Você foi vinculado ao paciente que enviou o convite."
              });
              
              // Limpar o código do localStorage
              localStorage.removeItem('inviteCode');
            } else {
              console.error('Erro ao processar convite:', processData.error);
              toast({
                title: "Erro ao processar convite",
                description: processData.error || "Ocorreu um erro ao processar o convite.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Erro ao processar convite:', error);
            toast({
              title: "Erro ao processar convite",
              description: "Ocorreu um erro ao processar o convite. Tente novamente mais tarde.",
              variant: "destructive"
            });
          }
        }
        
        toast({
          title: "Login Bem-Sucedido",
          description: `Bem-Vindo(a) de Volta, ${psychologist.name || 'Psicólogo'}!`
        });
        navigate('/dashboard');
      } 
      else if (userTypeFromAuth === 'company') {
        // Buscar dados da empresa
        // @ts-ignore - Ignorar erro de tipo complexo
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (companyError) {
          console.error('Erro ao buscar dados da empresa:', companyError);
          throw new Error('Erro ao buscar dados da empresa');
        }
        
        if (!companyData) {
          throw new Error('Empresa não encontrada');
        }
          
        const company = companyData as Company;
        
        // Empresa encontrada, salvar dados na sessão
        localStorage.setItem('companyId', company.id.toString());
        localStorage.setItem('companyName', company.name || 'Empresa');
        localStorage.setItem('companyEmail', company.email || company.corp_email || email);
        
        toast({
          title: "Login Bem-Sucedido",
          description: `Bem-Vindo(a) de Volta, ${company.name || 'Empresa'}!`
        });
        navigate('/company/dashboard');
      }
      else {
        // Tipo de usuário desconhecido
        throw new Error("Tipo de usuário desconhecido");
      }
    } catch (err) {
      console.error('Erro no login:', err);
      toast({
        title: "Credenciais inválidas",
        description: "E-mail ou senha incorretos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const tabOptions = [{
    id: 'psychologists',
    label: 'Psicólogos'
  }, {
    id: 'companies',
    label: 'Empresas'
  }];
  const toggleAdminMode = () => {
    setAdminMode(!adminMode);
    if (!adminMode) {
      // Switching to admin mode
      setUserType('admin');
    } else {
      // Switching back to regular login
      setUserType('psychologists');
    }
  };
  return <div className="w-full max-w-md font-sans mt-5">
      {!adminMode && <TabsCustom options={tabOptions} selectedTab={userType} onTabChange={setUserType} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={20} className="text-gray-400" />
            </div>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent" placeholder={adminMode ? "admin@admin.com" : "seu@email.com"} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            {!adminMode && <a 
                onClick={(e) => {
                  e.preventDefault();
                  setResetEmail(email); // Pré-preencher com o e-mail já digitado no login
                  setForgotPasswordOpen(true);
                }} 
                href="#" 
                className="text-sm text-portal-purple hover:text-portal-purple-dark cursor-pointer"
              >
                Esqueceu a senha?
              </a>}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent" placeholder="Sua senha" />
            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} className="text-portal-purple hover:text-gray-600" /> : <Eye size={20} className="text-gray-400 hover:text-gray-600" />}
            </button>
          </div>
        </div>

        {!adminMode && <CheckboxCustom id="remember-me" label="Lembrar de mim" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />}

        <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-gradient-button rounded-lg text-white font-medium flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70">
          {loading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-180">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>}
          {loading ? "Entrando..." : adminMode ? "Entrar como Administrador" : `Entrar como ${userType === 'psychologists' ? 'Psicólogo' : 'Empresa'}`}
        </button>

        {!adminMode && <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              {userType === 'psychologists' ? <Link to="/register/psychologist" className="text-portal-purple hover:text-portal-purple-dark font-medium">
                  Cadastre-se
                </Link> : <Link to="/register/company" className="text-portal-purple hover:text-portal-purple-dark font-medium">
                  Cadastre-se
                </Link>}
            </p>
          </div>}
      </form>

      <div className="mt-8 text-center">
        <button className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700" onClick={toggleAdminMode}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6V18" stroke="currentColor" strokeWidth="2" />
            {adminMode && <path d="M6 12H18" stroke="currentColor" strokeWidth="2" />}
          </svg>
          {adminMode ? "Voltar para Login Normal" : "Acesso para Administradores"}
        </button>
      </div>
      
      {/* Modal de Recuperação de Senha */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recuperar Senha</h3>
              <button 
                onClick={() => setForgotPasswordOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Digite seu e-mail e enviaremos instruções para redefinir sua senha.
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Seu e-mail"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portal-purple focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleForgotPassword(resetEmail)}
                  disabled={resetLoading}
                  className="px-4 py-2 bg-gradient-button text-white rounded-lg hover:opacity-90 disabled:opacity-70 flex items-center gap-2"
                >
                  {resetLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
};
export default LoginForm;
