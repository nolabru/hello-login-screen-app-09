import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Home, Users, LogOut, Menu, X, FileText, Building2, Activity, Settings, Bell, ChevronRight, ChevronLeft, PanelLeftClose, PanelLeftOpen, ClipboardList } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Carregar estado do colapso do localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed) {
      setSidebarCollapsed(JSON.parse(savedCollapsed));
    }
  }, []);

  // Salvar estado do colapso no localStorage
  const toggleSidebarCollapse = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsed));
  };
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
          data: company,
          error
        } = await supabase.from('companies').select('name, email, corp_email').eq('id', companyIdNumber).single();
        
        if (error) {
          console.error('Erro ao buscar dados da empresa:', error);
          return;
        }
        
        if (company) {
          setCompanyName(company.name);
          setCompanyEmail(company.email || company.corp_email || '');
          localStorage.setItem('companyName', company.name);
          localStorage.setItem('companyEmail', company.email || company.corp_email || '');
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
  // Dados mockados para badges e contadores
  const [statsData] = useState({
    employees: 45,
    activities: 8,
    reports: 3,
    alerts: 2,
    isOnline: true
  });

  const navItems = [{
    path: '/company/dashboard',
    label: 'Dashboard',
    icon: Home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    activeColor: 'bg-blue-500',
    badge: null,
    description: 'Visão geral'
  }, {
    path: '/company/organizacao',
    label: 'Organização',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    activeColor: 'bg-emerald-500',
    badge: null,
    description: 'Equipe e estrutura'
  }, {
    path: '/company/atividades',
    label: 'Atividades',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    activeColor: 'bg-purple-500',
    badge: null,
    description: 'Bem-estar corporativo'
  }, {
    path: '/company/questionarios',
    label: 'Questionários',
    icon: ClipboardList,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    activeColor: 'bg-amber-500',
    badge: null,
    description: 'Pesquisas de bem-estar'
  }, {
    path: '/company/relatorios',
    label: 'Relatórios',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    activeColor: 'bg-orange-500',
    badge: null,
    description: 'Compliance e auditoria'
  }, {
    path: '/company/relatorio-conformidade',
    label: 'Conformidade',
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    activeColor: 'bg-red-500',
    badge: null,
    description: 'Monitoramento legal'
  }];
  const handleLogout = async () => {
    try {
      // Fazer logout no sistema de autenticação do Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpar localStorage
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('companyEmail');
      
      toast({
        title: "Logout Realizado",
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
        <TooltipProvider>
          {/* 🚀 SIDEBAR COLAPSÁVEL PREMIUM */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-20 ${
            !isMobile && sidebarCollapsed ? 'w-20' : 'w-72'
          } h-full bg-white shadow-xl border-r border-gray-100 transition-all duration-300 ease-in-out flex flex-col`}>
          
          {/* Perfil da Empresa Premium */}
          <div className={`${sidebarCollapsed && !isMobile ? 'p-3' : 'p-6'} border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white transition-all duration-300`}>
            {sidebarCollapsed && !isMobile ? (
              // Modo Colapsado - Avatar + Toggle
              <div className="flex flex-col items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform cursor-pointer">
                        {companyName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white border shadow-lg p-3">
                    <div>
                      <div className="font-semibold text-gray-800">{companyName}</div>
                      <div className="text-sm text-gray-500">{companyEmail}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Toggle Button - Modo Colapsado */}
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={toggleSidebarCollapse}
                        className="group flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 w-10 h-10"
                        title="Expandir menu"
                      >
                        <PanelLeftOpen className="h-5 w-5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all duration-200" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-white border shadow-lg p-3">
                      <div>
                        <div className="font-semibold text-gray-800">Expandir Menu</div>
                        <div className="text-sm text-gray-500">Ver navegação completa</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ) : (
              // Modo Expandido - Layout Completo
              <>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-800 text-lg truncate">{companyName}</h2>
                        {statsData.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{companyEmail}</p>
                    </div>
                  </div>
                  
                  {/* Toggle Button - Ao lado das informações da empresa */}
                  {!isMobile && (
                    <button
                      onClick={toggleSidebarCollapse}
                      className="group flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 shrink-0"
                      title={sidebarCollapsed ? "Expandir menu" : "Minimizar menu"}
                    >
                      {sidebarCollapsed ? (
                        <PanelLeftOpen className="h-5 w-5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all duration-200" />
                      ) : (
                        <PanelLeftClose className="h-5 w-5 text-gray-600 group-hover:text-gray-800 group-hover:scale-110 transition-all duration-200" />
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    Online
                  </span>
                  <span className="text-gray-500">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Navegação Premium Colapsável */}
          <div className="overflow-y-auto flex-1 py-4">
            <nav className={sidebarCollapsed && !isMobile ? 'px-2' : 'px-4'}>
              <div className="space-y-1">
                {navItems.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  if (sidebarCollapsed && !isMobile) {
                    // Modo Colapsado - Apenas Ícones com Tooltips
                    return (
                      <Tooltip key={item.path}>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                            className={`group flex items-center justify-center p-3 rounded-xl transition-all duration-200 relative ${
                              isActive
                                ? `${item.bgColor} border border-gray-200 shadow-lg scale-[1.05]`
                                : 'hover:bg-gray-50 hover:scale-[1.05] hover:shadow-md'
                            }`}
                          >
                            <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                              isActive ? item.activeColor : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              <Icon className={`h-5 w-5 ${
                                isActive ? 'text-white' : `${item.color} group-hover:scale-110`
                              }`} />
                              {item.badge && (
                                <div className="absolute -top-2 -right-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center ${
                                      typeof item.badge === 'string' && item.badge.includes('⚠️')
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-blue-500 text-white'
                                    }`}
                                  >
                                    {typeof item.badge === 'string' && item.badge.includes('⚠️') ? '!' : item.badge}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {isActive && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-l-full"></div>
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-white border shadow-lg p-3 ml-2">
                          <div>
                            <div className="font-semibold text-gray-800">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.description}</div>
                            {item.badge && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {typeof item.badge === 'string' && item.badge.includes('⚠️') 
                                    ? 'Alertas Pendentes' 
                                    : `${item.badge} itens`
                                  }
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  
                  // Modo Expandido - Layout Completo
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={isMobile ? () => setSidebarOpen(false) : undefined}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${item.bgColor} border border-gray-200 shadow-sm scale-[1.02]`
                          : 'hover:bg-gray-50 hover:scale-[1.01] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                          isActive ? item.activeColor : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            isActive ? 'text-white' : `${item.color} group-hover:scale-110`
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm ${
                            isActive ? 'text-gray-800' : 'text-gray-700 group-hover:text-gray-900'
                          }`}>
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-0.5 ${
                              typeof item.badge === 'string' && item.badge.includes('⚠️')
                                ? 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                                : isActive
                                ? 'bg-white/80 text-gray-700'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        
                        {isActive && (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Separador Premium */}
            {!sidebarCollapsed && <div className="mx-4 my-6 border-t border-gray-100"></div>}
            
          </div>
          
          {/* Footer Premium - Configurações e Logout */}
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            {/* Configurações Button */}
            <div className="px-4 py-2 border-b border-gray-100">
              {sidebarCollapsed && !isMobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="group flex items-center justify-center p-3 w-full rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-200">
                      <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-all duration-200">
                        <Settings className="h-5 w-5 text-gray-600 group-hover:scale-110" />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white border shadow-lg p-3 ml-2">
                    <div>
                      <div className="font-semibold text-gray-800">Configurações</div>
                      <div className="text-sm text-gray-500">Preferências do sistema</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button className="group flex items-center gap-3 p-3 w-full rounded-xl hover:bg-gray-50 transition-all duration-200">
                  <div className="p-2 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-all duration-200">
                    <Settings className="h-4 w-4 text-gray-600 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
                      Configurações
                    </div>
                    <div className="text-xs text-gray-500">
                      Preferências do sistema
                    </div>
                  </div>
                </button>
              )}
            </div>
            
            {/* Logout Button */}
            <div className="p-4">
              {sidebarCollapsed && !isMobile ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleLogout}
                      className="group flex items-center justify-center p-3 w-full rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
                    >
                      <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-all duration-200">
                        <LogOut className="h-5 w-5 text-red-600 group-hover:scale-110" />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white border shadow-lg p-3 ml-2">
                    <div>
                      <div className="font-semibold text-red-600">Sair da Conta</div>
                      <div className="text-sm text-gray-500">Encerrar sessão atual</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="group flex items-center gap-3 p-3 w-full rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200"
                >
                  <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-lg transition-all duration-200">
                    <LogOut className="h-4 w-4 text-red-600 group-hover:scale-110" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-red-600 group-hover:text-red-700">
                      Sair da Conta
                    </div>
                    <div className="text-xs text-gray-500">
                      Encerrar sessão atual
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        </TooltipProvider>

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
