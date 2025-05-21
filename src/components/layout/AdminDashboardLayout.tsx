
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Home, Users, Building2, Settings, LogOut, Menu, X, Key, Link as LinkIcon, User, Briefcase, FileEdit } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminName, setAdminName] = useState('');
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    // Verificar se há um admin logado
    const checkAuth = async () => {
      const adminId = localStorage.getItem('adminId');
      const adminNameStored = localStorage.getItem('adminName');
      
      if (!adminId) {
        // Se não houver id do admin, redirecionar para a página de login
        toast({
          title: "Acesso não autorizado",
          description: "Você precisa fazer login como administrador.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }
      
      // Se houver um nome salvo, use-o
      if (adminNameStored) {
        setAdminName(adminNameStored);
      } else {
        // Caso contrário, busque do banco de dados
        const { data: admin } = await supabase
          .from('user_profiles')
          .select('nome')
          .eq('id', parseInt(adminId, 10))
          .eq('email', 'admin@admin.com')
          .single();
          
        if (admin) {
          setAdminName(admin.nome || 'Administrador');
          localStorage.setItem('adminName', admin.nome || 'Administrador');
        } else {
          // Se não encontrar o admin, fazer logout
          handleLogout();
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  // Close sidebar when switching to mobile view
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/psychologists', label: 'Psicólogos', icon: Users },
    { path: '/admin/companies', label: 'Empresas', icon: Building2 },
    { path: '/admin/employees', label: 'Funcionários', icon: Briefcase },
    { path: '/admin/connections', label: 'Conexões', icon: LinkIcon },
    { path: '/admin/licenses', label: 'Licenças', icon: Key },
    { path: '/admin/users', label: 'Usuários', icon: User },
    { path: '/admin/settings', label: 'Prompt da AIA', icon: FileEdit },
  ];

  const handleLogout = () => {
    try {
      // Limpar localStorage
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminName');
      
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-10`}>
        <div className="flex items-center space-x-2">
          <Logo showTextLogo={false} size="sm" />
          <span className="font-medium text-lg">Administração</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-20 w-64 h-full bg-white shadow-md transition-transform duration-300 ease-in-out`}
        >
          <div className="hidden md:block p-4 border-b">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <Logo showTextLogo={false} size="sm" />
              <span className="font-medium text-lg">Área do Admin</span>
            </Link>
          </div>
          
          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">Administrador</p>
            <h2 className="font-medium text-xl">{adminName}</h2>
          </div>
          
          <div className="py-4 overflow-y-auto flex-1">
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
                        onClick={isMobile ? () => setSidebarOpen(false) : undefined}
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
          
          <div className="p-4 border-t">
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
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Overlay for mobile when sidebar is open */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
