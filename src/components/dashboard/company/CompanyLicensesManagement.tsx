import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  fetchCompanyLicenses, 
  CompanyLicense, 
  checkLicenseAvailability,
  updateLicenseCountForExistingEmployees
} from '@/services/licenseService';
import { useToast } from '@/components/ui/use-toast';
import CompanyLicenseInfo from './CompanyLicenseInfo';
import AcquireLicenseDialog from './AcquireLicenseDialog';
import { CirclePlus, RefreshCw } from 'lucide-react';
interface CompanyLicensesManagementProps {
  companyId: string;
}
const CompanyLicensesManagement: React.FC<CompanyLicensesManagementProps> = ({
  companyId
}) => {
  const {
    toast
  } = useToast();
  const [licenses, setLicenses] = useState<CompanyLicense[]>([]);
  const [licenseStats, setLicenseStats] = useState({
    available: 0,
    total: 0,
    used: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAcquireDialogOpen, setIsAcquireDialogOpen] = useState(false);
  const [isUpdatingLicenses, setIsUpdatingLicenses] = useState(false);
  const fetchLicenses = async () => {
    setLoading(true);
    try {
      console.log('CompanyLicensesManagement - Buscando licenças para a empresa:', companyId);
      
      const data = await fetchCompanyLicenses(companyId);
      console.log('CompanyLicensesManagement - Licenças retornadas:', data.length);
      
      // Filter out licenses that have been canceled
      const activeLicenses = data.filter(license => !(license.payment_status === 'canceled' || license.status === 'canceled'));
      console.log('CompanyLicensesManagement - Licenças ativas após filtro:', activeLicenses.length);
      
      // Log de cada licença ativa
      activeLicenses.forEach((license, index) => {
        console.log(`CompanyLicensesManagement - Licença ${index + 1}:`, {
          id: license.id,
          plan_id: license.plan_id,
          status: license.status,
          payment_status: license.payment_status,
          total_licenses: license.total_licenses,
          used_licenses: license.used_licenses,
          plan: license.plan ? `${license.plan.name} (${license.plan.id})` : 'Plano não encontrado'
        });
      });
      
      setLicenses(activeLicenses);

      // Buscar estatísticas de disponibilidade
      console.log('CompanyLicensesManagement - Buscando estatísticas de disponibilidade');
      const availabilityStats = await checkLicenseAvailability(companyId);
      console.log('CompanyLicensesManagement - Estatísticas de disponibilidade:', availabilityStats);
      
      setLicenseStats(availabilityStats);
    } catch (error) {
      console.error('Erro ao buscar licenças:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações das licenças',
        variant: 'destructive'
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

  // Função para atualizar o contador de licenças com base nos funcionários existentes
  const handleUpdateLicenseCount = async () => {
    setIsUpdatingLicenses(true);
    try {
      await updateLicenseCountForExistingEmployees(companyId);
      
      toast({
        title: 'Contador de Licenças Atualizado',
        description: 'O contador de licenças foi atualizado com base nos funcionários existentes.'
      });
      
      // Recarregar os dados para exibir o contador atualizado
      await fetchLicenses();
    } catch (error) {
      console.error('Erro ao atualizar contador de licenças:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o contador de licenças. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdatingLicenses(false);
    }
  };
  return <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          
          
        </div>
        <Button onClick={() => setIsAcquireDialogOpen(true)} className="flex items-center gap-2 bg-portal-purple hover:bg-portal-purple-dark">
          <CirclePlus size={16} />
          <span>Adquirir Planos</span>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-neutral-700">Resumo de Licenças</h3>
            <Button 
              onClick={handleUpdateLicenseCount} 
              disabled={isUpdatingLicenses || loading} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isUpdatingLicenses ? 'animate-spin' : ''}`} />
              <span>{isUpdatingLicenses ? 'Atualizando...' : 'Atualizar Contador'}</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Total de Licenças</p>
              <p className="text-2xl font-bold text-portal-purple">{licenseStats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Capacidade Total dos Planos</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Funcionários Ativos</p>
              <p className="text-2xl font-bold text-portal-purple">{licenseStats.used}</p>
              <p className="text-xs text-gray-500 mt-1">Funcionários Ativos</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500">Licenças Restantes</p>
              <p className="text-2xl font-bold text-portal-purple">{licenseStats.available}</p>
              <p className="text-xs text-gray-500 mt-1">Usuários que Podem ser Adicionados</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-700">Licenças Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{licenseStats.pending}</p>
              <p className="text-xs text-yellow-600 mt-1">Aguardando Ativação de Plano</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h3 className="text-lg font-medium mb-4  text-neutral-700">Planos Ativos</h3>
      {loading ? <p className="text-center py-8">Carregando...</p> : licenses.length === 0 ? <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4  text-neutral-700">Sua empresa ainda não possui planos de licença ativos.</p>
            <Button onClick={() => setIsAcquireDialogOpen(true)} className="bg-portal-purple hover:bg-portal-purple-dark">Adquirir Planos</Button>
          </CardContent>
        </Card> : <div className="space-y-4">
          {licenses.map(license => <CompanyLicenseInfo key={license.id} license={license} companyId={companyId} onLicenseUpdated={fetchLicenses} />)}
        </div>}
      
      <AcquireLicenseDialog open={isAcquireDialogOpen} onOpenChange={setIsAcquireDialogOpen} companyId={companyId} onLicenseAcquired={fetchLicenses} />
    </div>;
};
export default CompanyLicensesManagement;
