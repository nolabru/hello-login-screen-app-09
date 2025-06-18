
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Key, AlertCircle, Flag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PendingAction {
  id: number;
  type: 'license';
  title: string;
  description: string;
}

interface Psychologist {
  id: string;
  name: string;
  email: string;
  crp: string;
  specialization?: string;
  bio?: string;
  phone?: string;
}

interface Company {
  id: number;
  name: string;
  email: string;
  cnpj: string;
  legal_name: string;
  corp_email: string;
}

interface License {
  id: number;
  company_id: string;
  company_name: string;
  plan_name: string;
  total_licenses: number;
  used_licenses: number;
  status: string;
  payment_status: string;
  start_date: string;
  expiry_date: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [psychologistsCount, setPsychologistsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [licensesCount, setLicensesCount] = useState(0);
  const [aiReportsCount, setAiReportsCount] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  
  // For dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'psychologists' | 'companies' | 'licenses' | null>(null);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch count of psychologists
        const { count: psychCount, error: psychError } = await supabase
          .from('psychologists')
          .select('*', { count: 'exact', head: true });
        
        if (psychError) throw psychError;
        setPsychologistsCount(psychCount || 0);
        
        // Fetch count of companies
        const { count: compCount, error: compError } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
        
        if (compError) throw compError;
        setCompaniesCount(compCount || 0);
        
        // Fetch count of issued licenses
        const { count: licCount, error: licError } = await supabase
          .from('company_licenses')
          .select('*', { count: 'exact', head: true });
        
        if (licError) throw licError;
        setLicensesCount(licCount || 0);

        // Fetch count of AI reports
        const { count: aiReportsTotal, error: aiReportsError } = await supabase
          .from('ai_content_reports')
          .select('*', { count: 'exact', head: true });
        
        if (aiReportsError) throw aiReportsError;
        setAiReportsCount(aiReportsTotal || 0);

        // Fetch count of pending AI reports
        const { count: pendingReports, error: pendingReportsError } = await supabase
          .from('ai_content_reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (pendingReportsError) throw pendingReportsError;
        setPendingReportsCount(pendingReports || 0);

        // Não há mais ações pendentes relacionadas a conexões
        setPendingActions([]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar as estatísticas do dashboard.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);


  const handleCardClick = async (type: 'psychologists' | 'companies' | 'licenses') => {
    setDialogType(type);
    setDetailsDialogOpen(true);

    try {
      if (type === 'psychologists') {
        const { data, error } = await supabase
          .from('psychologists')
          .select('id, name, email, crp, specialization, bio, phone')
          .order('name', { ascending: true });
        
        if (error) throw error;
        setPsychologists(data || []);
      } 
      else if (type === 'companies') {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name, email, cnpj, legal_name, corp_email')
          .order('name', { ascending: true });
        
        if (error) throw error;
        setCompanies(data || []);
      } 
      else if (type === 'licenses') {
        // Fetch licenses with company names
        const { data, error } = await supabase
          .from('company_licenses')
          .select(`
            id,
            company_id,
            company:company_id(name),
            plan:plan_id(name),
            total_licenses,
            used_licenses,
            status,
            payment_status,
            start_date,
            expiry_date
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Format the license data
        const formattedLicenses = data?.map(license => ({
          id: license.id,
          company_id: license.company_id,
          company_name: license.company?.name || 'Desconhecida',
          plan_name: license.plan?.name || 'Plano padrão',
          total_licenses: license.total_licenses,
          used_licenses: license.used_licenses || 0,
          status: license.status,
          payment_status: license.payment_status,
          start_date: license.start_date,
          expiry_date: license.expiry_date
        })) || [];
        
        setLicenses(formattedLicenses);
      }
    } catch (error) {
      console.error(`Error fetching ${type} details:`, error);
      toast({
        variant: 'destructive',
        title: `Erro ao carregar detalhes de ${type === 'psychologists' ? 'psicólogos' : type === 'companies' ? 'empresas' : 'licenças'}`,
        description: 'Não foi possível carregar os detalhes solicitados.'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <header>
          <h1 className="text-2xl font-medium text-neutral-700">Painel do Administrador</h1>
          <p className="text-gray-500">Gerenciamento central do Portal Calma</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-purple"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('psychologists')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Psicólogos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground text-portal-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{psychologistsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Psicólogos Cadastrados
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('companies')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground text-portal-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companiesCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Empresas registradas
                  </p>
                </CardContent>
              </Card>
              
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick('licenses')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Licenças</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground text-portal-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{licensesCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Licenças Emitidas
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/ai-reports')}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Denúncias AIA</CardTitle>
                  <Flag className="h-4 w-4 text-muted-foreground text-portal-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiReportsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingReportsCount > 0 ? (
                      <span className="text-amber-600 font-medium">
                        {pendingReportsCount} pendentes
                      </span>
                    ) : (
                      'Todas Analisadas'
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Pendentes</CardTitle>
                  <CardDescription>Itens que requerem sua atenção</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {pendingActions.length > 0 ? (
                    <>
                      {pendingActions.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 py-3 border-b">
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm py-2 text-muted-foreground">
                      Não há ações pendentes no momento.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Dialog for showing details */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'psychologists' ? 'Detalhes dos Psicólogos' : 
               dialogType === 'companies' ? 'Detalhes das Empresas' : 
               'Detalhes das Licenças'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'psychologists' ? `${psychologists.length} psicólogos cadastrados` : 
               dialogType === 'companies' ? `${companies.length} empresas registradas` : 
               `${licenses.length} licenças emitidas`}
            </DialogDescription>
          </DialogHeader>

          {dialogType === 'psychologists' && (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRP</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {psychologists.map((psych) => (
                      <tr key={psych.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{psych.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psych.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psych.crp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psych.specialization || 'Não especificado'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{psych.phone || 'Não informado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dialogType === 'companies' && (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email de Contato</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.legal_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.cnpj}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.corp_email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dialogType === 'licenses' && (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licenças (Usadas/Total)</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {licenses.map((license) => (
                      <tr key={license.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{license.company_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{license.plan_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {license.used_licenses} / {license.total_licenses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            license.status === 'active' ? 'bg-green-100 text-green-800' : 
                            license.status === 'expired' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {license.status === 'active' ? 'Ativa' : 
                             license.status === 'expired' ? 'Expirada' : 
                             license.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            license.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                            license.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {license.payment_status === 'paid' ? 'Pago' : 
                             license.payment_status === 'pending' ? 'Pendente' : 
                             'Não pago'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(license.start_date)} até {formatDate(license.expiry_date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
