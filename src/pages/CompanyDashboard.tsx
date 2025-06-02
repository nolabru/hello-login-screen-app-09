import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyPsychologistsList from '@/components/dashboard/company/CompanyPsychologistsList';
import CompanyEmployeesList from '@/components/dashboard/company/CompanyEmployeesList';
import AddEmployeeDialog from '@/components/dashboard/company/AddEmployeeDialog';
import CompanyLicensesManagement from '@/components/dashboard/company/CompanyLicensesManagement';
import { checkLicenseAvailability } from '@/services/licenseService';
import { useToast } from '@/components/ui/use-toast';
const CompanyDashboard: React.FC = () => {
  const {
    toast
  } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    activeEmployees: 0,
    pendingEmployees: 0,
    activePsychologists: 0,
    pendingPsychologists: 0,
    wellBeingIndex: 'N/A',
    availableLicenses: 0,
    totalLicenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return;
        const companyIdNumber = parseInt(companyId, 10);
        setCompanyId(companyIdNumber);

        // Get company name
        const {
          data: company
        } = await supabase.from('companies').select('name').eq('id', companyIdNumber).single();
        if (company) {
          setCompanyName(company.name);
        }

        // Fetch real stats
        const {
          data: employees
        } = await supabase.from('user_profiles').select('id, status').eq('id_empresa', companyIdNumber);
        const {
          data: psychologists
        } = await supabase.from('company_psychologist_associations').select('id, status').eq('id_empresa', companyIdNumber);
        const activeEmps = employees?.filter(emp => emp.status).length || 0;
        const pendingEmps = employees?.filter(emp => !emp.status).length || 0;
        const activePsychs = psychologists?.filter(psy => psy.status === 'active').length || 0;
        const pendingPsychs = psychologists?.filter(psy => psy.status === 'pending').length || 0;

        // Fetch license availability
        const licenseStats = await checkLicenseAvailability(companyIdNumber);
        setStats({
          activeEmployees: activeEmps,
          pendingEmployees: pendingEmps,
          activePsychologists: activePsychs,
          pendingPsychologists: pendingPsychs,
          wellBeingIndex: 'N/A',
          availableLicenses: licenseStats.available,
          totalLicenses: licenseStats.total
        });
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, []);
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyEmail');

    // Redirect to home page
    window.location.href = '/';
  };
  return <>
      <Helmet>
        <title>Dashboard da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium">{companyName}</h1>
              <p className="text-gray-500">{localStorage.getItem('companyEmail')}</p>
            </div>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={handleLogout}>
              <span className="mr-1">Sair</span>
            </Button>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
            <h2 className="font-medium text-lg text-purple-800 mb-2">Bem-vindo(a) ao painel da sua empresa!</h2>
            <p className="text-purple-700">
              Aqui você acompanha, de forma <strong>anonimizada</strong>, o bem-estar do seu grupo de funcionários no app, sempre respeitando a privacidade individual.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="employees">Funcionários</TabsTrigger>
              <TabsTrigger value="psychologists">Psicólogos</TabsTrigger>
              <TabsTrigger value="licenses">Licenças</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              <div className="flex justify-end gap-4 mb-6">
                <Button className="bg-indigo-900 hover:bg-indigo-800" onClick={() => setIsAddEmployeeDialogOpen(true)} disabled={stats.availableLicenses <= 0} title={stats.availableLicenses <= 0 ? "Sem licenças disponíveis" : ""}>
                  Adicionar Funcionário
                </Button>
                <Button variant="outline" className="border-indigo-900 text-indigo-900 hover:bg-indigo-50">
                  Buscar Psicólogos
                </Button>
              </div>
              
              {/* Primeira linha - Funcionários */}
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">
                  Funcionários
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 - Funcionários Ativos */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Funcionários Ativos</h3>
                      </div>
                      <p className="text-4xl font-bold text-blue-500">{stats.activeEmployees}</p>
                      <p className="text-sm text-gray-500 mt-2">{stats.activeEmployees} funcionários usando o app</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 2 - Funcionários Pendentes */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Funcionários Pendentes</h3>
                      </div>
                      <p className="text-4xl font-bold text-orange-500">{stats.pendingEmployees}</p>
                      <p className="text-sm text-gray-500 mt-2">Aguardando ativação de conta</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Segunda linha - Psicólogos */}
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">
                  Psicólogos
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 3 - Psicólogos Associados */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Psicólogos Associados</h3>
                      </div>
                      <p className="text-4xl font-bold text-green-500">{stats.activePsychologists}</p>
                      <p className="text-sm text-gray-500 mt-2">Profissionais ativos</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 4 - Psicólogos Pendentes */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Psicólogos Pendentes</h3>
                      </div>
                      <p className="text-4xl font-bold text-purple-500">{stats.pendingPsychologists}</p>
                      <p className="text-sm text-gray-500 mt-2">Aguardando aprovação</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Terceira linha - Licenças e Índice */}
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">
                  Licenças e Bem-estar
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 5 - Licenças Disponíveis */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Licenças Disponíveis</h3>
                      </div>
                      <p className="text-4xl font-bold text-indigo-500">{stats.availableLicenses}</p>
                      <p className="text-sm text-gray-500 mt-2">De {stats.totalLicenses} licenças totais</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 6 - Índice de Bem-estar */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Índice de Bem-estar</h3>
                      </div>
                      <p className="text-4xl font-bold text-indigo-500">{stats.wellBeingIndex}</p>
                      <p className="text-sm text-gray-500 mt-2">Média atual da equipe</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-medium mb-4">
                  Tendências de Saúde Mental
                </h2>
                <Card>
                  <CardContent className="p-6 h-60 flex items-center justify-center">
                    <p className="text-gray-500">Dados anonimizados do grupo</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="employees">
              <CompanyEmployeesList />
            </TabsContent>
            
            <TabsContent value="psychologists">
              <CompanyPsychologistsList />
            </TabsContent>
            
            <TabsContent value="licenses">
              {companyId && <CompanyLicensesManagement companyId={companyId} />}
            </TabsContent>
          </Tabs>
        </div>
        
        {companyId && <AddEmployeeDialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen} onEmployeeAdded={() => {
        // Refresh the stats after adding an employee
        const fetchStats = async () => {
          const {
            data: employees
          } = await supabase.from('user_profiles').select('id, status').eq('id_empresa', companyId);
          const activeEmps = employees?.filter(emp => emp.status).length || 0;
          const pendingEmps = employees?.filter(emp => !emp.status).length || 0;

          // Also update license information
          const licenseStats = await checkLicenseAvailability(companyId);
          setStats(prev => ({
            ...prev,
            activeEmployees: activeEmps,
            pendingEmployees: pendingEmps,
            availableLicenses: licenseStats.available,
            totalLicenses: licenseStats.total
          }));
        };
        fetchStats();
      }} companyId={companyId} />}
      </CompanyDashboardLayout>
    </>;
};
export default CompanyDashboard;