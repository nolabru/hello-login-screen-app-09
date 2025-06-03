import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Home, Users, LogOut, Search, Menu, X, CreditCard, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
interface CompanyDashboardLayoutProps {
  children: ReactNode;
}
const CompanyDashboardLayout: React.FC<CompanyDashboardLayoutProps> = ({
  children
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  useEffect(() => {
    // Verificar se há uma empresa logada
    const checkAuth = async () => {
      const companyId = localStorage.getItem('companyId');
      const savedCompanyName = localStorage.getItem('companyName');
      const savedCompanyEmail = localStorage.getItem('companyEmail');
      if (!companyId) {
        // Se não houver id da empresa, redirecionar para a página de login
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      // Se houver dados salvos, use-os
      if (savedCompanyName && savedCompanyEmail) {
        setCompanyName(savedCompanyName);
        setCompanyEmail(savedCompanyEmail);
      } else {
        // Caso contrário, busque do banco de dados
        const companyIdNumber = parseInt(companyId, 10);
        const {
          data: company
        } = await supabase.from('companies').select('name, email, contact_email').eq('id', companyIdNumber).single();
        if (company) {
          setCompanyName(company.name);
          setCompanyEmail(company.email || company.contact_email);
          localStorage.setItem('companyName', company.name);
          localStorage.setItem('companyEmail', company.email || company.contact_email);
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
  const navItems = [{
    path: '/company/dashboard',
    label: 'Dashboard',
    icon: Home
  }, {
    path: '/company/funcionarios',
    label: 'Funcionários',
    icon: Users
  }, {
    path: '/company/psicologos',
    label: 'Psicólogos',
    icon: Search
  }, {
    path: '/company/licencas',
    label: 'Licenças',
    icon: CreditCard
  }, {
    path: '/company/relatorio-conformidade',
    label: 'Report e Conformidade',
    icon: FileText
  }];
  const handleLogout = () => {
    try {
      // Limpar localStorage
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('companyEmail');
      toast({
        title: "Logout realizado",
        description: "Sua sessão foi encerrada com sucesso."
      });

      // Redirect to login page
      navigate('/');
    } catch (err) {
      console.error('Erro inesperado ao fazer logout:', err);
      toast({
        variant: 'destructive',
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro inesperado. Tente novamente."
      });
    }
  };
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 bg-white shadow-sm z-10`}>
        <div className="flex items-center space-x-2">
          <Logo showTextLogo={false} size="sm" />
          <span className="font-medium text-lg">Área da Empresa</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-gray-100">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 w-64 h-full bg-white shadow-md transition-transform duration-300 ease-in-out`}>
          <div className="hidden md:block p-4 border-b">
            <Link to="/company/dashboard" className="flex items-center space-x-2">
              <Logo showTextLogo={false} size="sm" />
              <span className="font-medium text-lg  text-neutral-700">Área da Empresa</span>
            </Link>
          </div>
          
          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">Bem-vindo(a),</p>
            <h2 className="font-medium text-xl  text-neutral-700">{companyName}</h2>
            <p className="text-sm text-gray-500 mt-1 truncate">{companyEmail}</p>
          </div>
          
          <div className="overflow-y-auto flex-1 py-0">
            <nav>
              <ul>
                {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return <li key={item.path}>
                      <Link to={item.path} className={`flex items-center px-4 py-3 text-sm ${isActive ? 'bg-purple-50 text-portal-purple border-l-4 border-portal-purple' : 'text-gray-700 hover:bg-gray-100'}`} onClick={isMobile ? () => setSidebarOpen(false) : undefined}>
                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-portal-purple' : 'text-gray-500'}`} />
                        {item.label}
                      </Link>
                    </li>;
              })}
              </ul>
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm text-portal-purple hover:bg-purple-50 rounded-md">
              <LogOut className="h-5 w-5 mr-3" />
              Sair
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Overlay for mobile when sidebar is open */}
          {sidebarOpen && isMobile && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setSidebarOpen(false)} />}
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>;
};
export default CompanyDashboardLayout;