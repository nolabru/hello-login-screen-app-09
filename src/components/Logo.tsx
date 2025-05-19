
import React from 'react';

interface LogoProps {
  showTextLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ showTextLogo = true, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center mb-8">
      <img 
        src="/lovable-uploads/d0782692-3dfe-4b96-8a00-34b22396d341.png" 
        alt="Portal Calma Logo" 
        className={`${sizeClasses[size]} mb-4`}
      />
      {showTextLogo && (
        <>
          <h1 className="text-3xl font-display font-bold text-gray-800">Portal Calma</h1>
          <p className="font-sans text-gray-600 mt-1">Acesso para profissionais e empresas</p>
        </>
      )}
    </div>
  );
};

export default Logo;
