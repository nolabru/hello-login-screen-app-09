import React from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import CompanyPsychologistsList from '@/components/dashboard/company/CompanyPsychologistsList';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
const CompanyPsychologists: React.FC = () => {
  return <>
      <Helmet>
        <title>Psicólogos | Área da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium   text-neutral-700">Psicólogos Parceiros</h1>
              <p className="text-gray-500">Gerencie os psicólogos que atendem sua empresa</p>
            </div>
            
            
          </div>
          
          <CompanyPsychologistsList />
        </div>
      </CompanyDashboardLayout>
    </>;
};
export default CompanyPsychologists;