
import React from 'react';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-portal">
      <div className="flex flex-col items-center w-full max-w-md p-6">
        <Logo />
        <LoginForm />
      </div>
    </div>
  );
};

export default Index;
