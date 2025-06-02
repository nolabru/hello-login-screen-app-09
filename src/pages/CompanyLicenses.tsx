import React from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import CompanyLicensesManagement from '@/components/dashboard/company/CompanyLicensesManagement';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
const CompanyLicenses: React.FC = () => {
  const {
    toast
  } = useToast();
  const [companyId, setCompanyId] = useState<number | null>(null);
  useEffect(() => {
    // Fetch the company ID from local storage
    const storedCompanyId = localStorage.getItem('companyId');
    if (!storedCompanyId) {
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível identificar a empresa. Por favor, faça login novamente.",
        variant: "destructive"
      });
      return;
    }
    setCompanyId(parseInt(storedCompanyId, 10));
  }, [toast]);
  return <>
      <Helmet>
        <title>Licenças | Área da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium">Gerenciamento de Licenças</h1>
              <p className="text-gray-500">Gerencie as licenças e planos da sua empresa</p>
            </div>
          </div>
          
          {companyId && <CompanyLicensesManagement companyId={companyId} />}
        </div>
      </CompanyDashboardLayout>
    </>;
};
export default CompanyLicenses;