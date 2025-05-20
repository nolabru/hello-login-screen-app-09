
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchCompanyLicenses, CompanyLicense, checkLicenseAvailability } from '@/services/licenseService';
import { useToast } from '@/components/ui/use-toast';
import CompanyLicenseInfo from './CompanyLicenseInfo';
import AcquireLicenseDialog from './AcquireLicenseDialog';
import { CirclePlus } from 'lucide-react';

interface CompanyLicensesManagementProps {
  companyId: number;
}

const CompanyLicensesManagement: React.FC<CompanyLicensesManagementProps> = ({ companyId }) => {
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<CompanyLicense[]>([]);
  const [licenseStats, setLicenseStats] = useState({ available: 0, total: 0, used: 0 });
  const [loading, setLoading] = useState(true);
  const [isAcquireDialogOpen, setIsAcquireDialogOpen] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyLicenses(companyId);
      setLicenses(data);
      
      // Buscar estatísticas de disponibilidade
      const availabilityStats = await checkLicenseAvailability(companyId);
      setLicenseStats(availabilityStats);
    } catch (error) {
      console.error('Erro ao buscar licenças:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações das licenças',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchLicenses();
    }
  }, [companyId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-medium">Gerenciamento de Licenças</h2>
          <p className="text-gray-500">Administre as licenças da sua empresa</p>
        </div>
        <Button 
          onClick={() => setIsAcquireDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <CirclePlus size={16} />
          <span>Adquirir Licenças</span>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Resumo de Licenças</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Licenças Totais</p>
              <p className="text-2xl font-bold">{licenseStats.total}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Licenças em Uso</p>
              <p className="text-2xl font-bold">{licenseStats.used}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Licenças Disponíveis</p>
              <p className="text-2xl font-bold">{licenseStats.available}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h3 className="text-lg font-medium mb-4">Planos Ativos</h3>
      {loading ? (
        <p className="text-center py-8">Carregando...</p>
      ) : licenses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Sua empresa ainda não possui planos de licença ativos.</p>
            <Button onClick={() => setIsAcquireDialogOpen(true)}>Adquirir Licenças</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {licenses.map(license => (
            <CompanyLicenseInfo key={license.id} license={license} />
          ))}
        </div>
      )}
      
      <AcquireLicenseDialog 
        open={isAcquireDialogOpen}
        onOpenChange={setIsAcquireDialogOpen}
        companyId={companyId}
        onLicenseAcquired={fetchLicenses}
      />
    </div>
  );
};

export default CompanyLicensesManagement;
