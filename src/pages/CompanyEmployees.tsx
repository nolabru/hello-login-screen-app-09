import React from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import CompanyEmployeesList from '@/components/dashboard/company/CompanyEmployeesList';
const CompanyEmployees: React.FC = () => {
  return <>
      <Helmet>
        <title>Funcionários | Área da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium">Gerenciar Funcionários</h1>
              <p className="text-gray-500">Adicione e gerencie os funcionários da sua empresa</p>
            </div>
          </div>
          
          <CompanyEmployeesList />
        </div>
      </CompanyDashboardLayout>
    </>;
};
export default CompanyEmployees;