
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-300 via-portal-purple to-blue-400 shadow-lg mb-4"></div>
      <h1 className="text-3xl font-bold text-gray-800">Portal C'alma</h1>
      <p className="text-gray-600 mt-1">Acesso para profissionais e empresas</p>
    </div>
  );
};

export default Logo;
