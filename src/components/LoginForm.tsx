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
  const [adminMode, setAdminMode] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
      // Admin login handling
      if (adminMode) {
        if (email === 'admin@admin.com') {
          // Verificar se este admin existe e a senha está correta
          // Usando uma abordagem mais simples para evitar erros de tipo
          const { data: admin, error: adminError } = await supabase
            .from('user_profiles')
            .select('*')
            .match({ email: 'admin@admin.com', password: password })
            .single();
          if (adminError || !admin) {
            toast({
              title: "Credenciais de administrador inválidas",
              variant: "destructive"
            });
            setLoading(false);
            return;
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

      // Regular login (Non-admin) continues with existing logic
      if (userType === 'psychologists') {
        // Verificar se o psicólogo existe na tabela psychologists
        // Usando uma abordagem mais simples para evitar erros de tipo
        const { data: psychologist, error: fetchError } = await supabase
          .from('psychologists')
          .select('*')
          .match({ email: email, password: password })
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
          title: "Login bem-sucedido",
          description: `Bem-vindo(a) de volta, ${psychologist.name || 'Psicólogo'}!`
        });
        navigate('/dashboard');
      } else {
        // Lógica para empresas
        console.log('Tentando fazer login como empresa');

        // Verificar se a empresa existe na tabela companies
        // Primeiro tentamos com o email principal
        let { data: company, error: fetchError } = await supabase
          .from('companies')
          .select('*')
          .match({ email: email, password: password })
          .single();
          
        // Se não encontrar, tentamos com o email corporativo
        if (fetchError || !company) {
          const result = await supabase
            .from('companies')
            .select('*')
            .match({ corp_email: email, password: password })
            .single();
            
          company = result.data;
          fetchError = result.error;
        }
        if (fetchError || !company) {
          console.error('Erro ao fazer login como empresa:', fetchError);
          toast({
            title: "Credenciais inválidas",
            description: "E-mail ou senha incorretos.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        console.log('Empresa encontrada:', company);

        // Empresa encontrada, salvar dados na sessão
        localStorage.setItem('companyId', company.id.toString());
        localStorage.setItem('companyName', company.name || 'Empresa');
        localStorage.setItem('companyEmail', company.email || company.corp_email || email);
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo(a) de volta, ${company.name || 'Empresa'}!`
        });
        navigate('/company/dashboard');
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
            {!adminMode && <a href="#" className="text-sm text-portal-purple hover:text-portal-purple-dark">
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
    </div>;
};
export default LoginForm;
