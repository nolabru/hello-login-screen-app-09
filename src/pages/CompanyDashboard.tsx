import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import AddEmployeeDialog from '@/components/dashboard/company/AddEmployeeDialog';
import CompanySentimentChart from '@/components/dashboard/company/CompanySentimentChart';
import { checkLicenseAvailability, updateLicenseCountForExistingEmployees } from '@/services/licenseService';
import { fetchCompanyPsychologists } from '@/integrations/supabase/companyPsychologistsService';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw } from 'lucide-react';
import { useCompanySentimentData } from '@/hooks/useCompanySentimentData';

// Usando any para o tipo do Supabase para contornar erros de tipo
const supabaseAny: any = supabase;
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
    availableLicenses: 0,
    totalLicenses: 0
  });
  
  // Usar o hook para obter o índice de bem-estar
  const { wellBeingIndex, getWellBeingColor } = useCompanySentimentData('week');
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const companyIdStr = localStorage.getItem('companyId');
        if (!companyIdStr) return;
        setCompanyId(companyIdStr);

        // Get company name - convertendo o ID para número para a consulta
        const companyIdNum = parseInt(companyIdStr, 10);
        const {
          data: company
        } = await supabase.from('companies').select('name').eq('id', companyIdNum).single();
        if (company) {
          setCompanyName(company.name);
        }

        // Fetch real stats - contagem de funcionários sem filtrar por status
        const {
          data: employees
        } = await supabase.from('user_profiles').select('id')
          .eq('company_id', companyIdStr);
        
        // Contagem total de funcionários vinculados à empresa
        const totalEmployees = employees?.length || 0;
        
        // Buscar psicólogos ativos diretamente usando o serviço
        console.log('Buscando psicólogos ativos para a empresa:', companyIdStr);
        const psychologists = await fetchCompanyPsychologists(companyIdStr);
        const activePsychs = psychologists.length;
        
        // Buscar psicólogos pendentes usando supabaseAny para evitar erros de tipo
        console.log('Buscando psicólogos pendentes para a empresa:', companyIdStr);
        const { data: pendingPsychologistsData, error: pendingError } = await supabaseAny
          .from('company_psychologists')
          .select('*')
          .eq('company_id', companyIdStr)
          .eq('status', 'pending')
          .is('ended_at', null);
          
        if (pendingError) {
          console.error('Erro ao buscar psicólogos pendentes:', pendingError);
        }
        
        const pendingPsychs = pendingPsychologistsData?.length || 0;
        console.log('Psicólogos pendentes encontrados:', pendingPsychs);

        // Fetch license availability
        const licenseStats = await checkLicenseAvailability(companyIdStr);
        setStats({
          activeEmployees: totalEmployees, // Todos os funcionários vinculados à empresa
          pendingEmployees: 0, // Não estamos mais usando a distinção entre ativos e pendentes
          activePsychologists: activePsychs,
          pendingPsychologists: pendingPsychs,
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
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
            <h2 className="font-medium text-lg text-purple-800 mb-2">Bem-vindo(a) ao Painel da sua Empresa!</h2>
            <p className="text-purple-700">
              Aqui você acompanha, de forma <strong>anonimizada</strong>, o bem-estar do seu grupo de funcionários no app, sempre respeitando a privacidade individual.
            </p>
          </div>
          
          {/* Gráfico de Sentimentos */}
          <div className="mb-8">
            <CompanySentimentChart />
          </div>
          
          <div className="space-y-8">
              {/* Primeira linha - Funcionários */}
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4  text-neutral-700">
                  Funcionários
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 1 - Funcionários Ativos */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Funcionários Ativos</h3>
                      </div>
                      <p className="text-4xl font-bold text-portal-purple">{stats.activeEmployees}</p>
                      <p className="text-sm text-gray-500 mt-2">{stats.activeEmployees} Funcionários Usando o App</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 2 - Funcionários Pendentes */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Funcionários Pendentes</h3>
                      </div>
                      <p className="text-4xl font-bold text-portal-purple">{stats.pendingEmployees}</p>
                      <p className="text-sm text-gray-500 mt-2">Aguardando Ativação de Conta</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Segunda linha - Psicólogos */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium text-neutral-700">
                    Psicólogos
                  </h2>
                  {companyId && (
                    <Button 
                      onClick={async () => {
                        try {
                          // Buscar psicólogos ativos
                          const psychologists = await fetchCompanyPsychologists(companyId);
                          const activePsychs = psychologists.length;
                          
                          // Buscar psicólogos pendentes
                          const { data: pendingPsychologistsData, error: pendingError } = await supabaseAny
                            .from('company_psychologists')
                            .select('*')
                            .eq('company_id', companyId)
                            .eq('status', 'pending')
                            .is('ended_at', null);
                            
                          if (pendingError) {
                            console.error('Erro ao buscar psicólogos pendentes:', pendingError);
                            throw pendingError;
                          }
                          
                          const pendingPsychs = pendingPsychologistsData?.length || 0;
                          
                          // Atualizar estatísticas
                          setStats(prev => ({
                            ...prev,
                            activePsychologists: activePsychs,
                            pendingPsychologists: pendingPsychs
                          }));
                          
                          toast({
                            title: 'Psicólogos Atualizados',
                            description: `${activePsychs} ativos e ${pendingPsychs} pendentes`
                          });
                        } catch (error) {
                          console.error('Erro ao atualizar psicólogos:', error);
                          toast({
                            title: 'Erro',
                            description: 'Não foi possível atualizar a lista de psicólogos.',
                            variant: 'destructive'
                          });
                        }
                      }}
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Atualizar Psicólogos</span>
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 3 - Psicólogos Associados */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Psicólogos Associados</h3>
                      </div>
                      <p className="text-4xl font-bold text-portal-purple">{stats.activePsychologists}</p>
                      <p className="text-sm text-gray-500 mt-2">Profissionais Ativos</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 4 - Psicólogos Pendentes */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Psicólogos Pendentes</h3>
                      </div>
                      <p className="text-4xl font-bold text-portal-purple">{stats.pendingPsychologists}</p>
                      <p className="text-sm text-gray-500 mt-2">Aguardando Aprovação</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Terceira linha - Licenças e Índice */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium text-neutral-700">
                    Licenças e Bem-estar
                  </h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => window.location.reload()}
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Atualizar Índice</span>
                    </Button>
                    
                    {companyId && (
                      <Button 
                        onClick={async () => {
                          try {
                            await updateLicenseCountForExistingEmployees(companyId);
                            
                            // Atualizar as estatísticas após a atualização do contador
                            const licenseStats = await checkLicenseAvailability(companyId);
                            setStats(prev => ({
                              ...prev,
                              availableLicenses: licenseStats.available,
                              totalLicenses: licenseStats.total
                            }));
                            
                            toast({
                              title: 'Contador de Licenças Atualizado',
                              description: 'O contador de licenças foi atualizado com base nos funcionários existentes.'
                            });
                          } catch (error) {
                            console.error('Erro ao atualizar contador de licenças:', error);
                            toast({
                              title: 'Erro',
                              description: 'Não foi possível atualizar o contador de licenças. Tente novamente.',
                              variant: 'destructive'
                            });
                          }
                        }}
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Atualizar Licenças</span>
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card 5 - Licenças Disponíveis */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Licenças Disponíveis</h3>
                      </div>
                      <p className="text-4xl font-bold text-portal-purple">{stats.availableLicenses}</p>
                      <p className="text-sm text-gray-500 mt-2">De {stats.totalLicenses} Licenças Totais</p>
                    </CardContent>
                  </Card>
                  
                  {/* Card 6 - Índice de Bem-estar */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-2">
                        <h3 className="text-gray-700">Índice de Bem-Estar</h3>
                      </div>
                      <p 
                        className="text-4xl font-bold" 
                        style={{ color: getWellBeingColor(wellBeingIndex) }}
                      >
                        {wellBeingIndex === 'N/A' ? 'N/A' : `${wellBeingIndex}/100`}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {wellBeingIndex === 'N/A' 
                          ? 'Sem dados suficientes' 
                          : wellBeingIndex >= 80 
                            ? 'Excelente' 
                            : wellBeingIndex >= 60 
                              ? 'Bom' 
                              : wellBeingIndex >= 40 
                                ? 'Médio' 
                                : wellBeingIndex >= 20 
                                  ? 'Preocupante' 
                                  : 'Crítico'
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
          </div>
        </div>
        
        {companyId && <AddEmployeeDialog open={isAddEmployeeDialogOpen} onOpenChange={setIsAddEmployeeDialogOpen} onEmployeeAdded={() => {
        // Refresh the stats after adding an employee
        const fetchStats = async () => {
          // Buscar funcionários
          const {
            data: employees
          } = await supabase.from('user_profiles').select('id')
            .eq('company_id', companyId);
          const totalEmployees = employees?.length || 0;
          
          // Buscar psicólogos ativos
          const psychologists = await fetchCompanyPsychologists(companyId);
          const activePsychs = psychologists.length;
          
          // Buscar psicólogos pendentes
          const { data: pendingPsychologistsData } = await supabaseAny
            .from('company_psychologists')
            .select('*')
            .eq('company_id', companyId)
            .eq('status', 'pending')
            .is('ended_at', null);
            
          const pendingPsychs = pendingPsychologistsData?.length || 0;
          
          // Atualizar informações de licenças
          const licenseStats = await checkLicenseAvailability(companyId);
          
          // Atualizar estatísticas
          setStats(prev => ({
            ...prev,
            activeEmployees: totalEmployees,
            pendingEmployees: 0, // Não estamos mais usando a distinção entre ativos e pendentes
            activePsychologists: activePsychs,
            pendingPsychologists: pendingPsychs,
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
