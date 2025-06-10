import React from 'react';
import { Helmet } from 'react-helmet';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Helmet>
        <title>Política de Privacidade | Calma</title>
      </Helmet>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-sm rounded-lg p-8">
        <div className="space-y-6">
          {/* Título principal */}
          <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
          
          {/* Data de atualização */}
          <p className="text-sm text-gray-500">Última atualização: 13 de Abril de 2025</p>
          
          {/* 1. Informações Coletadas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">1. Informações Coletadas</h2>
            <p className="mt-2 text-gray-600">
              Coletamos informações pessoais que você fornece diretamente, como nome, endereço de e-mail, e entradas de diário. 
              Também coletamos informações sobre como você usa o aplicativo.
            </p>
          </div>
          
          {/* 2. Uso das Informações */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">2. Uso das Informações</h2>
            <p className="mt-2 text-gray-600">
              Usamos suas informações para fornecer e melhorar nossos serviços, personalizar sua experiência, e desenvolver novos recursos. 
              Suas entradas de diário são usadas para treinar nossa IA para fornecer respostas mais relevantes.
            </p>
          </div>
          
          {/* 3. Compartilhamento de Informações */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">3. Compartilhamento de Informações</h2>
            <p className="mt-2 text-gray-600">
              Não vendemos ou alugamos suas informações pessoais a terceiros. 
              Podemos compartilhar informações com prestadores de serviços que nos ajudam a operar o aplicativo.
            </p>
          </div>
          
          {/* 4. Segurança */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">4. Segurança</h2>
            <p className="mt-2 text-gray-600">
              Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado ou alteração. 
              No entanto, nenhum método de transmissão pela Internet é 100% seguro.
            </p>
          </div>
          
          {/* 5. Seus Direitos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">5. Seus Direitos</h2>
            <p className="mt-2 text-gray-600">
              Você tem direito de acessar, corrigir ou excluir suas informações pessoais. 
              Para exercer esses direitos, entre em contato conosco.
            </p>
          </div>
          
          {/* 6. Alterações na Política */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">6. Alterações na Política</h2>
            <p className="mt-2 text-gray-600">
              Podemos atualizar nossa Política de Privacidade periodicamente. 
              Notificaremos você sobre quaisquer alterações publicando a nova política no aplicativo.
            </p>
          </div>
          
          {/* 7. Contato */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800">7. Contato</h2>
            <p className="mt-2 text-gray-600">
              Para dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo email: privacidade@calma-app.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
