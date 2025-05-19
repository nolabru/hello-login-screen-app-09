
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Home, Users, Building2, Settings, LogOut } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Verificar se há um psicólogo logado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const psychologistId = localStorage.getItem('psychologistId');
      const psychologistName = localStorage.getItem('psychologistName');
      
      if (!session || !psychologistId) {
        // Se não houver sessão, redirecionar para a página de login
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      // Se houver um nome salvo, use-o
      if (psychologistName) {
        setUserName(psychologistName);
      } else {
        // Caso contrário, busque do banco de dados
        const { data: psychologist } = await supabase
          .from('psychologists')
          .select('nome, name')
          .eq('id', psychologistId)
          .single();
          
        if (psychologist) {
          const displayName = psychologist.nome || psychologist.name;
          setUserName(displayName || 'Psicólogo');
          localStorage.setItem('psychologistName', displayName || 'Psicólogo');
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/pacientes', label: 'Pacientes', icon: Users },
    { path: '/empresas', label: 'Empresas', icon: Building2 },
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        toast({
          variant: 'destructive',
          title: "Erro ao fazer logout",
          description: "Não foi possível encerrar sua sessão. Tente novamente.",
        });
        return;
      }
      
      // Logout successful - limpar localStorage
      localStorage.removeItem('psychologistId');
      localStorage.removeItem('psychologistName');
      
      toast({
        title: "Logout realizado",
        description: "Sua sessão foi encerrada com sucesso.",
      });
      
      // Redirect to login page
      navigate('/');
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
      toast({
        variant: 'destructive',
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Logo showTextLogo={false} size="sm" />
            <span className="font-medium text-lg">Área do Psicólogo</span>
          </Link>
        </div>
        
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">Bem-vindo(a),</p>
          <h2 className="font-medium text-xl">{userName}</h2>
        </div>
        
        <div className="py-4">
          <nav>
            <ul>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm ${
                        isActive
                          ? 'bg-purple-50 text-portal-purple border-l-4 border-portal-purple'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-portal-purple' : 'text-gray-500'}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 rounded-md"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Fazer Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
