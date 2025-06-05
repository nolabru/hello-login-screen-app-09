import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const CompanyPsychologistsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-medium text-neutral-700 text-xl">Psicólogos da Empresa</h2>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade Indisponível</h3>
          <p className="text-gray-500 max-w-md">
            A funcionalidade de associação entre empresas e psicólogos foi removida do sistema.
            Entre em contato com o suporte para mais informações.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPsychologistsList;
