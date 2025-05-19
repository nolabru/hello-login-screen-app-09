
import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Home, Users, Building2, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [userName, setUserName] = useState('Visitante');
  const [isVisitorMode, setIsVisitorMode] = useState(true);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/pacientes', label: 'Pacientes', icon: Users },
    { path: '/empresas', label: 'Empresas', icon: Building2 },
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Logo showTextLogo={false} size="sm" />
            <span className="font-bold text-lg">Área do Psicólogo</span>
          </Link>
        </div>
        
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">Bem-vindo(a),</p>
          <h2 className="font-bold text-xl">{userName}</h2>
          {isVisitorMode && (
            <p className="text-sm text-orange-500">Você está no modo visitante</p>
          )}
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
          <Link to="/" className="flex items-center px-4 py-3 text-sm text-purple-600 hover:bg-purple-50">
            <LogOut className="h-5 w-5 mr-3" />
            Fazer Login
          </Link>
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
