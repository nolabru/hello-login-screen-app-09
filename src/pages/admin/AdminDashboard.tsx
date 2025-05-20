
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboardLayout from '@/components/layout/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Link as LinkIcon, Key, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

interface PendingAction {
  id: number;
  type: 'license' | 'connection';
  title: string;
  description: string;
}

interface RecentActivity {
  id: number;
  action: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [psychologistsCount, setPsychologistsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [licensesCount, setLicensesCount] = useState(0);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
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
        
        // Fetch count of connections (active psychologist-company associations)
        const { count: connCount, error: connError } = await supabase
          .from('company_psychologist_associations')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');
        
        if (connError) throw connError;
        setConnectionsCount(connCount || 0);
        
        // Fetch count of issued licenses
        const { count: licCount, error: licError } = await supabase
          .from('company_licenses')
          .select('*', { count: 'exact', head: true });
        
        if (licError) throw licError;
        setLicensesCount(licCount || 0);

        // Fetch pending actions: pending connection requests and license requests
        const pendingItems: PendingAction[] = [];
        
        // Fetch pending connections
        const { data: pendingConnections, error: pendingConnError } = await supabase
          .from('company_psychologist_associations')
          .select(`
            id,
            psychologist:id_psicologo(nome, email),
            company:id_empresa(name, email)
          `)
          .eq('status', 'pending')
          .limit(5);
        
        if (pendingConnError) throw pendingConnError;
        
        if (pendingConnections) {
          pendingConnections.forEach((conn, index) => {
            pendingItems.push({
              id: conn.id,
              type: 'connection',
              title: 'Nova conexão',
              description: `${conn.psychologist?.nome || 'Psicólogo'} solicitou conexão com ${conn.company?.name || 'Empresa'}`
            });
          });
        }
        
        // For now, just use the pending connections since we don't have a license request table
        // In a real implementation, you would fetch license requests as well
        
        setPendingActions(pendingItems);

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

  const handleViewConnections = () => {
    navigate('/admin/connections');
  };

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <p className="text-gray-500 mt-2">Gerenciamento central do Portal Calma</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portal-purple"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Psicólogos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{psychologistsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Psicólogos cadastrados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companiesCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Empresas registradas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Conexões</CardTitle>
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectionsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Conexões ativas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Licenças</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{licensesCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Licenças emitidas
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {item.type === 'connection' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleViewConnections}
                            >
                              Ver
                            </Button>
                          )}
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações no sistema</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-sm py-2 border-b text-muted-foreground">
                    Nenhuma atividade recente registrada.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
