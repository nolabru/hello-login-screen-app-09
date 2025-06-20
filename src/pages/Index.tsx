
import React from 'react';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import { Helmet } from 'react-helmet';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Portal Calma - Login</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-portal">
        <div className="flex flex-col items-center w-full max-w-md p-6">
          <Logo size="md" />
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default Index;
