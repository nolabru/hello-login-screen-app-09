
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import CompanyDashboardLayout from '@/components/layout/CompanyDashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, UserPlus, Users, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const CompanyDashboard: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [stats, setStats] = useState({
    activeEmployees: 0,
    pendingEmployees: 0,
    activePsychologists: 0,
    pendingPsychologists: 0,
    wellBeingIndex: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      try {
        const companyId = localStorage.getItem('companyId');
        if (!companyId) return;
        
        const companyIdNumber = parseInt(companyId, 10);
        
        // Get company name
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', companyIdNumber)
          .single();
          
        if (company) {
          setCompanyName(company.name);
        }
        
        // For now, using mock data for stats
        // In a real implementation, you would fetch this from the database
        setStats({
          activeEmployees: 0,
          pendingEmployees: 0,
          activePsychologists: 0,
          pendingPsychologists: 0,
          wellBeingIndex: 'N/A'
        });
        
      } catch (error) {
        console.error('Erro ao buscar dados da empresa:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanyData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard da Empresa</title>
      </Helmet>
      <CompanyDashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-medium mb-2">{companyName}</h1>
              <p className="text-gray-500">{localStorage.getItem('companyEmail')}</p>
            </div>
            <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
              <span className="mr-1">Sair</span>
            </Button>
          </div>
          
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-6 mb-8">
            <h2 className="font-medium text-lg text-purple-800 mb-2">Bem-vindo(a) ao painel da sua empresa!</h2>
            <p className="text-purple-700">
              Aqui você acompanha, de forma <strong>anonimizada</strong>, o bem-estar do seu grupo de funcionários no app, sempre respeitando a privacidade individual.
            </p>
          </div>
          
          <div className="flex justify-end gap-4 mb-6">
            <Button className="bg-indigo-900 hover:bg-indigo-800">
              <UserPlus size={16} className="mr-2" />
              Adicionar Funcionário
            </Button>
            <Button variant="outline" className="border-indigo-900 text-indigo-900 hover:bg-indigo-50">
              <UserCheck size={16} className="mr-2" />
              Buscar Psicólogos
            </Button>
          </div>
          
          <div className="mb-8">
            <h2 className="flex items-center text-xl font-medium mb-4">
              <Clock size={20} className="text-indigo-500 mr-2" />
              Visão geral do grupo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1 - Funcionários Ativos */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700">Funcionários Ativos</h3>
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-4xl font-bold text-blue-500">0</p>
                  <p className="text-sm text-gray-500 mt-2">0 funcionários usando o app</p>
                </CardContent>
              </Card>
              
              {/* Card 2 - Funcionários Pendentes */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700">Funcionários Pendentes</h3>
                    <UserPlus className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-4xl font-bold text-orange-500">0</p>
                  <p className="text-sm text-gray-500 mt-2">Aguardando ativação de conta</p>
                </CardContent>
              </Card>
              
              {/* Card 3 - Psicólogos Associados */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700">Psicólogos Associados</h3>
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-4xl font-bold text-green-500">0</p>
                  <p className="text-sm text-gray-500 mt-2">Profissionais ativos</p>
                </CardContent>
              </Card>
              
              {/* Card 4 - Psicólogos Pendentes */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700">Psicólogos Pendentes</h3>
                    <Clock className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-4xl font-bold text-purple-500">0</p>
                  <p className="text-sm text-gray-500 mt-2">Aguardando aprovação</p>
                </CardContent>
              </Card>
              
              {/* Card 5 - Índice de Bem-estar */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-700">Índice de Bem-estar</h3>
                    <div className="h-5 w-5 text-indigo-500">📊</div>
                  </div>
                  <p className="text-4xl font-bold text-indigo-500">N/A</p>
                  <p className="text-sm text-gray-500 mt-2">Média atual da equipe</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="flex items-center text-xl font-medium mb-4">
              <span className="text-indigo-500 mr-2">📈</span>
              Tendências de Saúde Mental
            </h2>
            <Card>
              <CardContent className="p-6 h-60 flex items-center justify-center">
                <p className="text-gray-500">Dados anonimizados do grupo</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CompanyDashboardLayout>
    </>
  );
};

export default CompanyDashboard;
