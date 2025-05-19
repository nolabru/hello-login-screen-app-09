
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <img 
        src="/lovable-uploads/d0782692-3dfe-4b96-8a00-34b22396d341.png" 
        alt="Portal C'alma Logo" 
        className="w-16 h-16 mb-4"
      />
      <h1 className="text-3xl font-display font-bold text-gray-800">Portal C'alma</h1>
      <p className="font-sans text-gray-600 mt-1">Acesso para profissionais e empresas</p>
    </div>
  );
};

export default Logo;
