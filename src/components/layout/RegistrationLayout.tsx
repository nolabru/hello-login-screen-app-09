
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

interface RegistrationLayoutProps {
  children: ReactNode;
}

const RegistrationLayout: React.FC<RegistrationLayoutProps> = ({ children }) => {
  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="min-h-screen bg-gradient-portal">
        <div className="w-full p-6">
          <Link to="/" className="text-gray-700 flex items-center hover:underline">
            <ArrowLeft size={20} className="mr-2" />
            Voltar
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 -mt-8">
          {/* Logo with spacing */}
          <div className="mb-8">
            <Logo showTextLogo={true} size="lg" />
          </div>
          
          {/* Portal Calma title with special font */}
          <div className="mb-8">
            <h1 className="font-display text-3xl text-center text-purple-700">Portal Calma</h1>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};

export default RegistrationLayout;
